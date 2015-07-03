import React from 'react'
import CursorHintDesign from './CursorHintDesign'

export default class CursorHint extends React.Component {
  static defaultProps = {
    delay: 879,
    CursorHintDesignComponent: CursorHintDesign,
    hints: null,
  }

  constructor(props) {
    super(props)

    this.state = {}
  }

  componentDidMount() {
    var node = React.findDOMNode(this)
    node.parentNode.addEventListener('mousemove', this.handleMouseMove)
  }

  componentWillUnmount() {
    var node = React.findDOMNode(this)
    if (node.parentNode) {
      node.parentNode.removeEventListener('mousemove', this.handleMouseMove)
    }
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
    var {CursorHintDesignComponent} = this.props
    var {show, x, y} = this.state

    return show && hint ?
      <CursorHintDesignComponent hint={hint} x={x} y={y}/> : <div hidden/>
  }
}
