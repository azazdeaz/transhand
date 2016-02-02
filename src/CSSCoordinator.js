import React from 'react'
import ReactDOM from 'react-dom'
import heuristicGlobalToLocal from './heuristicGlobalToLocal'
import getGlobalBoundingClientRect from './getGlobalBoundingClientRect'
import findWhere from 'lodash/collection/findWhere'
import mapKeys from 'lodash/object/mapKeys'
import camelCase from 'lodash/string/camelCase'

const TRANSFORM_PROPS = ['transform', 'transform-origin', 'prespective',
  'prespective-origin', 'transform-style']
const NULL_VALUES = ['none', 'matrix(1, 0, 0, 1, 0, 0)']
const NULL_TRANSFORM = 'matrix(1, 0, 0, 1, 0, 0)' //none dosen't alwasy trigger a refresh in Chrome

export default class CSSCoordinator {
  constructor() {
    this._buffMockDiv = []
    this._picker = <div key='picker'/>

    this._mockMount = document.createElement('div')
    this._mockMount.style.pointerEvents = 'none'
    this._mockMount.style.opacity = 0
    this._mockMount.style.position = 'absolute'
    this._mockMount.style.top = '0px'
    this._mockMount.style.left = '0px'
    this._mockMount.setAttribute('transhand-dom-tree-mock', 1) //just for debug
    document.body.appendChild(this._mockMount)
  }

  destroy() {
    if (this._mockMount.parentNode) {
      this._mockMount.parentNode.removeChild(this._mockMount)
    }
  }

  localToGlobal(p) {

    if (this._hasTransform) {
      let dePicker = this._dePicker
      if (!dePicker) return p

      dePicker.style.left = p.x + 'px'
      dePicker.style.top = p.y + 'px'

      let br = dePicker.getBoundingClientRect()

      return {
        x: br.left,
        y: br.top,
      }
    }
    else {
      return p
    }
  }

  globalToLocal(p) {

    if (this._hasTransform) {
      let dePicker = this._dePicker
      if (!dePicker) return p

      let ret = heuristicGlobalToLocal(p, dePicker)

      return ret
    }
    else {
      return p
    }
  }

  setLocalRoot(deParent, deTarget, onDone) {
    var done = () => {
      this.isProcessing = false

      if (this.onProcessingDone) {
        this.onProcessingDone(this._rect)
        this.onProcessingDone = undefined
      }
    }

    var walkBack = (de) => {

      if (!de || de === window.document.body) return

      if (de.nodeName === '#document') {

        var iframes = de.defaultView.parent.document.querySelectorAll('iframe')
        var iframe = findWhere(iframes, {contentDocument: de})

        if (iframe) {
          walkBack(iframe)
          return
        }
        else {
          return
        }
      }

      var reg
      var computedStyle = window.getComputedStyle(de)

      TRANSFORM_PROPS.forEach(function (propName) {

        var value = computedStyle.getPropertyValue(propName)
        if (value && NULL_VALUES.indexOf(value) === -1) {
          set(propName, value)
        }
      })

      walkBack(de.parentNode)

      function set(propName, value) {

        if (!reg) {
          reg = {
            de: de,
            inlineTransform: de.style.transform,
            style: {}
          }

          transformeds.unshift(reg)
        }

        de.style.transform = NULL_TRANSFORM
        reg.style[propName] = value
      }
    }

    var setRect = () => {
      let inlineTransform = deTarget.style.transform
      deTarget.style.transform = NULL_TRANSFORM

      let brA = getGlobalBoundingClientRect(deTarget)

      if (this._hasTransform) {
        let brB = getGlobalBoundingClientRect(deParent)

        this._rect = {
          x: brA.left - brB.left,
          y: brA.top - brB.top,
          w: brA.width,
          h: brA.height,
        }
      }
      else {
        this._rect = {
          x: brA.left,
          y: brA.top,
          w: brA.width,
          h: brA.height,
        }
      }

      deTarget.style.transform = inlineTransform
    }

    ////////////////////////////////////////////////////////////////////////////

    var transformeds = []

    this.isProcessing = true
    this.onProcessingDone = onDone

    walkBack(deParent)

    this._hasTransform = transformeds.length !== 0

    setRect()

    if (this._hasTransform) {
      transformeds.forEach(reg => {
        reg.br = getGlobalBoundingClientRect(reg.de)
      })

      let brParent = getGlobalBoundingClientRect(deParent)
      let brLastTransformed = transformeds[transformeds.length - 1].br

      let parentOffsetFromLastTransformed = {
        x: brParent.left - brLastTransformed.left,
        y: brParent.top - brLastTransformed.top,
      }

      ReactDOM.render(<MockDiv
        parentOffsetFromLastTransformed = {parentOffsetFromLastTransformed}
        parentLeft = {-window.scrollX}
        parentTop = {-window.scrollY}
        transformList={transformeds}>

        <div id='picker' style={{position: 'absolute'}}/>
      </MockDiv>, this._mockMount, () => {

        this._dePicker = this._mockMount.querySelector('#picker')
        done()
      })
    }
    else {
      done()
    }

    transformeds.forEach(reg => {
      reg.de.style.transform = reg.inlineTransform
    })
  }
}

class MockDiv extends React.Component {
  static defaultProps = {
    transformListIdx: 0,
    parentLeft: 0,
    parentTop: 0,
  }

  render() {
    var {transformList, transformListIdx, parentLeft, parentTop,
      parentOffsetFromLastTransformed} = this.props,
      transformReg = transformList[transformListIdx],
      {br} = transformReg

    var renderChild = () => {
      if (transformListIdx < transformList.length - 1) {
        return <MockDiv
          picker={this.props.picker}
          parentLeft = {br.left}
          parentTop = {br.top}
          parentOffsetFromLastTransformed = {parentOffsetFromLastTransformed}
          transformList = {transformList}
          transformListIdx = {transformListIdx + 1}>
          {this.props.children}
        </MockDiv>
      }
      else {
        let {x, y} = parentOffsetFromLastTransformed
        return <div style={{
          position: 'absolute',
          left: x,
          top: y,
        }}>
          {this.props.children}
        </div>
      }
    }

    return <div style={{
      position: 'absolute',
      left: br.left - parentLeft,
      top: br.top - parentTop,
      width: br.width,
      height: br.height,
      ...mapKeys(transformReg.style, (value, key) => camelCase(key))
    }}>

      {renderChild()}
    </div>
  }
}
