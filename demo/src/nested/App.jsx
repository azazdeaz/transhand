import React from 'react'
import CssTranshand from 'SRC/CssTranshand'
import assign from 'lodash/object/assign'

export default class App extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      currDomElem: undefined,
    }
  }

  componentDidMount() {
    window.addEventListener('click', this.handleSelectClick)
  }

  handleSelectClick = (e) => {
    var deTarget = this.elementFromPoint(e.clientX, e.clientY)

    if (deTarget && deTarget._handlerDemo) {
      this.setState({currDomElem: deTarget})
    }
    else {
      this.setState({currDomElem: undefined})
    }
  }

  elementFromPoint(x, y) {
    var deHandler = React.findDOMNode(this.refs.handler)
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
        transform = currDomElem._handlerParams

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

      return <CssTranshand
        ref = 'handler'
        deTarget = {currDomElem}
        transform = {currDomElem._handlerParams}
        onChange = {this.handleChange}
        onClick = {this.handleSelectClick}/>
    }
    else {
      return <div hidden={true}/>
    }
  }
}
