![](https://img.shields.io/badge/status-beta-orange.svg?style=flat-square)

Transhand is a React based 2d transformation tool. It's aiming to have all the features that you would expect from a transform handler in a modern graphic editor.

Developed as part of the [Animachine project](https://github.com/animachine/animachine).

![](http://fat.gfycat.com/SilverExhaustedEquestrian.gif)

###Demos
[nested](http://azazdeaz.github.io/transhand/nested/),
[iframe](http://azazdeaz.github.io/transhand/iframe/),
[custom](http://azazdeaz.github.io/transhand/custom/)

###Install
```
npm install --save transhand
```

###Current features
- translate, rotate, scale, move transform origin
- shift + scale/move/rotate
- alt + scale from the origin or opposite side


###Basic usage
```javascript
import { Transhand } from 'transhand'

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
  //change object contains only the changed properties
  //ex. change = {tx: -12, sx: 1.12}
}

<Transhand
  transform = {transform}
  rect = {rect}
  onChange = {onChange}/>
```

###Basic usage with CSS Transform
```javascript
import { CSSTranshand } from 'transhand'

<CSSTranshand
  transforms = {transforms}
  deTarget = {transformedDOMElement}
  onChange = {onChange}/>
```
```CSSTranshand``` is a wrapper for ```Transhand```. It use the provided DOM Element to calculate the ```rect``` and handle if the parent elements are onalso transformed and when ```deTarget``` is inside an iframe.

###API
####Transhand
 - ```transform```: [see above](#basic-usage)
 - ```rect```: [see above](#basic-usage)
 - ```rotateFingerDist = 16```: The width of the rotate hit area.
 - ```originRadius = 6```: The radius of the transform origin hit area.
 - ```coordinator = new DefaultCoordinator()```: Use this to change the way as Transhand convert global coordinates into its local coordinate system (ex. mouse positions) and back (ex. render to screen). Coordinator is an object with two functions ```globalToLocal(point):point``` and ```localToGlobal(point):point```.  If you need more detail check out the source.
 - ```stroke = {strokeWidth: '1', stroke: 'lime'}```:  A set of svg attributes to customize drawed svg.
 - ```DesignComponent = TranshandDesign```:  You can replace the basic dumb component that Transhand renders to fully customize its appearance. Please check out [the source](src/TranshandDesign.jsx) for more detail.
 - ```tooltips```: ```//TODO`
 - ```cursors```: ```//TODO`
 - **events:**
   - ```onChange(change)```: [see above](#basic-usage)
   - ```onClick(mouseEvent)```: Called on the user just clicks on the handler and not changing it. Useful for selecting items behind the handler.
   - ```onStartDrag```: Called on the user grab the handler.
   - ```onEndDrag```: Called on the user release the handler. ``
 
####CSSTranshand
  Inherits all the properties of transhand but replaces ```coordinator``` and ```rect```  with an extra property called ```deTarget```.  [see above](#basic-usage-with-css-transform)
