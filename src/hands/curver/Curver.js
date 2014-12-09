'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');
var jsBezier = require('./jsBezier');

var MOUSESTATES = {
    'move': 'move',
    '1000': 'ns-resize',
    '1100': 'nesw-resize',
    '0100': 'ew-resize',
    '0110': 'nwse-resize',
    '0010': 'ns-resize',
    '0011': 'nesw-resize',
    '0001': 'ew-resize',
    '1001': 'nwse-resize',
};

// point: {
//     anchore: {x: 0, y: 0, color: 'deepskyblue'},
//     leftHandler: {x: 0, y: 0, color: 'tomato'},
//     rightHandler: {x: 0, y: 0, color: 'tomato'},
//     linked: true,
//     close: true,
// }

var INIT_PARAMS = [];

function Curver() {

    EventEmitter.call(this);

    this._params = _.clone(INIT_PARAMS);

    this._buffPoint = [];
    this._buffPath = [];

    this._handlerRadius = 2;
    this._pathColor = 'aqua';
    this._pathAnchore = 'aqua';
    this._pathHandler = 'aqua';

    this._actions = [
        {target: 'anchor', action: 'move_anchor'},
        {target: 'anchor', action: 'delete_anchor', ctrl: true},
        {target: 'anchor', action: 'reset_anchor', alt: true},
        {target: 'handler', action: 'move_handler'},
        {target: 'handler', action: 'break_handler', ctrl: true},
        {target: 'curve', action: 'add_anchor'},
        {target: 'curve', action: 'drag_path', ctrl: true},
        {target: 'curve', action: 'rotate_path', alt: true},
        {target: 'curve', action: 'scale_path', ctrl: true, alt: true},
    ];

    this._onDrag = this._onDrag.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._rafOnDrag = this._rafOnDrag.bind(this);
    this._onOverHitbox = this._onOverHitbox.bind(this);
    this._onOutHitbox = this._onOutHitbox.bind(this);
}

Curver.id = 'curver';

inherits(Curver, EventEmitter);
var p = Curver.prototype;

p.setup = function (opt) {

    if (!this.domElem) {
        this.createGraphics();
    }

    this._path = opt.path;

    this._renderHandler();
};

p.activate = function () {

    if (this._isActivated) return;
    this._isActivated = true;

    window.addEventListener('mousemove', this._onMouseMove);
    this._deBox.addEventListener('mousedown', this._onMouseDown);
};

p.deactivate = function () {

    if (!this._isActivated) return;
    this._isActivated = false;
    
    window.removeEventListener('mousemove', this._onMouseMove);
    this._deBox.removeEventListener('mousedown', this._onMouseDown);
};



this._emitChange = (function () {

    return function (detailes) {

        this.emit('change', {
            path: this._path,
            detailes: detailes,
            flatPoints: flatPoints,
            flat: flat,
            svgPath: svgPath,
            clone: clone,
        });
    }

    function flatPoints() {

        var ret = [];
        
        this.path.forEach(function (point) {

            ret.push({
                x: point.handlerLeft.x,
                y: point.handlerLeft.y 
            });
            ret.push({
                x: point.anchore.x,
                y: point.anchore.y 
            });
            ret.push({
                x: point.handlerright.x,
                y: point.handlerright.y 
            });
        });

        return ret;
    }
    function flat () {/*TODO*/}
    function svgPath () {/*TODO*/}
    function clone () {/*TODO*/}
};







p._onMouseMove = function (e) {

    if (!this._isHandle && this._isOverHitbox) {
        
        this._setFinger(e);
    }
};

p._setFinger = function (e) {

    var shift = e.shiftKey,
        alt = e.altKey,
        ctrl = e.ctrlKey,
        mx = e.clientX,
        my = e.clientY,
        hitCurve = this._getHitCurve(mx, my),
        hitPoint = this._getHitPoint(mx, my),
        hitPointIdx = this._path.indexOf(hitPoint),
        hitAnchor = hitPointIdx !== -1 && hitPointIdx % 3 === 0,
        hitHandler = hitPointIdx !== -1 && hitPointIdx % 3 !== 0;

    var target = false;

    if (hitAnchor) {

        target = 'anchor';
    }
    else if (hitHandler) {

        target = 'handler';
    }
    else if (hitCurve) {
     
        target = 'curve';
    }

    this._finger = this._actions.find(function (action) {

        return action.target === target &&
            (!!action.ctrl) === ctrl &&
            (!!action.alt) === alt &&
            (!!action.shift) === shift;
    });

    this.setCursor((this._finger && this._finger.cursor) || 'auto');
};



p._onMouseDown = function (e) {

    if (!this._finger) {
        return;
    }

    e.stopPropagation();
    e.preventDefault();

    var mx = e.clientX,
        my = e.clientY,
        finger = this._finger,
        hitPoint = this._gtHitPoint(mx, my),
        hitPointIdx = this._path.indexOf(hitPoint);

    if (finger.action === 'add_anchor') {

        this._insertAnchore(this._currCurveIdx, mx, my);

        // this._currPointIdx = 
    }

    var hitCurve = !!ctx.getImageData(x, y, 1, 1).data[3];
    var hitPoint = this._params.find(function (point) {

        var dx = point.x - e.clientX,
            dy = point.y - e.clientY,
            dist = Math.sqrt(dx*dx + dy*dy);

        return dist <= handlerRadius;
    });

    this._isHandle = true;

    this._deFullHit.style.pointerEvents = 'auto';

    this._mdPos = {
        mx: e.clientX, 
        my: e.clientY,
        params: _.clone(this._params),
    };

    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('mouseleave', this._onMouseUp);
    window.addEventListener('mousemove', this._onDrag);
};

p._insertAnchor = function(idx, x, y) {



    this.emit('splice', {
        idx: this._hitCurveIdx + 1,
        points: [
            {x: mx, y: my},
            {x: mx, y: my},
            {x: mx, y: my},
        ],
    });
}

p._onDrag = function (e) {

    this._onDragMe = e;

    if (!this._rafOnDragRafId) {

        this._rafOnDragRafId = requestAnimationFrame(this._rafOnDrag);
    }
};

p._rafOnDrag = function () {

    var e = this._onDragMe;
    this._onDragMe = undefined;

    window.cancelAnimationFrame(this._rafOnDragRafId);
    this._rafOnDragRafId = undefined;

    var params = this._params,
        md = this._mdPos,
        finger = this._finger,
        mx = e.clientX, 
        my = e.clientY,
        dx = mx - md.mx,
        dy = my - md.my,
        change = {};


        
    if (finger === 'move') {

        change.x = md.params.x + dx;
        change.y = md.params.y + dy;
    }
    
    if (finger.charAt(0) === '1') {

        change.y = md.params.y + dy;
        change.h = md.params.h - dy;
    }

    if (finger.charAt(1) === '1') {

        change.w = md.params.w + dx;
    }

    if (finger.charAt(2) === '1') {

        change.h = md.params.h + dy;
    }

    if (finger.charAt(3) === '1') {

        change.x = md.params.x + dx;
        change.w = md.params.w - dx;
    }

    this.emit('change', change, 'transform');
};



p._onMouseUp = function () {

    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('mouseleave', this._onMouseUp);
    window.removeEventListener('mousemove', this._onDrag);

    if (this._rafOnDragRafId) {
        this._rafOnDrag();
    }
    
    this._isHandle = false;

    this._deFullHit.style.pointerEvents = 'none';
};

p._onOverHitbox = function () {

    this._isOverHitbox = true;
};

p._onOutHitbox = function () {

    this._isOverHitbox = false;
};









p._getHitPoint = function (x, y) {

    var handlerRadius = this._handlerRadius;

    return this._points.find(function (point, idx) {

        var dx = point.x - x,
            dy = point.y - y,
            dist = Math.sqrt(dx*dx + dy*dy);

        return dist <= handlerRadius;
    });
};

p._getHitCurve = function (x, y) {

    var minDist = 3, 
        points = this._points,
        dist, curveIdx,
        currDist,
        curve = [];

    for (var i = 0, l = points.length; i < l; i += 3) {

        curve[0] = points[i];
        curve[1] = points[i+1];
        curve[2] = points[i+2];
        curve[3] = points[i+3];

        currDist = jsBezier.distanceFromCurve(point, curve).distance;

        if (currDist <= minDist && (dist === undefined || currDist < dist)) {

            curveIdx = i;
            dist = currDist;
        }
    }

    return curveIdx;
};

p._renderHandler = function () {

    var that = this, i, l, point, pointB, cmd;

    for (i = 0, l = this._path.length - 1; i < l; ++i) {

        point = this._path[i];
        pointB = this._path[i+1];

        if (!point.de) createPath(point);
        if (!point.anchore.de) createAnchore(point.anchore);
        if (!point.leftHandler.de) createHandler(point.leftHandler);
        if (!point.rightHandler.de) createHandler(point.rightHandler);

        cmd = 'M' + point[0].anchore.x + ',' + point[0].anchore.y + ' ';{
        cmd += 'C' + point.handlerRight.x + ',' + point.handlerRight.y + ' ';
        cmd += pointB.handlerLeft.x + ',' + pointB.handlerLeft.y + ' ';
        cmd += pointB.anchore.x + ',' + pointB.anchore.y + ' ';
        point.de.setAttribute('d', cmd);

        moveCircle(point.anchore);

        moveCircle(point.leftHandler);
        moveLine(point.leftHandler, point.anchore);

        moveCircle(point.rightHandler);
        moveLine(point.rightHandler, point.anchore);
    }




    function createPath(opt) {

        opt._de = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        opt._de.style.stroke = opt.color || that._pathColor;
        opt._de.style.strokeWidth = '5';
        opt._de.style.fill = 'none';
        that._dePathCont.appendChild(opt._de);
    }

    function createAnchore(opt) {

        opt._de = createCircle(opt.color || that._anchoreColor);
        that._deAnchoreCont.appendChild(opt._de);
    }

    function createHandler(opt) {

        opt._de = createCircle(opt.color || that._handlerColor);
        that._deHandlerCont.appendChild(opt._de);

        opt._deLine = createLine(opt.color || that._handlerColor);
        that._deHandlerCont.appendChild(opt._deLine);
    }

    function createCircle(color) {

        var de = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        de.setAttribute('r', 12);
        de.style.fill = color;

        return de;
    }

    function createLine(color) {

        var de = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        de.style.stroke = opt.color || that._pathColor;
        de.style.strokeWidth = '1';
        de.style.pointerEvents = 'none';

        return de;
    }

    function moveCircle(pt) {

        pt._de.setAttribute('cx', pt.x);
        pt._de.setAttribute('cy', pt.y);
    }

    function moveLine(pt1, pt2) {

        pt1._deLine.setAttribute('x1', pt1.x);
        pt1._deLine.setAttribute('y1', pt1.y);
        pt1._deLine.setAttribute('x2', pt2.x);
        pt1._deLine.setAttribute('y2', pt2.y);
    }
};























p._setCursor = function (cursor) {

    this._deBox.style.cursor = cursor;
    this._deFullHit.style.cursor = cursor
};







p.createGraphics = function () {

    this._domElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._domElem.style.overflow = 'visible';
};


module.exports = Curver;