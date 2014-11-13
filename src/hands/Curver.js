'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');

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

var INIT_PARAMS = [];

function Curver() {

    EventEmitter.call(this);

    this._params = _.clone(INIT_PARAMS);

    this._buffPoint = [];
    this._buffPath = [];

    this._handlerRadius = 2;
    this._color = 'aqua';

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

    this._recyclePath(this._path);
    this._path = this._clonePath(opt.path);

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



this._clonePath = function (srcPath) {

    var path = this._buffPath.pop() || [];

    srcPath.forEach(function (srcPoint) {

        var point = this._buffPoint.pop() || {};
        point.x = srcPoint.x;
        point.y = srcPoint.y;
        path.push(point);
    }, this);

    return path;
};

this._recyclePath = function (path) {

    this._buffPoint.push.apply(this._buffPoint, path.splice(0));
    this._buffPath.push(path);
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
        hitCurve = !!ctx.getImageData(mx, my, 1, 1).data[3],
        hitPoint = this._gtHitPoint(mx, my),
        hitPointIdx = this._path.indexOf(hitPoint),
        hitAnchor = hitPointIdx !== -1 && hitPointIdx % 3 === 0,
        hitHandler = hitPointIdx !== -1 && hitPointIdx % 3 !== 0;

    }, this);

    var finger = false;

    if (hitAnchor) {

        if (alt) finger = 'reset_handlers';
        else if (ctrl) finger = 'delete_anchor';
        else finger = 'move_anchor';
    }
    else if (hitHandler) {

        else if (ctrl) finger = 'break_handler';
        else finger = 'move_handler';
    }
    else if (hitCurve) {

        if (ctrl && alt) finger = 'scale_path';
        else if (alt) finger = 'rotate_path';
        else if (ctrl) finger = 'drag_path';
        else finger = 'add_anchor';
    }

    this._finger = finger;
};

p._onMouseDown = function (e) {

    if (!this._finger) {
        return;
    }

    e.stopPropagation();
    e.preventDefault();

    var mx = e.clientX,
        my = e.clientY,
        hitPoint = this._gtHitPoint(mx, my),
        hitPointIdx = this._path.indexOf(hitPoint);

    if (finger === 'add_anchor') {

        // this.emit('addAnchore'//...?
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
}

p._renderHandler = function () {

    var params = this._params,
        canvas = this.domElem,
        ctx = this.ctxDomElem,
        canvasCH = this._canvasCurveHit,
        ctxCH = this._ctxCurveHit,
        minX, minY, maxX, maxY,
        handlerRadius = this._handlerRadius,
        PI2 = Math.PI * 2;
        i, buff = [];

    params.forEach(function (point) {

        if (minX === undefined || point.x < minX) minX = point.x;
        if (minY === undefined || point.y < minY) minY = point.y;
        if (maxX === undefined || point.x < maxX) maxX = point.x;
        if (maxY === undefined || point.y < maxY) maxY = point.y;
    });

    canvas.style.left = minX + 'px';
    canvas.style.top = minY + 'px';
    canvas.width = maxX - minX;
    canvas.height = maxY - minY;

    canvasCH.width = maxX - minX;
    canvasCH.height = maxY - minY;

    ctx.strokeStyle = this._color;

    ctxCH.lineWidth = 2;

    ctx.moveTo(param[0].x, param[0].y);
    for (i = 1, l = params.length; i < l; += 3) {

        ctx.bezierCurveTo(
            param[i].x, param[i].y,
            param[i+1].x, param[i+1].y,
            param[i+2].x, param[i+2].y);
        
        ctxCH.bezierCurveTo(
            param[i].x, param[i].y,
            param[i+1].x, param[i+1].y,
            param[i+2].x, param[i+2].y);
    }

    for (i = 1, l = params.length; i < l; += 2) {

        ctx.beginPath();
        ctx.moveTo(param[i].x, param[i].y);
        ctx.lineTo(param[i+1].x, param[i+1].y);
    }

    params.forEach(function (point) {

        ctx.arc(point.x, point.y, handlerRadius, 0, PI2);
    });
    ctx.stroke();
};























p._setCursor = function (cursor) {

    this._deBox.style.cursor = cursor;
    this._deFullHit.style.cursor = cursor
};







p.createGraphics = function () {

    this.domElem = document.createElement('canvas');
    this.domElem.style.pointerEvents = 'none';
    this.ctxDomElem = this.domElem.getContext('2d');

    this._canvasCurveHit = document.createElement('canvas');
    this._canvasCurveHit.style.pointerEvents = 'none';
    this._ctxCurveHit.getContext('2d');
};


module.exports = Curver;