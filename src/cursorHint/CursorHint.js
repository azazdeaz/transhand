import React from 'react'
import ReactDOM from 'react-dom'
import CursorHintDesign from './CursorHintDesign'

export default class CursorHint extends React.Component {
  static defaultProps = {
    delay: 879,
    DesignComponent: CursorHintDesign,
    hints: null,
  }

  constructor(props) {
    super(props)

    this.state = {}
  }

  getParentWindow() {
    const node = ReactDOM.findDOMNode(this)
    return node.ownerDocument.defaultView
  }

  componentDidMount() {
    this.getParentWindow().addEventListener('mousemove', this.handleMouseMove)
  }

  componentWillUnmount() {
    clearTimeout(this._showSetT)
    this.getParentWindow().removeEventListener('mousemove', this.handleMouseMove)
  }

  show = () => {
    this.setState({show: true})
  }

  handleMouseMove = (e) => {
    clearTimeout(this._showSetT)

    this.setState({
      show: false,
      x: e.clientX + 7,
      y: e.clientY + 7,
    }, () => {
      this._showSetT = setTimeout(this.show, this.props.delay)
    })
  }

  render() {
    var {hint} = this.props
    var {DesignComponent} = this.props
    var {show, x, y} = this.state

    return show && hint ?
      <DesignComponent hint={hint} x={x} y={y}/> : <div hidden/>
  }
}
