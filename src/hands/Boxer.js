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

var INIT_PARAMS = {
    x: 0, 
    y: 0, 
    w: 0, 
    h: 0,
};


function Boxer() {

    EventEmitter.call(this);

    this._params = _.clone(INIT_PARAMS);

    this._onDrag = this._onDrag.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._rafOnDrag = this._rafOnDrag.bind(this);
    this._onOverHitbox = this._onOverHitbox.bind(this);
    this._onOutHitbox = this._onOutHitbox.bind(this);
}

Boxer.id = 'boxer';

inherits(Boxer, EventEmitter);
var p = Boxer.prototype;

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

    var params = this._params;

    this._deBox.style.left = params.x + 'px';
    this._deBox.style.top = params.y + 'px';
    this._deBox.style.width = params.w + 'px';
    this._deBox.style.height = params.h + 'px';

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

    this.domElem = document.createElement('div');
    this.domElem.style.pointerEvents = 'none';

    this._deFullHit = document.createElement('div');
    this._deFullHit.style.position = 'absolute';
    this._deFullHit.style.pointerEvents = 'none';
    this._deFullHit.style.width = '100%';
    this._deFullHit.style.height = '100%';
    this.domElem.appendChild(this._deFullHit);

    this._deBox = document.createElement('div');
    this._deBox.style.position = 'absolute';
    this._deBox.style.boxSizing = 'border-box';
    this._deBox.style.border = 'solid 1px red';
    this._deBox.addEventListener('mouseenter', this._onOverHitbox);
    this._deBox.addEventListener('mouseleave', this._onOutHitbox);
    this.domElem.style.pointerEvents = 'auto';
    this.domElem.appendChild(this._deBox);


    var onFitstMove = function () {

        this._onOverHitbox();
        this._deBox.removeEventListener('mousemove', onFitstMove);
    }.bind(this);
};


module.exports = Boxer;