![](https://img.shields.io/badge/status-beta-orange.svg?style=flat-square) [![npm](https://img.shields.io/npm/dm/transhand.svg?style=flat-square)](https://www.npmjs.com/package/transhand)

Transhand is a React based 2d transformation tool. It's aiming to have all the features that you would expect from a transform handler in a modern graphic editor.

###Demos
[nested](http://azazdeaz.github.io/transhand/nested/),
[custom](http://azazdeaz.github.io/transhand/custom/),
[iframe(wip)](http://azazdeaz.github.io/transhand/iframe/)

![](http://fat.gfycat.com/SilverExhaustedEquestrian.gif)

Developed as part of the [Animachine project](https://github.com/animachine/animachine).

###Install
```
npm install --save transhand
```

###Current features
- translate, rotate, scale, move transform origin
- shift + guided scale/move/rotate
- alt + scale from the opposite side


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
  transform = {transform}
  deTarget = {transformedDOMElement}
  onChange = {onChange}/>
```
```CSSTranshand``` is a wrapper for ```Transhand```. It use the provided DOM Element to calculate the ```rect``` and handle if the parent elements are onalso transformed and when ```deTarget``` is inside an iframe.

###API
####Transhand
 - ```transform```: [see above](#basic-usage)
 - ```rect```: [see above](#basic-usage)
 - ```stroke = {strokeWidth: '1', stroke: 'lime'}```:  A set of svg attributes to customize drawed svg.

**events:**
 - ```onChange(change)```: [see above](#basic-usage)
 - ```onClick(mouseEvent)```: Called on the user just clicks on the handler and not changing it. Useful for selecting items behind the handler.
 - ```onStartDrag```: Called on the user grab the handler.
 - ```onEndDrag```: Called on the user release the handler. 

**advanced customization:**
 - ```rotateFingerDist = 16```: The width of the rotate hit area.
 - ```originRadius = 6```: The radius of the transform origin hit area.
 - ```coordinator = ```[```new DefaultCoordinator()```](src/DefaultCoordinator.js): Use this to change the way as Transhand convert global coordinates into its local coordinate system (ex. mouse positions) and back (ex. render to screen). Coordinator is an object with two functions ```globalToLocal(point):point``` and ```localToGlobal(point):point```.  If you need more detail check out the source.
 - ```grabEvent```:  If this parameter is presented Transhand will simulate the mouse down event with it. It's useful when you want to drag the target immediately after selecting it with mouse down. See it in use in the [demo sources](demo/src/nested/App.jsx).
 - ```hints = ```[```default```](src/Transhand.jsx#L67):  Map of tooltips for the different transformation types.  
 - ```cursors = ```[```new Cursors()```](src/Cursor.js):  Map of cursors for the different transformation types.
 - ```DesignComponent = ```[```TranshandDesign```](src/TranshandDesign.jsx):  You can replace the basic ```Component``` that Transhand renders to fully customize its appearance.
 - ```CursorHintDesignComponent = ```[```CursorHintDesign```](src/cursorHint/CursorHintDesign.jsx):  You can replace the basic ```Component``` that CursorHint renders to fully customize its appearance.
 - ```transformTypes = ['translate', 'rotate', 'scale', 'origin']```: List of the allowed transform functions.

####CSSTranshand
  Inherits all the properties of transhand but replaces ```coordinator``` and ```rect```  with an extra property called ```deTarget```.  [see above](#basic-usage-with-css-transform)
 
Although it's already usable, most of the features are still in progress. If you find something that is may not working as expected or you miss something do not hesitate to open an issue!
