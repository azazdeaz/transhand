var toArray = require('lodash/lang/toArray')

const INIT_TRANSFORM = {
  tx: 0, ty: 0,
  sx: 1, sy: 1,
  rz: 0,
  ox: 0.5, oy: 0.5,
}

export default function init() {
  const nodes = document.querySelectorAll('g, path, circle, line')
  toArray(nodes).forEach(node => {
    node._handlerDemo = true
    node._handlerTransform = INIT_TRANSFORM
  })
}
