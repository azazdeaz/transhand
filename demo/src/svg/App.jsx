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
    window.addEventListener('mousedown', this.handleSelectClick)
  }

  handleSelectBehindHanler = (e) => {
    this.handleSelectClick(e, true)
  }

  handleSelectClick = (e, behindHandler) => {
    var domElem = this.elementFromPoint(e.clientX, e.clientY)

    if (domElem && domElem._handlerDemo) {
      this.setState({
        currDomElem: domElem,
        grabEvent: !behindHandler && e
      })
    }
    else {
      this.setState({currDomElem: undefined})
    }
  }

  elementFromPoint(x, y) {
    var deHandler = ReactDOM.findDOMNode(this.refs.handler)
    var deTarget
    var get = () => deTarget = document.elementFromPoint(x, y)

    if (deHandler) {
      let save = deHandler.style.display
      deHandler.style.display = 'none'
      get()
      deHandler.style.display = save
    }
    else {
      get()
    }

    return deTarget
  }

  handleChange = (change) => {
    console.log('change event:', change)

    var { currDomElem } = this.state,
        transform = currDomElem._handlerTransform

    currDomElem._handlerTransform = assign({}, transform, change)

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
    var {currDomElem, grabEvent} = this.state

    if (currDomElem) {

      return <CSSTranshand
        ref = 'handler'
        deTarget = {currDomElem}
        transform = {currDomElem._handlerTransform}
        onChange = {this.handleChange}
        grabEvent = {grabEvent}
        onClick = {this.handleSelectBehindHanler}/>
    }
    else {
      return <div hidden={true}/>
    }
  }
}
