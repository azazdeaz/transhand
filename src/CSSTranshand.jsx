import React from 'react'
import Transhand from './Transhand'
import CSSCoordinator from './CSSCoordinator'
import isElement from 'lodash/lang/isElement'
import assign from 'lodash/object/assign'

export default class CSSTranshand extends React.Component {
  static propTypes = (() => {
    var pt = assign(Transhand.propTypes, {
      deTarget: (props, name) => {
        if (!isElement(props[name])) {
          return new Error('deTarget should be a DOM Element!')
        }
      },
    })

    delete pt.rect
    delete pt.coordinator

    return pt
  })()

  constructor(props) {
    super(props)

    this.coordinator = new CSSCoordinator()

    this.state = {
      rect: {x: 0, y: 0, w: 0, h: 0}
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
        nextDeTarget.parentElement, nextDeTarget, (rect) => {
          this.setState({rect})
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

    var {rect} = this.state

    return rect ? <Transhand
      {...this.props}
      rect = {rect}
      coordinator = {this.coordinator}/> : <div hidden/>
  }
}
