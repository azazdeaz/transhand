var random = require('lodash/number/random');
var clone = require('lodash/lang/clone');
var pullAt = require('lodash/array/pullAt');

const INIT_PARAMS = {
  tx: 0, ty: 0,
  sx: 1, sy: 1,
  rz: 0,
  ox: 0.5, oy: 0.5,
};

export default function scatterThings() {

  var colors = ['#7FDBFF', '#0074D9', '#01FF70', '#001F3F', '#39CCCC', '#3D9970',
    '#2ECC40', '#FF4136', '#85144B', '#FF851B', '#B10DC9', '#FFDC00', '#F012BE',
    '#aaa', '#fff', '#111', '#ddd'];

  var takeOne = arr => pullAt(arr, random(arr.length - 1));

  var rootNode = document.querySelector('#stuffs');

  let deParent = rootNode;


  for (
    let w = 242 + 132 * Math.random(),
      h = 242 + 132 * Math.random(),
      j = 0; j < 3; ++j
  ) {
    deParent = createElement(w, h, 'iframe', deParent);
    w -= 23;
    h -= 23;
  }

  for (let j = 0; j < 3; ++j) {
    createElement(63, 63, 'div', deParent);
  }

  function createElement(w, h, type, deParent) {
    var div = document.createElement(type);
    div.style.width = w + 'px';
    div.style.height = h + 'px';
    div.style.backgroundColor = takeOne(colors);
    div.style.boxShadow = '1px 1px 4px 0px rgba(50, 50, 50, 0.75)';
    div._handlerParams = clone(INIT_PARAMS);

    place(div, deParent);

    div._handlerBase = {
      x: div.offsetLeft,
      y: div.offsetTop,
      w: div.offsetWidth,
      h: div.offsetHeight,
    };

    return div;
  }

  function place(de, deParent) {
    deParent.appendChild(de);

    var w = deParent.offsetWidth - de.offsetWidth;
    var h = deParent.offsetHeight - de.offsetHeight;

    de.style.left = parseInt(w * Math.random()) + 'px';
    de.style.top = parseInt(h * Math.random()) + 'px';
    de.style.position = 'absolute';
    de.style.cursor = 'pointer';

    de._handlerDemo = true;
  }
}
