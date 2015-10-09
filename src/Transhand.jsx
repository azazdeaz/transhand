import React, {PropTypes} from 'react'
import clone from 'lodash/lang/clone'
import cloneDeep from 'lodash/lang/cloneDeep'
import assign from 'lodash/object/assign'
import shallowEquals from 'shallow-equals'
import TranshandDesign from './TranshandDesign'
import DefaultCoordinator from './DefaultCoordinator'
import Cursor from './Cursor'
import fixCursorStyle from './fixCursorStyle'
import CursorHint from './cursorHint/CursorHint'
import {radDiff, distToSegment, distToPointInAngle, isInside,
  equPoints} from './utils'

export default class Transhand extends React.Component {
  static propTypes = {
    transform: PropTypes.shape({
      tx: PropTypes.number.isRequired,
      ty: PropTypes.number.isRequired,
      sx: PropTypes.number.isRequired,
      sy: PropTypes.number.isRequired,
      rz: PropTypes.number.isRequired,
      ox: PropTypes.number.isRequired,
      oy: PropTypes.number.isRequired,
    }).isRequired,
    transformTypes: PropTypes.array,
    rect: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      w: PropTypes.number.isRequired,
      h: PropTypes.number.isRequired,
    }),
    rotateFingerDist: PropTypes.number,
    originRadius: PropTypes.number,
    coordinator: PropTypes.shape({
      localToGlobal: PropTypes.func.isRequired,
      globalToLocal: PropTypes.func.isRequired,
    }),
    stroke: PropTypes.object,
    DesignComponent: React.PropTypes.func,
    hitns: React.PropTypes.object,
    CursorHintDesignComponent: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onStartDrag: React.PropTypes.func,
    onEndDrag: React.PropTypes.func,
    grabEvent: React.PropTypes.any,
    cursor: React.PropTypes.object,
  }

  static defaultProps = {
    transform: {
      tx: 0, ty: 0,
      sx: 1, sy: 1,
      rz: 0,
      ox: 0.5, oy: 0.5,
    },
    rect: {
      x: 0, y: 0, w: 0, h: 0,
    },
    transformTypes: ['translate', 'rotate', 'scale', 'origin'],
    rotateFingerDist: 16,
    originRadius: 6,
    coordinator: new DefaultCoordinator(),
    stroke: {
      strokeWidth: '1',
      stroke: 'lime',
    },
    DesignComponent: TranshandDesign,
    grabEvent: null,
    cursor: new Cursor(),
    hints: {
      scaleXY: [
        'shift - keep shape',
        'alt - from the opposite side'
      ],
      scaleXorY: [
        'alt - from the opposite side'
      ],
      rotate: [
        'shift - 15° steps'
      ],
      move: [
        'shift - move in one dimension'
      ],
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      points: [{}, {}, {}, {}],
      pOrigin: {},
    }
  }

  componentWillMount() {
    this.refreshPoints()
    window.addEventListener('mousemove', this.handleMouseMove)
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove)
  }

  componentWillReceiveProps(nextProps) {
    this.refreshPoints(nextProps)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var {points, pOrigin} = this.state

    return !(
      shallowEquals(this.props, nextProps) &&
      shallowEquals(this.state, nextState) &&
      shallowEquals(this.props.stroke, nextProps.stroke) &&

      equPoints(pOrigin, nextState.pOrigin) &&
      equPoints(points[0], nextState.points[0]) &&
      equPoints(points[1], nextState.points[1]) &&
      equPoints(points[2], nextState.points[2]) &&
      equPoints(points[3], nextState.points[3]))
  }

  componentDidMount() {
    var {grabEvent} = this.props
    if (grabEvent) {
      this.handleNewGrabEvent(grabEvent)
    }
  }

  componentDidUpdate(prevProps) {
    var {grabEvent} = this.props
    if (grabEvent && grabEvent !== prevProps.grabEvent) {
      this.handleNewGrabEvent(grabEvent)
    }
  }

  handleNewGrabEvent(grabEvent) {
    this._finger = 'move'
    this.handleMouseDown(grabEvent)
  }

  allowed(transformType) {
    return this.props.transformTypes.indexOf(transformType) !== -1
  }




  refreshPoints(props) {
    props = props || this.props

    var {rect, transform} = props,
        p = this.state.points.map(point => clone(point)),
        po = clone(this.state.pOrigin)

    rect = clone(rect)

    rect.x += transform.tx
    rect.y += transform.ty

    po.x = rect.x + (rect.w * transform.ox)
    po.y = rect.y + (rect.h * transform.oy)

    var tox = rect.x + transform.ox * rect.w,
        toy = rect.y + transform.oy * rect.h

    t(p[0], rect.x, rect.y)
    t(p[1], rect.x + rect.w, rect.y)
    t(p[2], rect.x + rect.w, rect.y + rect.h)
    t(p[3], rect.x, rect.y + rect.h)

    this.setState({
      points: p,
      pOrigin: po,
    })

    function t(point, x, y) {
      var dx = (x - tox) * transform.sx
      var dy = (y - toy) * transform.sy
      var d = Math.sqrt(dx**2 + dy**2)
      var rad = Math.atan2(dy, dx) + transform.rz
      var nx = Math.cos(rad)
      var ny = Math.sin(rad)
      var rx = d * nx
      var ry = d * ny
      var px = tox + rx
      var py = toy + ry

      point.x = px
      point.y = py
    }
  }

  setHint(name) {
    var {hints} = this.props

    this.setState({
      activeHint: hints && hints[name]
    })
  }


  // Event Handlers ////////////////////////////////////////////////////////////

  handleMouseDown = (e) => {
    if (!this._finger) {
        return
    }

    e.stopPropagation()
    e.preventDefault()

    this._isDraggedSinceDown = false
    this._isHandle = true

    // ReactDOM.findDOMNode(this).style.pointerEvents = 'auto'

    this._mdPos = {
      m: this.props.coordinator.globalToLocal({x: e.clientX, y: e.clientY}),
      transform: cloneDeep(this.props.transform),
      points: cloneDeep(this.state.points),
      pOrigin: clone(this.state.pOrigin)
    }

    window.addEventListener('mouseup', this.handleMouseUp)
    window.addEventListener('mouseleave', this.handleMouseUp)
    // window.addEventListener('mousemove', this.handleDrag)

    if (this.props.onStartDrag) {
      this.props.onStartDrag()
    }
  }

  handleMouseUp = (e) => {
    window.removeEventListener('mouseup', this.handleMouseUp)
    window.removeEventListener('mouseleave', this.handleMouseUp)
    // window.removeEventListener('mousemove', this.handleDrag)

    e.stopPropagation()
    e.preventDefault()

    if (this._rafOnDragRafId) {
      this.deferredHandleDrag()
    }

    this._isHandle = false

    //hack! fix to click behind the handler on releasing it
    // var deRoot = ReactDOM.findDOMNode(this)
    // setTimeout(() => {
    //   deRoot.style.pointerEvents = 'none'
    // })

    if (this.props.onEndDrag) {
      this.props.onEndDrag()
    }

    if (!this._isDraggedSinceDown && this.props.onClick) {
      this.props.onClick(e)
    }
  }

  handleMouseMove = (e) => {
    this._isDraggedSinceDown = true

    if (this._isHandle) {
      this._onDragMe = e

      if (!this._rafOnDragRafId) {
        this._rafOnDragRafId = requestAnimationFrame(this.deferredHandleDrag)
      }
      this.setHint(null)
    }
    else /*if (this.state.hoverHitbox)*/ {
      this._finger = this.getFinger(e)
    }

    var cursor = this.getCursor(e)
    this.setState({cursor})
  }

  deferredHandleDrag = () => {
    var e = this._onDragMe
    this._onDragMe = undefined

    window.cancelAnimationFrame(this._rafOnDragRafId)
    this._rafOnDragRafId = undefined

    var {rect, transform, coordinator, onChange} = this.props
    var {pOrigin} = this.state
    var md = this._mdPos
    var m = coordinator.globalToLocal({x: e.clientX, y: e.clientY})
    var dx = m.x - md.m.x
    var dy = m.y - md.m.y
    var alt = e.altKey
    var shift = e.shiftKey
    var change = {}
    var finger = this._finger

    if (finger === 'origin') {
      setOrigin()
    }

    if (finger === 'move') {
      setTransform()
    }

    if (finger && finger.charAt(0) === '1') {
      setScale(-Math.PI/2, 'sy', -1)
    }

    if (finger && finger.charAt(1) === '1') {
      setScale(0, 'sx', 1)
    }

    if (finger && finger.charAt(2) === '1') {
      setScale(Math.PI/2, 'sy', 1)
    }

    if (finger && finger.charAt(3) === '1') {
      setScale(Math.PI, 'sx', -1)
    }

    if (finger === 'rotate') {
      setRotation()
    }

    if (shift && 'sx' in change && 'sy' in change) {
      fixProportion()
    }


    if (onChange) {
      onChange(change)
    }





    function setScale(r, sN, way) {

      var rad = r + md.transform.rz
      var mdDist = distToPointInAngle(md.pOrigin, md.m, rad)
      var dragDist = distToPointInAngle(md.pOrigin, m, rad)
      var scale = (dragDist / mdDist) * md.transform[sN]

      if (alt) {
        let es = (scale - md.transform[sN]) / 2
        let tN = 't' + sN.charAt(1)
        let dN = sN.charAt(1) === 'x' ? 'w' : 'h'

        scale -= es
        change[tN] = transform[tN] = md.transform[tN] + rect[dN] * (es / 2) * way
      }

      change[sN] = transform[sN] = scale
    }

    function fixProportion() {

      var mx = m.x - pOrigin.x
      var my = m.y - pOrigin.y
      var mr = Math.abs(radDiff(transform.rz, Math.atan2(my, mx)))
      var isVertical = mr > Math.PI/4 && mr < Math.PI/4 * 3
      var spx = transform.sx / md.transform.sx
      var spy = transform.sy / md.transform.sy

      spx *= spx < 0 ? -1 : 1
      spy *= spy < 0 ? -1 : 1

      var sp = isVertical ? spy : spx

      change.sx = transform.sx = md.transform.sx * sp
      change.sy = transform.sy = md.transform.sy * sp
    }

    function setRotation() {

      var mdx = md.m.x - pOrigin.x,
          mdy = md.m.y - pOrigin.y,
          mdr = Math.atan2(mdy, mdx),
          mx = m.x - pOrigin.x,
          my = m.y - pOrigin.y,
          mr = Math.atan2(my, mx),
          r = mr - mdr

      if (shift) {

        r = Math.floor(r / (Math.PI / 12)) * (Math.PI / 12)
      }

      change.rz = transform.rz = md.transform.rz + r
    }

    function setTransform() {

      if (shift) {

        if (Math.abs(dx) > Math.abs(dy)) {

          change.tx = transform.tx = md.transform.tx + dx
          change.ty = transform.ty = md.transform.ty
        }
        else {
          change.tx = transform.tx = md.transform.tx
          change.ty = transform.ty = md.transform.ty + dy
        }
      }
      else {
        change.tx = transform.tx = md.transform.tx + dx
        change.ty = transform.ty = md.transform.ty + dy
      }
    }

    function setOrigin() {

      var mx = m.x - md.pOrigin.x,
          my = m.y - md.pOrigin.y,
          dist = Math.sqrt(mx ** 2 + my ** 2),
          r = Math.atan2(my, mx) - transform.rz,
          x = (Math.cos(r) * dist) / transform.sx,
          y = (Math.sin(r) * dist) / transform.sy

      x = parseInt(x * 1000) / 1000 //?hack??
      y = parseInt(y * 1000) / 1000

      change.ox = transform.ox = md.transform.ox + (x / rect.w)
      change.oy = transform.oy = md.transform.oy + (y / rect.h)
      change.tx = transform.tx = md.transform.tx + (mx - x)
      change.ty = transform.ty = md.transform.ty + (my - y)
    }
  }









  getFinger(e) {
    var {rect, transform, coordinator, originRadius} = this.props
    var p = this.state.points
    var po = this.state.pOrigin
    var diff = 3
    var rDiff = 16
    var m = coordinator.globalToLocal({x: e.clientX, y: e.clientY})
    var dox = po.x - m.x
    var doy = po.y - m.y
    var dOrigin = Math.sqrt(dox**2 + doy**2)
    var dTop = distToSegment(m, p[0], p[1])
    var dLeft = distToSegment(m, p[1], p[2])
    var dBottom = distToSegment(m, p[2], p[3])
    var dRight = distToSegment(m, p[3], p[0])
    var top = dTop < diff
    var left = dLeft < diff
    var bottom = dBottom < diff
    var right = dRight < diff
    var inside = isInside(m, p)
    var finger = null

    if (rect.w * transform.sx < diff * 2 && inside) {
      left = false
      right = false
    }

    if (rect.h * transform.sy < diff * 2 && inside) {
      top = false
      bottom = false
    }

    if (dOrigin < originRadius) {
      if (this.allowed('origin')) {
        finger = 'origin'
        this.setHint(null)
      }
    }
    else if (this.allowed('scale') && (top || right || bottom || left)) {
      //TODO its sould be top-right-bottom-left
      finger = (top ? '1' : '0') +
               (left ? '1' : '0') +
               (bottom ? '1' : '0') +
               (right ? '1' : '0')
      if ((finger + finger).indexOf('11') !== -1) {
        this.setHint('scaleXY')
      }
      else {
        this.setHint('scaleXorY')
      }
    }
    else if (inside) {
      if (this.allowed('translate')) {
        finger = 'move'
        this.setHint('move')
      }
    }
    else if (dTop < rDiff || dRight < rDiff || dBottom < rDiff || dLeft < rDiff || dOrigin < rDiff) {
      if (this.allowed('rotate')) {
        finger = 'rotate'
        this.setHint('rotate')
      }
    }

    if (finger === null) {
      this.setHint(null)
    }

    return finger
  }

  getCursor(e) {
    return this.props.cursor.getCursor(
      this.props,
      assign({finger: this._finger}, this.state),
      e.clientX,
      e.clientY
    )
  }

  getHitEvents = () => {
    //TODO onFirstMove - handle when transhand appears under the mouse
    return {
      onMouseEnter: () => this.setState({hoverHitbox: true}),
      onMouseLeave: () => this.setState({hoverHitbox: false}),
      onMouseDown: e => this.handleMouseDown(e),
    }
  }

  render() {
    var {DesignComponent, CursorHintDesignComponent, ...props} = this.props
    var {cursor, points, pOrigin, activeHint} = this.state

    var style = {
      cursor,
      position: 'fixed',
      pointerEvents: this._isHandle ? 'auto' : 'none',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
    }

    return <div>
      <svg
        style = {style}
        ref = 'root'
        onClick = {e => e.stopPropagation()}>

        <DesignComponent
          {...props}
          cursor = {cursor}
          points = {points}
          pOrigin = {pOrigin}
          getHitEvents = {this.getHitEvents}/>
      </svg>
      <CursorHint
        hint = {activeHint}
        DesignComponent = {CursorHintDesignComponent}/>
    </div>
  }

  componentDidUpdate() {
    fixCursorStyle(this.refs.root, this.state.cursor)//HACK
  }
}
