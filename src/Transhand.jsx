import React, {PropTypes} from 'react'
import clone from 'lodash/lang/clone'
import cloneDeep from 'lodash/lang/cloneDeep'
import shallowEquals from 'shallow-equals'
import TranshandDesign from './TranshandDesign'
import DefaultCoordinator from './DefaultCoordinator'
import {radDiff, distToSegment, distToPointInAngle, isInside,
  equPoints} from './utils'

const MOUSESTATES = {
  'move': 'move',
  'rotate': '-webkit-grab',
  'origin': 'crosshair',
  '1000': 'ns-resize',
  '1100': 'nesw-resize',
  '0100': 'ew-resize',
  '0110': 'nwse-resize',
  '0010': 'ns-resize',
  '0011': 'nesw-resize',
  '0001': 'ew-resize',
  '1001': 'nwse-resize',
}

export default class Transhand extends React.Component {
  static propsTypes = {
    transform: PropTypes.shape({
      tx: PropTypes.number.isRequired,
      ty: PropTypes.number.isRequired,
      sx: PropTypes.number.isRequired,
      sy: PropTypes.number.isRequired,
      rz: PropTypes.number.isRequired,
      ox: PropTypes.number.isRequired,
      oy: PropTypes.number.isRequired,
    }).isRequired,
    rect: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      w: PropTypes.number.isRequired,
      h: PropTypes.number.isRequired,
    }).isRequired,
    rotateFingerDist: PropTypes.number,
    originRadius: PropTypes.number,
    coordinator: PropTypes.shape({
      localToGlobal: PropTypes.func.isRequired,
      globalToLocal: PropTypes.func.isRequired,
    }),
    stroke: PropTypes.object,
    DesignComponent: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onStartDrag: React.PropTypes.func,
    onEndDrag: React.PropTypes.func,
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
    rotateFingerDist: 16,
    originRadius: 6,
    coordinator: new DefaultCoordinator(),
    stroke: {
      strokeWidth: '1',
      stroke: 'lime',
    },
    DesignComponent: TranshandDesign,
  }

  constructor(prosp) {
    super(prosp)

    this.state = {
      points: [{}, {}, {}, {}],
      pOrigin: {},
    }
  }

  componentWillMount() {

    this.refreshPoints()

    window.addEventListener('mousemove', e => this.handleMouseMove(e))
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

    function t(p, x, y) {
      var dx = (x - tox) * transform.sx,
          dy = (y - toy) * transform.sy,
          d = Math.sqrt(dx**2 + dy**2),
          rad = Math.atan2(dy, dx) + transform.rz,
          nx = Math.cos(rad),
          ny = Math.sin(rad),
          rx = d * nx,
          ry = d * ny,
          px = tox + rx,
          py = toy + ry

      p.x = px
      p.y = py
    }
  }




  // Event Handlers ////////////////////////////////////////////////////////////

  handleMouseDown = (e) => {

    if (!this.state.finger) {
        return
    }

    this._isDraggedSinceDown = false
    this._isHandle = true

    React.findDOMNode(this).style.pointerEvents = 'auto'

    this._mdPos = {
        m: this.props.coordinator.globalToLocal({x: e.clientX, y: e.clientY}),
        transform: cloneDeep(this.props.transform),
        points: cloneDeep(this.state.points),
        pOrigin: clone(this.state.pOrigin)
    }

    window.addEventListener('mouseup', this.handleMouseUp)
    window.addEventListener('mouseleave', this.handleMouseUp)
    window.addEventListener('mousemove', this.handleDrag)

    if (this.props.onStartDrag) {
      this.props.onStartDrag()
    }
  }

  handleMouseMove = (e) => {

    this._isDraggedSinceDown = true

    if (!this._isHandle && this.state.hoverHitbox) {
      this.setFinger(e)
    }
    else {
      // this._th.cursorHint.setHints(null)
    }
  }

  handleMouseUp = (e) => {
    window.removeEventListener('mouseup', this.handleMouseUp)
    window.removeEventListener('mouseleave', this.handleMouseUp)
    window.removeEventListener('mousemove', this.handleDrag)

    e.stopPropagation()
    e.preventDefault()

    if (this._rafOnDragRafId) {
      this.deferredHandleDrag()
    }

    this._isHandle = false

    //hack! fix to click behind the handler on releasing it
    var deRoot = React.findDOMNode(this)
    setTimeout(() => {
      deRoot.style.pointerEvents = 'none'
    })

    if (this.props.onEndDrag) {
      this.props.onEndDrag()
    }

    if (!this._isDraggedSinceDown && this.props.onClick) {
      this.props.onClick(e)
    }
  }

  handleDrag = (e) => {

    this._onDragMe = e

    if (!this._rafOnDragRafId) {

      this._rafOnDragRafId = requestAnimationFrame(this.deferredHandleDrag)
    }
  }

  deferredHandleDrag = () => {

    var e = this._onDragMe
    this._onDragMe = undefined

    window.cancelAnimationFrame(this._rafOnDragRafId)
    this._rafOnDragRafId = undefined

    var {rect, transform, coordinator, onChange} = this.props,
        {pOrigin, finger} = this.state,
        md = this._mdPos,
        m = coordinator.globalToLocal({x: e.clientX, y: e.clientY}),
        dx = m.x - md.m.x,
        dy = m.y - md.m.y,
        alt = e.altKey,
        shift = e.shiftKey,
        change = {}

    if (finger === 'origin') {

      setOrigin()
    }

    if (finger === 'move') {

      setTransform()
    }

    if (finger.charAt(0) === '1') {

      setScale(-Math.PI/2, 'sy', -1)
    }

    if (finger.charAt(1) === '1') {

      setScale(0, 'sx', 1)
    }

    if (finger.charAt(2) === '1') {

      setScale(Math.PI/2, 'sy', 1)
    }

    if (finger.charAt(3) === '1') {

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

      var rad = r + md.transform.rz,
          mdDist = distToPointInAngle(md.pOrigin, md.m, rad),
          dragDist = distToPointInAngle(md.pOrigin, m, rad),
          scale = (dragDist / mdDist) * md.transform[sN]

      if (alt) {
        var es = (scale - md.transform[sN]) / 2,
            tN = 't' + sN.charAt(1),
            dN = sN.charAt(1) === 'x' ? 'w' : 'h'

        scale -= es
        change[tN] = transform[tN] = md.transform[tN] + rect[dN] * (es / 2) * way
      }

      change[sN] = transform[sN] = scale
    }

    function fixProportion() {

      var mx = m.x - pOrigin.x,
          my = m.y - pOrigin.y,
          mr = Math.abs(radDiff(transform.rz, Math.atan2(my, mx))),
          isVertical = mr > Math.PI / 4 && mr < Math.PI/4 * 3,
          spx = transform.sx / md.transform.sx,
          spy = transform.sy / md.transform.sy

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









  setFinger(e) {

    var {rect, transform, coordinator, originRadius} = this.props,
        {finger} = this.state,
        p = this.state.points,
        po = this.state.pOrigin,
        diff = 3,
        rDiff = 16,
        m = coordinator.globalToLocal({x: e.clientX, y: e.clientY}),
        dox = po.x - m.x,
        doy = po.y - m.y,
        dOrigin = Math.sqrt(dox**2 + doy**2),
        dTop = distToSegment(m, p[0], p[1]),
        dLeft = distToSegment(m, p[1], p[2]),
        dBottom = distToSegment(m, p[2], p[3]),
        dRight = distToSegment(m, p[3], p[0]),
        top = dTop < diff,
        left = dLeft < diff,
        bottom = dBottom < diff,
        right = dRight < diff,
        inside = isInside(m, p),
        cursorScale

      if (rect.w * transform.sx < diff * 2 && inside) {

          left = false
          right = false
      }

      if (rect.h * transform.sy < diff * 2 && inside) {

          top = false
          bottom = false
      }

      if (dOrigin < originRadius) {

          finger = 'origin'
      }
      else if (top || right || bottom || left) {
          //TODO its sould be top-right-bottom-left
          finger = ('000' + (top * 1000 + left * 100 + bottom * 10 + right * 1)).substr(-4)
          cursorScale = true
          // this._th.cursorHint.setHints(hints.scale)
      }
      else if (inside) {

          finger = 'move'
          // this._th.cursorHint.setHints(hints.move)
      }
      else if (dTop < rDiff || dRight < rDiff || dBottom < rDiff || dLeft < rDiff || dOrigin < rDiff) {

          finger = 'rotate'
          // this._th.cursorHint.setHints(hints.rotate)
      }
      else {
          finger = false
          // this._th.cursorHint.setHints(null)
      }

      var cursor = this.getCursor(e, finger, cursorScale)

      this.setState({finger, cursorScale, cursor})
  }

  getCursor(e, finger, cursorScale) {

    var cursor = 'auto'

    if (finger === 'rotate') {
      cursor = this.getRotateCursor(e.clientX, e.clientY)
    }
    else if (cursorScale) {
      cursor = this.getScaleCursor(e.clientX, e.clientY)
    }
    else if (finger) {
      cursor = MOUSESTATES[finger]
    }

    return cursor
  }

  getRotateCursor(mx, my) {

    var po = this.props.coordinator.localToGlobal(this.state.pOrigin)
    var r = Math.atan2(my - po.y, mx - po.x) / Math.PI * 180

    var svg = escape(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" ><path transform="rotate(${r}, 16, 16)" d="M18.907 3.238l-7.54-2.104s8.35 3.9 8.428 15.367c.08 11.794-7.807 14.49-7.807 14.49l7.363-1.725" stroke="#000" stroke-width="2.054" fill="none"/></svg>`)
    return `url('data:image/svg+xml;utf8,${svg}') 16 16, all-scroll`
  }

  getScaleCursor() {
    var FINGERS = ['0100', '0110', '0010', '0011', '0001', '1001', '1000', '1100']

    var {coordinator, transform} = this.props
    var {pOrigin, finger} = this.state
    var sideDeg = FINGERS.indexOf(finger) * 45
    var po = coordinator.localToGlobal(pOrigin)
    var oTweak = {x: pOrigin.x + 1234, y: pOrigin.y}
    var pot = coordinator.localToGlobal(oTweak)
    var baseRad = Math.atan2(pot.y - po.y, pot.x - po.x) + transform.rz
    var r = sideDeg + (baseRad / Math.PI * 180)

    var svg = escape(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path transform="rotate(${r}, 16, 16)" d="M22.406 12.552l5.88 4.18H3.677l5.728 4.36" stroke="#000" stroke-width="2.254" fill="none"/></svg>`)
    return `url(data:image/svg+xml;utf8,${svg}) 16 16, all-scroll`
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
    var {DesignComponent, ...props} = this.props
    var {cursor, points, pOrigin} = this.state

    return <DesignComponent
      {...props}
      cursor={cursor}
      points={points}
      pOrigin={pOrigin}
      getHitEvents={this.getHitEvents}/>
  }
}
