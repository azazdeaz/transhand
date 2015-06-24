import React from 'react'

const styles = {
  root: {
    position: 'fixed',
    pointerEvents: 'none',
    left: '0px',
    top: '0px',
    width: '100%',
    height: '100%',
  }
}

export default class CustomTranshandDesign extends React.Component {
  stopPropagation = (e) => {
    e.stopPropagation()
  }

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

    styles.root.cursor = cursor

    return <svg
      style = {styles.root}
      onClick = {this.stopPropagation}>

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
    </svg>
  }
}
