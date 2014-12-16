'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var _ = require('lodash');
var makeDraggable = require('../../make-draggable');

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
//     anchor: {x: 0, y: 0, color: 'deepskyblue'},
//     handleLeft: {x: 0, y: 0, color: 'tomato'},
//     handleRight: {x: 0, y: 0, color: 'tomato'},
//     linked: true,
//     close: true,
// }


function Curver() {

    EventEmitter.call(this);

    this._points = [];

    this._handleRadius = 3;
    this._color = {
        path: 'aqua',
        anchor: 'aqua',
        handle: 'aqua',
    };

    this._clickActions = [
        {target: 'anchor', action: 'move_anchor'},
        {target: 'anchor', action: 'remove_point', ctrl: true},
        {target: 'anchor', action: 'reset_anchor', alt: true},
        {target: 'handle', action: 'move_handle'},
        {target: 'handle', action: 'unlink_handle', alt: true},
        {target: 'curve', action: 'add_point'},
        {target: 'curve', action: 'drag_path', ctrl: true},
        {target: 'curve', action: 'rotate_path', alt: true},
        {target: 'curve', action: 'scale_path', ctrl: true, alt: true},
    ];
}

Curver.id = 'curver';

inherits(Curver, EventEmitter);
var p = Curver.prototype;
module.exports = Curver;

p.setup = function (opt) {

    if (!this.domElem) {
        this.createGraphics();
    }

    while (this._points.length) {

        this._splicePoint(0);
    }

    opt.path.forEach(function (point, idx) {

        this._addPoint(point, idx);
    }, this);

    this.render();
};

p.activate = function () {

    if (this._isActivated) return;
    this._isActivated = true;
};

p.deactivate = function () {

    if (!this._isActivated) return;
    this._isActivated = false;
};



p._emitChange = (function () {

    return function (detailes) {

        this.emit('change', {
            path: this._points,
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
                x: point.handleLeft.x,
                y: point.handleLeft.y 
            });
            ret.push({
                x: point.anchor.x,
                y: point.anchor.y 
            });
            ret.push({
                x: point.handleright.x,
                y: point.handleright.y 
            });
        });

        return ret;
    }
    function flat () {/*TODO*/}
    function svgPath () {/*TODO*/}
    function clone () {/*TODO*/}
}());

p._getClickAction = function (target, e) {

    var ctrl = e.ctrlKey,
        shift = e.shiftlKey,
        alt = e.altKey,
        ret;

    this._clickActions.some(function (clickAction) {

        if (clickAction.target === target &&
            !!clickAction.ctrl === !!ctrl &&
            !!clickAction.shift === !!shift &&
            !!clickAction.alt === !!alt)
        {
            ret = clickAction.action;
            return true;
        }
    });

    return ret;
}







p.render = function () {

    var i, l, point, pointB, cmd;

    for (i = 0, l = this._points.length; i < l; ++i) {
        
        point = this._points[i];

        if (i !== l - 1) {
            
            pointB = this._points[i+1];
            
            cmd = 'M' + point.anchor.x + ',' + point.anchor.y + ' ';
            cmd += 'C' + point.handleRight.x + ',' + point.handleRight.y + ' ';
            cmd += pointB.handleLeft.x + ',' + pointB.handleLeft.y + ' ';
            cmd += pointB.anchor.x + ',' + pointB.anchor.y + ' ';
            point._de.setAttribute('d', cmd);
        }

        moveCircle(point.anchor);

        moveCircle(point.handleLeft);
        moveLine(point.handleLeft, point.anchor);

        moveCircle(point.handleRight);
        moveLine(point.handleRight, point.anchor);

        
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

p._addPoint = function (point, idx) {

    var that = this;

    this._points.splice(idx, 0, point);

    createPath();
    createAnchor();
    createHandle(point.handleLeft);
    createHandle(point.handleRight);

    return point;

    function createPath() {

        point._de = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        point._de.style.stroke = that._color.path;
        point._de.style.strokeWidth = '2';
        point._de.style.fill = 'none';
        point._de.style.pointerEvents = 'auto';
        that._dePathCont.appendChild(point._de);

        point._de.addEventListener('mousedown', function (e) {

            var newPoint = this._addPoint(this._createPoint({
                anchor: {x: e.x, y: e.y},
                handleLeft: {x: e.x - 25, y: e.y},
                handleRight: {x: e.x + 25, y: e.y},
                linked: true,
            }), this._points.indexOf(point) + 1);

            newPoint.anchor._dragger.emitDown(e);
        }.bind(that));
    }

    function createAnchor() {

        point.anchor._de = that._color.anchor;
        that._deAnchorCont.appendChild(point.anchor._de);

        point.anchor._dragger = makeDraggable({
            deTarget: point.anchor._de,
            thisArg: that,
            onDown: function (e) {

                var action = this._getClickAction('anchor', e);

                if (action === 'reset_anchor') {

                    point.handleLeft.x = point.anchor.x;
                    point.handleLeft.y = point.anchor.y;
                    point.handleRight.x = point.anchor.x;
                    point.handleRight.y = point.anchor.y;
                    point.linked = true;

                    this.render();

                    e = Object.create(e);
                    e.syncronSize = true;

                    point.handleLeft._dragger.emitDown(e);

                    return false;
                }
                else if (action === 'remove_point') {

                    this._splicePoint(point);

                    return false;
                }

                return {
                    axStart: point.anchor.x,
                    ayStart: point.anchor.y,
                    hlxStart: point.handleLeft.x,
                    hlyStart: point.handleLeft.y,
                    hrxStart: point.handleRight.x,
                    hryStart: point.handleRight.y,
                }
            },
            onDrag: function (md) {

                point.anchor.x = md.axStart + md.dx;
                point.anchor.y = md.ayStart + md.dy;
                point.handleLeft.x = md.hlxStart + md.dx;
                point.handleLeft.y = md.hlyStart + md.dy;
                point.handleRight.x = md.hrxStart + md.dx;
                point.handleRight.y = md.hryStart + md.dy;

                this._emitChange({type: 'move_anchor'});
                this.render();
            }
        });
    }

    function createHandle(handle) {

        var oppositeHandle = point.handleLeft === handle ? point.handleRight : point.handleLeft;

        handle._de = createCircle(handle.color || that._color.handle);
        that._deHandleCont.appendChild(handle._de);

        handle._deLine = createLine(handle.color || that._color.handle);
        that._deHandleCont.appendChild(handle._deLine);

        handle._dragger = makeDraggable({
            deTarget: handle._de,
            thisArg: that,
            onDown: function (e) {

                var action = this._getClickAction('handle', e);
                
                if (!e.syncronSize && action === 'unlink_handle') {

                    point.linked = false; 
                }
             
                return {
                    xStart: handle.x,
                    yStart: handle.y,
                    oppositeLength: dist(oppositeHandle, point.anchor),
                    syncronSize: e.syncronSize,
                }
            },
            onDrag: function (md) {

                handle.x = md.xStart + md.dx;
                handle.y = md.yStart + md.dy;

                if (point.linked) {

                    var dx = handle.x - point.anchor.x,
                        dy = handle.y - point.anchor.y,
                        rad = Math.atan2(dy, dx),
                        length = md.syncronSize ? dist(handle, point.anchor) : md.oppositeLength;

                    oppositeHandle.x = point.anchor.x - (length * Math.cos(rad));
                    oppositeHandle.y = point.anchor.y - (length * Math.sin(rad));
                }

                this._emitChange({type: 'move_handle'});
                this.render();
            }
        });
    }

    function createCircle(color) {

        var de = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        de.setAttribute('r', that._handleRadius);
        de.style.fill = color;
        de.style.cursor = 'pointer';
        de.style.pointerEvents = 'auto';

        return de;
    }

    function createLine(color) {

        var de = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        de.style.stroke = color;
        de.style.strokeWidth = '1';
        de.style.pointerEvents = 'none';

        return de;
    }

    function dist(pa, pb) {

        var ox = pa.x - pb.x,
            oy = pa.y - pb.y;
        
        return Math.sqrt(ox*ox + oy*oy);
    }
};

p._splicePoint = function (idx) {

    if (typeof(idx) === 'object') {

        idx = this._points.indexOf(idx);
    }

    var removedPoint = this._points.splice(idx, 1)[0];

    this._emitChange({type: 'splice', idx: idx});
    
    this.render();

    removedPoint._de.parentNode.removeChild(removedPoint._de);
    removedPoint.anchor._de.parentNode.removeChild(removedPoint.anchor._de);
    removedPoint.handleLeft._de.parentNode.removeChild(removedPoint.handleLeft._de);
    removedPoint.handleLeft._deLine.parentNode.removeChild(removedPoint.handleLeft._deLine);
    removedPoint.handleRight._de.parentNode.removeChild(removedPoint.handleRight._de);
    removedPoint.handleRight._deLine.parentNode.removeChild(removedPoint.handleRight._deLine);

    this._buffPoint.push(removedPoint);
};

p._createPoint = function (src) {

    var point = this._buffPoint.pop() || {
        anchor: {},
        handleLeft: {},
        handleRight: {},
    };

    point.anchor.x = src.anchor ? src.anchor.x || 0 : 0;
    point.anchor.y = src.anchor ? src.anchor.y || 0 : 0;
    point.handleLeft.x = src.handleLeft ? src.handleLeft.x || 0 : 0;
    point.handleLeft.y = src.handleLeft ? src.handleLeft.y || 0 : 0;
    point.handleRight.x = src.handleRight ? src.handleRight.x || 0 : 0;
    point.handleRight.y = src.handleRight ? src.handleRight.y || 0 : 0;

    return point;
}



p.createGraphics = function () {

    this.domElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.domElem.style.overflow = 'visible';

    this._dePathCont = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.domElem.appendChild(this._dePathCont);

    this._deHandleCont = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.domElem.appendChild(this._deHandleCont);

    this._deAnchorCont = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.domElem.appendChild(this._deAnchorCont);
};