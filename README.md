![](https://img.shields.io/badge/status-not%20ready%20to%20use-red.svg?style=flat-square)

Transhand is a React based 2d transformation tool. It's aiming to have all the features that you would expect from a transform handler in a modern graphics editor.

Developed as part of the [Animachine project](https://github.com/animachine/animachine).

![](http://fat.gfycat.com/SilverExhaustedEquestrian.gif)

#### --- Work in progress --- 

####Demos:
[nested](http://azazdeaz.github.io/transhand/nested/), 
[iframe](http://azazdeaz.github.io/transhand/iframe/), 
[custom](http://azazdeaz.github.io/transhand/custom/)

####Install
```
bower install --save transhand
npm install --save transhand
```

###Current features:
- translate, rotate, scale, move transform origin
- shift + scale/move/rotate
- alt + scale from the origin or opposite side


###Basic useage
```javascript
//the current transformation
var transform = {
  tx: 0, ty: 0,     //translate in px
  sx: 1, sy: 1,     //scale
  rz: 0,            //rotation in radian
  ox: 0.5, oy: 0.5, //transform origin
}
//the bounding box without transformations
var rect = {x: 10, y: 10, w: 100, h: 100}
var onChange = (change) => {
  //change object contains only the transformed properties
  //ex. change = {tx: -12, sx: 1.12}
}

<Transhand
  transform = {transform}
  rect = {rect}
  onChange = {onChange}/>
```

###Basic useage with CSS Transform
```javascript
<CssTranshand 
  transforms = {transforms}
  deTarget = {transformedDOMElement}
  onChange = {onChange}/>
```
```CssTranshand``` is a wrapper for ```Transhand```. It use the provided DOM Element to calculate the ```rect``` and handle if the parent elements also transformed and when ```deTarget``` is inside an iframe.

###API ```//TODO```
