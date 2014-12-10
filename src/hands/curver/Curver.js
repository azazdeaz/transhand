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
//     handlerLeft: {x: 0, y: 0, color: 'tomato'},
//     handlerRight: {x: 0, y: 0, color: 'tomato'},
//     linked: true,
//     close: true,
// }


function Curver() {

    EventEmitter.call(this);

    this._points = [];

    this._handlerRadius = 3;
    this._color = {
        path: 'aqua',
        anchor: 'aqua',
        handler: 'aqua',
    };

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

        this._removePoint(0);
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
                x: point.handlerLeft.x,
                y: point.handlerLeft.y 
            });
            ret.push({
                x: point.anchor.x,
                y: point.anchor.y 
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
}());







p.render = function () {

    var i, l, point, pointB, cmd;

    for (i = 0, l = this._points.length; i < l; ++i) {
        
        point = this._points[i];

        if (i !== l - 1) {
            
            pointB = this._points[i+1];
            
            cmd = 'M' + point.anchor.x + ',' + point.anchor.y + ' ';
            cmd += 'C' + point.handlerRight.x + ',' + point.handlerRight.y + ' ';
            cmd += pointB.handlerLeft.x + ',' + pointB.handlerLeft.y + ' ';
            cmd += pointB.anchor.x + ',' + pointB.anchor.y + ' ';
            point._de.setAttribute('d', cmd);
        }

        moveCircle(point.anchor);

        moveCircle(point.handlerLeft);
        moveLine(point.handlerLeft, point.anchor);

        moveCircle(point.handlerRight);
        moveLine(point.handlerRight, point.anchor);
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
    createHandler(point.handlerLeft);
    createHandler(point.handlerRight);

    return point;

    function createPath() {

        point._de = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        point._de.style.stroke = point.color || that._color.path;
        point._de.style.strokeWidth = '2';
        point._de.style.fill = 'none';
        point._de.style.pointerEvents = 'auto';
        that._dePathCont.appendChild(point._de);

        point._de.addEventListener('mousedown', function (e) {

            var newPoint = this._addPoint({
                anchor: {x: e.x, y: e.y},
                handlerLeft: {x: e.x - 25, y: e.y},
                handlerRight: {x: e.x + 25, y: e.y},
            }, this._points.indexOf(point) + 1);

            newPoint.anchor._dragger.emitDown(e);
        }.bind(that));
    }

    function createAnchor() {

        point.anchor._de = createCircle(point.anchor.color || that._color.anchor);
        that._deAnchorCont.appendChild(point.anchor._de);

        point.anchor._dragger = makeDraggable({
            deTarget: point.anchor._de,
            thisArg: that,
            onDown: function () {
                return {
                    axStart: point.anchor.x,
                    ayStart: point.anchor.y,
                    hlxStart: point.handlerLeft.x,
                    hlyStart: point.handlerLeft.y,
                    hrxStart: point.handlerRight.x,
                    hryStart: point.handlerRight.y,
                }   
            },
            onDrag: function (md) {

                point.anchor.x = md.axStart + md.dx;
                point.anchor.y = md.ayStart + md.dy;
                point.handlerLeft.x = md.hlxStart + md.dx;
                point.handlerLeft.y = md.hlyStart + md.dy;
                point.handlerRight.x = md.hrxStart + md.dx;
                point.handlerRight.y = md.hryStart + md.dy;

                this._emitChange({type: 'move_anchor'});
                this.render();
            }
        });
    }

    function createHandler(handler) {

        var oppositeHandler = point.handlerLeft === handler ? point.handlerRight : point.handlerLeft;

        handler._de = createCircle(handler.color || that._color.handler);
        that._deHandlerCont.appendChild(handler._de);

        handler._deLine = createLine(handler.color || that._color.handler);
        that._deHandlerCont.appendChild(handler._deLine);

        handler._dragger = makeDraggable({
            deTarget: handler._de,
            thisArg: that,
            onDown: function () {

                var ox = oppositeHandler.x - point.anchor.x,
                    oy = oppositeHandler.y - point.anchor.y,
                    oppositeLength = Math.sqrt(ox*ox + oy*oy);

                return {
                    xStart: handler.x,
                    yStart: handler.y,
                    oppositeLength: oppositeLength
                }   
            },
            onDrag: function (md) {

                handler.x = md.xStart + md.dx;
                handler.y = md.yStart + md.dy;

                if (point.linked) {

                    var dx = handler.x - point.anchor.x,
                        dy = handler.y - point.anchor.y,
                        rad = Math.atan2(dy, dx);

                    oppositeHandler.x = point.anchor.x - (md.oppositeLength * Math.cos(rad));
                    oppositeHandler.y = point.anchor.y - (md.oppositeLength * Math.sin(rad));
                }

                this._emitChange({type: 'move_anchor'});
                this.render();
            }
        })
    }

    function createCircle(color) {

        var de = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        de.setAttribute('r', that._handlerRadius);
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
}

p._removePoint = function (idx) {

    this._points.splice(idx, 1);
}



p.createGraphics = function () {

    this.domElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.domElem.style.overflow = 'visible';

    this._dePathCont = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.domElem.appendChild(this._dePathCont);

    this._deHandlerCont = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.domElem.appendChild(this._deHandlerCont);

    this._deAnchorCont = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.domElem.appendChild(this._deAnchorCont);
};