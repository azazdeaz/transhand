require.context('./assets', false, /\.png$/);
var random = require('lodash/number/random');
var clone = require('lodash/lang/clone');
const INIT_PARAMS = {
  tx: 0, ty: 0,
  sx: 1, sy: 1,
  rz: 0,
  ox: 0.5, oy: 0.5,
};
const IMG_SIZE = 96;

export default function scatterThings() {

  var srcs = ['cookiejar001', 'fan001', 'kettle001', 'mixer001', 'radio001',
    'speaker001', 'speaker002', 'toaster001', 'tv001', 'tv002'].map(name => {
      return `./assets/obj_${name}.png`;
    });

  var rootNode = document.querySelector('#stuffs');

  for (let i = 0; i < 3; ++i) {

    var div = document.createElement('div');
    div.style.width = (232 + 132 * Math.random()) + 'px';
    div.style.height = (232 + 132 * Math.random()) + 'px';
    div.style.background = '#' + Math.random().toString(16).substr(-3);
    div.style.boxShadow = '1px 1px 4px 0px rgba(50, 50, 50, 0.75)';

    div._handlerParams = clone(INIT_PARAMS);

    place(div, rootNode);

    div._handlerDemo = 'boxer';

    div._handlerBase = {
        x: div.offsetLeft,
        y: div.offsetTop,
        w: div.offsetWidth,
        h: div.offsetHeight,
    };

    for (let j = 0; j < 3; ++j) {
      let img = createImg(srcs[random(srcs.length - 1)]);
      place(img, div);
    }
  }

function createImg(src) {
    var img = new Image();

    img._handlerDemo = 'transformer';

    img._handlerParams = clone(INIT_PARAMS);

    img.onload = function () {

      var transformSave;

      if (img.style.transform) {

        transformSave = img.style.transform;
        img.style.transform = '';
      }

      var br = img.getBoundingClientRect();

      img.style.transform = transformSave;

      img._handlerBase = {
        x: br.left,
        y: br.top,
        w: br.width,
        h: br.height,
      };
    };

    img.src = src;

    return img;
  }

  function place(de, deParent) {
    deParent.appendChild(de);

    var w = deParent.offsetWidth - (de.offsetWidth || IMG_SIZE);
    var h = deParent.offsetHeight - (de.offsetHeight || IMG_SIZE);

    de.style.left = parseInt(w * Math.random()) + 'px';
    de.style.top = parseInt(h * Math.random()) + 'px';
    de.style.position = 'absolute';
    de.style.cursor = 'pointer';
  }
}
