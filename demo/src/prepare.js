require.context('./assets', false, /\.png$/);

export default function scatterThings() {

  var srcs = ['cookiejar001', 'fan001', 'kettle001', 'mixer001', 'radio001',
    'speaker001', 'speaker002', 'toaster001', 'tv001', 'tv002'].map(name => {
      return `./assets/obj_${name}.png`;
    });

  var rootNode = document.querySelector('#stuffs');

  // for (var i = 0; i < 12; ++i) {
  //
  //   var div = document.createElement('div');
  //   div.style.width = (32 + 132 * Math.random()) + 'px';
  //   div.style.height = (32 + 132 * Math.random()) + 'px';
  //   div.style.background = '#' + Math.random().toString(16).substr(-3);
  //   div.style.boxShadow = '1px 1px 4px 0px rgba(50, 50, 50, 0.75)';
  //
  //   place(div);
  //
  //   div._handlerDemo = 'boxer';
  //
  //   div._handlerParams = {
  //       x: div.offsetLeft,
  //       y: div.offsetTop,
  //       w: div.offsetWidth,
  //       h: div.offsetHeight,
  //   };
  // }

  srcs.forEach(function (src) {

    var img = new Image();

    img._handlerDemo = 'transformer';

    img._handlerParams = {
      tx: 0, ty: 0,
      sx: 1, sy: 1,
      rz: 0,
      ox: 0.5, oy: 0.5,
    };

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

    place(img);

    img.src = src;
  });

  function place(de) {

    de.style.left = parseInt((window.innerWidth - 150) * Math.random()) + 'px';
    de.style.top = parseInt((window.innerHeight - 150) * Math.random()) + 'px';
    de.style.position = 'absolute';
    de.style.cursor = 'pointer';
    rootNode.appendChild(de);
  }
}
