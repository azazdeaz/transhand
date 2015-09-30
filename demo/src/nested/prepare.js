require.context('./assets', false, /\.png$/)
var random = require('lodash/number/random')
var clone = require('lodash/lang/clone')
var pullAt = require('lodash/array/pullAt')
var tinycolor = require('tinycolor2')

const INIT_TRANSFORM = {
  tx: 0, ty: 0,
  sx: 1, sy: 1,
  rz: 0,
  ox: 0.5, oy: 0.5,
}

export default function scatterThings() {

  var srcs = ['cookiejar001', 'fan001', 'kettle001', 'mixer001', 'radio001',
    'speaker001', 'speaker002', 'toaster001', 'tv001', 'tv002'].map(name => {
      return `./assets/obj_${name}.png`
    })

  var colors = ['#7FDBFF', '#0074D9', '#001F3F', '#39CCCC', '#3D9970',
    '#FF4136', '#85144B', '#FF851B', '#B10DC9', '#FFDC00', '#F012BE',
    '#aaa', '#fff', '#111', '#ddd']

  var takeOne = arr => pullAt(arr, random(arr.length - 1))

  var rootNode = document.querySelector('#stuffs')
  document.body.style.backgroundColor = takeOne(colors)
  document.querySelector('#source > a').style.color = tinycolor.mostReadable(
    document.body.style.backgroundColor,
    colors
  ).toHexString()

  for (let i = 0; i < 3; ++i) {
    let deParent = rootNode

    let w = 242 + 132 * Math.random()
    let h = 242 + 132 * Math.random()

    for (let j = 0; j < 3; ++j) {
      deParent = createDiv(w, h, deParent)
      w -= 23
      h -= 23
    }

    for (let j = 0; j < 3; ++j) {
      createImg(deParent)
    }
  }

  function createDiv(w, h, deParent) {
    var div = document.createElement('div')
    div.style.width = w + 'px'
    div.style.height = h + 'px'
    div.style.backgroundColor = takeOne(colors)
    div.style.boxShadow = '1px 1px 4px 0px rgba(50, 50, 50, 0.75)'
    div._handlerTransform = clone(INIT_TRANSFORM)

    place(div, deParent)

    return div
  }

  function createImg(deParent) {
    var img = new Image()

    img._handlerTransform = clone(INIT_TRANSFORM)

    img.onload = function () {
      place(img, deParent)
    }

    img.src = takeOne(srcs)

    return img
  }

  function place(de, deParent) {
    deParent.appendChild(de)

    var w = deParent.offsetWidth - de.offsetWidth
    var h = deParent.offsetHeight - de.offsetHeight

    de.style.left = parseInt(w * Math.random()) + 'px'
    de.style.top = parseInt(h * Math.random()) + 'px'
    de.style.position = 'absolute'
    de.style.cursor = 'pointer'

    de._handlerDemo = true
  }
}
