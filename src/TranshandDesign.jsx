import React from 'react'
import CursorHint from './cursorHint/CursorHint'

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

export default class TranshandDesign extends React.Component {
  stopPropagation = (e) => {
    e.stopPropagation()
  }

  renderHandler() {
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

    styles.root.cursor = cursor

    return <svg
      style = {styles.root}
      onClick = {this.stopPropagation}>

      <polygon
        fill='none'
        {...stroke}
        points = {boxHitPoints}>
      </polygon>

      <line x1={po.x - or} y1={po.y} x2={po.x + or} y2={po.y} {...stroke}/>
      <line x1={po.x} y1={po.y - or} x2={po.x} y2={po.y + or} {...stroke}/>

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
    </svg>
  }

  render() {
    var {CursorHintDesignComponent, hint} = this.props

    return <div>
      {this.renderHandler()}
      <CursorHint
        hint={hint}
        DesignComponent={CursorHintDesignComponent}/>
    </div>
  }
}
