![](http://img.shields.io/badge/status-draft-red.svg?style=flat-square)

Transhand is a transform tool for web applications.

Work in progress.

Developed as part of the [Animachine project](https://github.com/animachine/animachine).


![](http://fat.gfycat.com/SilverExhaustedEquestrian.gif)

####Demos:
[transformer][demo-transformer]
[nested transforms][demo-nested]
[curver][demo-curver]

####Install
```
bower install --save transhand
npm install --save transhand
```

####Usage
```javascript
var handler = new Transhand(),
    de = document.querySelector('#mazsola'),
    br = de.getBoundingClientRect();

//setup for css transform 2d editing
handler.setup({
    hand: {
      type: 'transformer',
      base: {x: br.left, y: br.top, w: br.width, h: br.height},
      params: {tx: 123, ty: -3, sx: 1.2, sy: 1, rz: 0.12, ox: 0.5, oy: 0.6},
    }
  });
}

//setup for layout editing
handler.setup({
  hand: {
    type: 'boxer',
    params: {x: br.left, y: br.top, w: br.width, h: br.height},
  }
});

handler.on('change', function (changedParams) {
  
  //The handler doesn't refresh itself,
  //you can make modifications on the dom using the "changedParams"
  //and setup the handler again.
  ```
  [For more information check the source of the demo](https://github.com/animachine/transhand/blob/master/demo/0/script.js)
  ```javascript
});
```

[demo-transformer]: https://animachine.github.io/transhand/demos/0/
[demo-nested]: https://animachine.github.io/transhand/demos/1/
[demo-curver]: https://animachine.github.io/transhand/demos/curver/
