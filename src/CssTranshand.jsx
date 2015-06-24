import React, {PropTypes} from 'react'
import Transhand from './Transhand'
import CssCoordinator from './CssCoordinator'
import isElement from 'lodash/lang/isElement'
import assign from 'lodash/object/assign'

export default class CssTranshand extends React.Component {
  static propTypes = assign(Transhand.propTypes, {
    deTarget: (props, name) => {
      if (!isElement(props[name])) {
        return new Error('deTarget should be a DOM Element!')
      }
    },
    base: PropTypes.oneOf([undefined]),
    coordinator: PropTypes.oneOf([undefined])
  })

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
