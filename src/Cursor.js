export default class Cursor {
  constructor() {
    this.FINGER2CURSOR = {
      'move': 'move',
      'rotate': getRotateCursor,
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
  }

  getCursor (props, state, x, y){
    var {finger} = state
    var cursor = this.FINGER2CURSOR[finger]

    if (typeof cursor === 'string' && cursor.indexOf('resize') !== -1) {
      cursor = getScaleCursor
    }

    if (typeof cursor === 'function') {
      cursor = cursor(props, state, x, y)
    }

    return cursor
  }
}

function getRotateCursor(props, state, mx, my) {
  var po = props.coordinator.localToGlobal(state.pOrigin)
  var r = Math.atan2(my - po.y, mx - po.x) / Math.PI * 180

  var svg = escape(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" ><path transform="rotate(${r}, 16, 16)" d="M18.907 3.238l-7.54-2.104s8.35 3.9 8.428 15.367c.08 11.794-7.807 14.49-7.807 14.49l7.363-1.725" stroke="#000" stroke-width="2.054" fill="none"/></svg>`)
  return `url('data:image/svg+xml;utf8,${svg}') 16 16, all-scroll`
}

function getScaleCursor(props, state) {
  var FINGERS = ['0100', '0110', '0010', '0011', '0001', '1001', '1000', '1100']

  var {coordinator, transform} = props
  var {pOrigin, finger} = state
  var sideDeg = FINGERS.indexOf(finger) * 45
  var po = coordinator.localToGlobal(pOrigin)
  var oTweak = {x: pOrigin.x + 1234, y: pOrigin.y}
  var pot = coordinator.localToGlobal(oTweak)
  var baseRad = Math.atan2(pot.y - po.y, pot.x - po.x) + transform.rz
  var r = sideDeg + (baseRad / Math.PI * 180)

  var svg = escape(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path transform="rotate(${r}, 16, 16)" d="M22.406 12.552l5.88 4.18H3.677l5.728 4.36" stroke="#000" stroke-width="2.254" fill="none"/></svg>`)
  return `url(data:image/svg+xml;utf8,${svg}) 16 16, all-scroll`
}
