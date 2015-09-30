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
  var colors = ['#7FDBFF', '#0074D9', '#001F3F', '#39CCCC', '#3D9970',
    '#FF4136', '#85144B', '#FF851B', '#B10DC9', '#FFDC00', '#F012BE',
    '#aaa', '#fff', '#ddd']

  var takeOne = arr => pullAt(arr, random(arr.length - 1))

  var rootNode = document.querySelector('#stuffs')
  document.body.style.backgroundColor = takeOne(colors)
  document.querySelector('#source > a').style.color = tinycolor.mostReadable(
    document.body.style.backgroundColor,
    colors
  ).toHexString()
  // for (let j = 0; j < 7; ++j) {
  //   createElement(63, 63, 'div', rootNode)
  // }

  createElement(
    242 + 132 * Math.random(),
    242 + 132 * Math.random(),
    'iframe',
    rootNode,
    function (e) {
      var iframe = e.target
      iframe.style.border = 'none'
      iframe.contentDocument.write('this is an iframe (WIP)')
      for (let j = 0; j < 3; ++j) {
        createElement(63, 63, 'div', iframe.contentDocument.body)
      }
    }
  )


  function createElement(w, h, type, deParent, onload) {
    var de = document.createElement(type)
    de.style.width = w + 'px'
    de.style.height = h + 'px'
    de.style.backgroundColor = takeOne(colors)
    de.style.boxShadow = '1px 1px 4px 0px rgba(50, 50, 50, 0.75)'
    de._handlerTransform = clone(INIT_TRANSFORM)

    de.onload = onload

    place(de, deParent)

    return de
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
