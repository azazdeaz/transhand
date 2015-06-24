import React from 'react'
import Transhand from './Transhand'
import CssCoordinator from './CssCoordinator'
import isElement from 'lodash/lang/isElement'

export default class CssTranshand extends React.Component {

  static propTypes = {
    deTarget: (props, name) => {
      if (!isElement(props[name])) {
        return new Error('deTarget should be a DOM Element!')
      }
    },
    props: React.PropTypes.shape({
      tx: React.PropTypes.number,
      ty: React.PropTypes.number,
      sx: React.PropTypes.number,
      sy: React.PropTypes.number,
      rz: React.PropTypes.number,
      ox: React.PropTypes.number,
      oy: React.PropTypes.number,
    }),
  }

  constructor(props) {
    super(props)

    this.coordinator = new CssCoordinator()

    this.state = {
      base: {x: 0, y: 0, w: 0, h: 0}
    }
    //TODO do this somehow better!
    setTimeout(() => this.takeNextDeTarget(props.deTarget))
  }

  componentWillReceiveProps(nextProps) {
    this.takeNextDeTarget(nextProps.deTarget)
  }

  componentWillUnmount() {
    this.coordinator.destroy()
  }

  takeNextDeTarget(nextDeTarget) {

    if (this._lastTakenDeTarget !== nextDeTarget) {

      this._lastTakenDeTarget = nextDeTarget

      this.coordinator.setLocalRoot(
        nextDeTarget.parentElement, nextDeTarget, (base) => {
          this.setState({base, foo: 3})
        }
      )
    }
  }

  shouldComponentUpdate() {
    return !this.coordinator.isProcessing
  }

  render() {

    if (this.coordinator.isProcessing) {
      return <div hidden={true}/>
    }

    var {base} = this.state

    return <Transhand
      {...this.props}
      base = {base}
      coordinator = {this.coordinator}/>
  }
}
