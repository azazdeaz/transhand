import React from 'react'
import fixCursorStyle from './fixCursorStyle'

export default class TranshandDesign extends React.Component {
  render() {
    var {rotateFingerDist, originRadius, stroke, getHitEvents,
          coordinator, cursor, points, pOrigin, transformTypes} = this.props,
        p = points.map(point => coordinator.localToGlobal(point)),
        po = coordinator.localToGlobal(pOrigin),
        or = originRadius

    var boxHitPoints =
      `${p[0].x} ,${p[0].y} ` +
      `${p[1].x} ,${p[1].y} ` +
      `${p[2].x} ,${p[2].y} ` +
      `${p[3].x} ,${p[3].y}`

    function renderOrigin() {
      if (transformTypes.indexOf('origin') !== -1) {
        return [
          <line key='h' x1={po.x - or} y1={po.y} x2={po.x + or} y2={po.y} {...stroke}/>,
          <line key='v' x1={po.x} y1={po.y - or} x2={po.x} y2={po.y + or} {...stroke}/>
        ]
      }
      else {
        return null
      }
    }

    return <g>
      <polygon
        fill='none'
        {...stroke}
        points = {boxHitPoints}>
      </polygon>

      {renderOrigin()}

      <polygon ref='boxHit'
        fill="black" opacity="0"
        stroke="black"
        strokeLinejoin='round'
        strokeLocation='outside'
        strokeWidth={rotateFingerDist}
        points = {boxHitPoints}
        style={{
          cursor,
          pointerEvents: 'auto',
        }}
        {...getHitEvents()}/>

      <circle ref='originHit'
        fill="black" opacity="0"
        cx = {po.x}
        cy = {po.y}
        r = {originRadius}
        style={{
          cursor,
          pointerEvents: 'auto',
        }}
        {...getHitEvents()}/>
    </g>
  }

  componentDidUpdate() {
    fixCursorStyle(this.refs.boxHit, this.props.cursor)//HACK
    fixCursorStyle(this.refs.originHit, this.props.cursor)//HACK
  }
}
