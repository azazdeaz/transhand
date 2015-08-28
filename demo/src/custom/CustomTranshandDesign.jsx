import React from 'react'
import {fixCursorStyle} from 'transhand'

export default class CustomTranshandDesign extends React.Component {
  render() {
    var {rotateFingerDist, originRadius, stroke, getHitEvents,
          coordinator, cursor, points, pOrigin} = this.props,
        p = points.map(point => coordinator.localToGlobal(point)),
        po = coordinator.localToGlobal(pOrigin),
        or = originRadius

    var boxHitPoints =
      `${p[0].x} ,${p[0].y} ` +
      `${p[1].x} ,${p[1].y} ` +
      `${p[2].x} ,${p[2].y} ` +
      `${p[3].x} ,${p[3].y}`

    var boxPath =
      `M${p[0].x} ${p[0].y} ` +
      `L${p[1].x} ${p[1].y} ` +
      `L${p[2].x} ${p[2].y} ` +
      `L${p[3].x} ${p[3].y} ` +
      `L${p[0].x} ${p[0].y} ` +
      `L${p[1].x} ${p[1].y} ` +
      `L${p[2].x} ${p[2].y} ` +
      `L${p[3].x} ${p[3].y} ` +
      `L${p[0].x} ${p[0].y} ` +
      `L${p[2].x} ${p[2].y} ` +
      `M${p[3].x} ${p[3].y} ` +
      `L${p[1].x} ${p[1].y}`

    var decoration = (idx) => {
      var x = p[idx].x
      var y = p[idx].y

      return renderDecoration(x, y)
    }
    var decorationBtwn = (aIdx, bIdx) => {
      var ax = p[aIdx].x
      var ay = p[aIdx].y
      var bx = p[bIdx].x
      var by = p[bIdx].y
      var x = ax + ((bx - ax) / 2)
      var y = ay + ((by - ay) / 2)

      return renderDecoration(x, y)
    }
    var renderDecoration = (x, y) => {
      return <circle
        cx = {x}
        cy = {y}
        r = {3}
        {...stroke}/>
    }

    return <g>
      <path
        fill = 'none'
        {...stroke}
        d = {boxPath}>
      </path>


      <circle
        cx = {po.x}
        cy = {po.y}
        r = {or}
        fill = 'none'
        {...stroke}/>

      <polygon ref='boxHit'
        fill="black"
        stroke="black"
        opacity="0"
        strokeLinejoin='round'
        strokeLocation='outside'
        strokeWidth={rotateFingerDist}
        points = {boxHitPoints}
        style={{
          cursor,
          pointerEvents: 'auto',
        }}
        {...getHitEvents()}/>

      {decoration(0)}
      {decoration(1)}
      {decoration(2)}
      {decoration(3)}
      {decorationBtwn(0, 1)}
      {decorationBtwn(1, 2)}
      {decorationBtwn(2, 3)}
      {decorationBtwn(3, 0)}

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
