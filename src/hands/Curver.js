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

    _.extend(this._params, INIT_PARAMS, opt.params);
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





p._onMouseDown = function (e) {

    if (!this._finger) {
        return;
    }

    e.stopPropagation();
    e.preventDefault();

    var handlerRadius = this._handlerRadius,
        shift = e.shiftKey,
        alt = e.altKey,
        ctrl = e.ctrlKey;

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

p._onMouseMove = function (e) {

    if (!this._isHandle && this._isOverHitbox) {
        
        this._setFinger(e);
    }
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














p._setFinger = function (e) {

    var params = this._params,
        mx = e.clientX,
        my = e.clientY,
        diff = 6,
        dTop = Math.abs(params.y - my),
        dRight = Math.abs((params.x + params.w) - mx),
        dBottom = Math.abs((params.y + params.h) - my),
        dLeft = Math.abs(params.x - mx),
        top = dTop < diff,
        right = dRight < diff,
        bottom = dBottom < diff,
        left = dLeft < diff,
        inside = mx > params.x && mx < params.x + params.w && my > params.y && my < params.y + params.h;

    if (params.w * params.sx < diff * 2 && inside) {
        
        left = false;
        right = false;
    }

    if (params.h * params.sy < diff * 2 && inside) {
    
        top = false;
        bottom = false;
    }
    
    if (top || right || bottom || left) {
        this._finger = ('000' + (top * 1000 + right * 100 + bottom * 10 + left * 1)).substr(-4);
    }
    else if (inside) {

        this._finger = 'move';
    }
    
    if (this._finger) {

        this._setCursor(MOUSESTATES[this._finger]);
    }
    else {
        this._setCursor('auto');
    }
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