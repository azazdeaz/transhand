import React from 'react'
import ReactDOM from 'react-dom'
import {CSSTranshand} from 'transhand'
import assign from 'lodash/object/assign'

export default class App extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      currDomElem: undefined,
    }
  }

  componentDidMount() {
    var iframeWindow = document.querySelector('iframe').contentWindow
    iframeWindow.addEventListener('mousedown', this.handleIframeSelectClick)
  }

  handleIframeSelectClick = (e) => {
    this.selectFromPoint(e.clientX, e.clientY)
  }

  handleSelectBehindHanler = (e) => {
    this.handleSelectClick(e, false)
  }

  handleSelectClick = (e, behindHandler) => {
    var br = document.querySelector('iframe').getBoundingClientRect()
    var x = e.clientX - br.left
    var y = e.clientY - br.top
    this.selectFromPoint(x, y, !behindHandler && e)
  }

  selectFromPoint(x, y, grabEvent) {
    var deTarget = this.elementFromPoint(x, y)

    if (deTarget && deTarget._handlerDemo) {
      this.setState({
        grabEvent,
        currDomElem: deTarget
      })
    }
    else {
      this.setState({currDomElem: undefined})
    }
  }

  elementFromPoint(x, y) {
    var deHandler = ReactDOM.findDOMNode(this.refs.handler)
    var deFrame = document.querySelector('iframe')
    var frameDoc = deFrame.contentDocument
    var deTarget
    var get = () => deTarget = frameDoc.elementFromPoint(x, y)

    if (deHandler) {
      let save = deHandler.style.display
      deHandler.style.display = 'none'
      get()
      deHandler.style.display = save
    }
    else {
      get()
    }

    if (deTarget === frameDoc.body) {
      deTarget = deFrame
    }
    return deTarget
  }

  handleChange = (change) => {
    console.log('change event:', change)

    var { currDomElem } = this.state,
        transform = currDomElem._handlerTransform

    assign(transform, change)

    currDomElem.style.transform = this.generateCssTransform(transform)
    currDomElem.style.transformOrigin = `${transform.ox*100}% ${transform.oy*100}%`

    this.forceUpdate()
  }

  generateCssTransform(transform) {
    var cssTransform = ''

    cssTransform += ' translateX(' + transform.tx + 'px)'
    cssTransform += ' translateY(' + transform.ty + 'px)'
    cssTransform += ' rotate(' + transform.rz + 'rad)'
    cssTransform += ' scaleX(' + transform.sx + ')'
    cssTransform += ' scaleY(' + transform.sy + ')'

    return cssTransform
  }

  render() {
    var {currDomElem} = this.state

    if (currDomElem) {
      let props = {
        ref: 'handler',
        deTarget: currDomElem,
        transform: currDomElem._handlerTransform,
        onChange: this.handleChange,
        onClick: this.handleSelectBehindHanler,
      }

      if (currDomElem.tagName === 'IFRAME') {
        props.transformTypes = ['translate']
      }

      return <CSSTranshand {...props}/>
    }
    else {
      return <div hidden={true}/>
    }
  }
}
