'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var _ = require('lodash');
var makeDraggable = require('../../make-draggable');


var BASE_POINT_STYLE = {
    anchorFill: 'deepskyblue',
    anchorRadius: 3,
    anchorStroke: 'none',
    anchorStrokeWidth: 1,
    handleFill: 'deepskyblue',
    handleRadius: 3,
    handleStroke: 'none',
    handleStrokeWidth: 1,
    handleLineStroke: 'deepskyblue',
    handleLineStrokeWidth: 1,
    pathStroke: 'deepskyblue',
    pathStrokeWidth: 2,
};

var CURSORS = {

    pencil: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACKUlEQVQ4T2NkIB0oALX4A/FEkFZGEvQ7GJhYdIVEJ5puXrOM4c6ta21vX7+uJsaABGdP346kzCJ+Ewsb9vyUCEZ9Y3OGPds27jt78qgzTgN4eHia/cJiMlKyiznlFVW4//379zcnMZTZxNL2p5a2PnO0v5Mr0PUHsBqgrKa+cvH6fd7iklLcIC+CNGcnhDCbWtn9TMooYM+ICXy1e9sGcVxhoNDcO+NmVGI6269fv36vXjKX9eCe7Qzmto4/kzML2Z8+fvjZ0Ug57+/fvwtwGZBw7MqTKeJS0twTOuoZJnc1CRqbW81ftf1oAEhDXXHW96Xzp3PBAh/dCwJOHr6nZy/bpAJScPr44R+VBSmLAsNi47KLazi+fP78w1ZPtvfTx4812AwQcPH0O337xlWVPadv/WMCAvQontjZwDCps1EQKP4B3QABv5Cos70zFsufOLz/16LZkzmnL17/l5GRkRmq8P++nVu+A11T8Obly9nIBoO8IOAfGn2uZ/oiOaClYA0H9mz/M623laWqpffLmiXzfhw9uGftowf3VoCk0F3F6Okf+mXyvJUcSLaB1Rzet/NPQojHVCCzAF9qZdy478wXHQNjcHzDwMcP778nhXvtuHD6RBA+zeBoBIb6nVlLNyoBXQCOkU8fP3yPCXC6fPXieXNCmsEGALGBX0j00a6p81l/fP/2J8rX/uG1yxctkUMarxegkgKyCoozWFhYGe/fuZVOrGaQXgDe5tcRUOCRFgAAAABJRU5ErkJggg==) 15 0, auto",
    // amgui.createCursorFromText({
    //     icon: 'vector-pencil',
    //     color: '#def',
    //     width: 16,
    //     height: 16,
    //     hotspotX: 15,
    //     hotspotY: 0,
    //     rotateOriginX: 8,
    //     rotateOriginY: 8,
    //     backgroundColor: '#123',
    //     rotate: 0,
    //     stroke: {color:'black', width: 2},
    //     debug: false,
    // })
}

// point: {
//     anchor: {x: 0, y: 0},
//     handleLeft: {x: 0, y: 0},
//     handleRight: {x: 0, y: 0},
//     linked: false,
//     close: false,
// }


function Curver() {

    EventEmitter.call(this);

    this._points = [];
    this._buffPoints = [];

    this._offset = {
        x: 0,
        y: 0,
    }

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

    while (this._points.length < opt.points.length) {
        this._addPoint();
    }
    while (this._points.length > opt.points.length) {
        this._splicePoint(this._points.length-1);
    }

    opt.points.forEach(function (srcPoint, idx) {

        this._setupPoint(this._points[idx], srcPoint);
    }, this);

    this._offset.x = (opt.offset && opt.offset.x) || 0;
    this._offset.y = (opt.offset && opt.offset.y) || 0;

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

        detailes = _.assign({
            type: '',
            point: undefined,
            idx: undefined,
            points: this._points,
            flatPoints: flatPoints,
            flat: flat,
            svgPath: svgPath,
            clone: clone,
        }, detailes);

        if (detailes.idx === undefined && detailes.point) {

            detailes.idx = this._points.indexOf(detailes.point);
        }

        this.emit('change', detailes);
    };

    function flatPoints() {

        var ret = [];
        
        this.points.forEach(function (point) {

            ret.push({
                x: point.handleLeft.x,
                y: point.handleLeft.y 
            });
            ret.push({
                x: point.anchor.x,
                y: point.anchor.y 
            });
            ret.push({
                x: point.handleRight.x,
                y: point.handleRight.y 
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

        this.domElem.style.left = this._offset.x + 'px';
        this.domElem.style.top = this._offset.y + 'px';
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

p._addPoint = function (idx) {

    var that = this, 
        point = {
            anchor: {x: 0, y: 0},
            handleLeft: {x: 0, y: 0},
            handleRight: {x: 0, y: 0},
            style: {},
            linked: false,
        };
    //TODO use _buffPoints[]
    this._points.splice(idx, 0, point);

    createPath();
    createAnchor();
    createHandle(point.handleLeft);
    createHandle(point.handleRight);

    return point;

    function createPath() {

        point._de = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        point._de.style.fill = 'none';
        point._de.style.pointerEvents = 'auto';
        point._de.style.cursor = CURSORS.pencil;
        that._dePathCont.appendChild(point._de);

        point._de.addEventListener('mousedown', function (e) {

            var idx = this._points.indexOf(point),
                srcPoint = this._splitCurve(this._points[idx], this._points[idx+1], 
                    e.x - this._offset.x, e.y - this._offset.y);

            var newPoint = this._addPoint(idx+1);
            this._setupPoint(newPoint, srcPoint);

            this._emitChange({type: 'add', point: newPoint});

            newPoint.anchor._dragger.emitDown(e);
        }.bind(that));
    }

    function createAnchor() {

        point.anchor._de = createCircle();
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

                    this._emitChange({type: 'edit', point: point});

                    point.handleLeft._dragger.emitDown(e);

                    return false;
                }
                else if (action === 'remove_point') {

                    var idx = this._points.indexOf(point);

                    this._splicePoint(idx);

                    this._emitChange({type: 'remove', idx: idx});

                    return false;
                }

                return {
                    axStart: point.anchor.x,
                    ayStart: point.anchor.y,
                    hlxStart: point.handleLeft.x,
                    hlyStart: point.handleLeft.y,
                    hrxStart: point.handleRight.x,
                    hryStart: point.handleRight.y,
                };
            },
            onDrag: function (md) {

                point.anchor.x = md.axStart + md.dx;
                point.anchor.y = md.ayStart + md.dy;
                point.handleLeft.x = md.hlxStart + md.dx;
                point.handleLeft.y = md.hlyStart + md.dy;
                point.handleRight.x = md.hrxStart + md.dx;
                point.handleRight.y = md.hryStart + md.dy;

                this._emitChange({type: 'edit', point: point});
                this.render();
            }
        });
    }

    function createHandle(handle) {

        var oppositeHandle = point.handleLeft === handle ? point.handleRight : point.handleLeft;

        handle._deLine = createLine();
        that._deHandleCont.appendChild(handle._deLine);

        handle._de = createCircle();
        that._deHandleCont.appendChild(handle._de);

        handle._dragger = makeDraggable({
            deTarget: handle._de,
            thisArg: that,
            onDown: function (e) {

                var action = this._getClickAction('handle', e);
                
                if (!e.syncronSize && action === 'unlink_handle' && point.linked) {

                    point.linked = false;

                    this._emitChange({type: 'edit', point: point});
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

                this._emitChange({type: 'edit', point: point});
                this.render();
            }
        });
    }

    function createCircle(color) {

        var de = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        de.style.cursor = 'pointer';
        de.style.pointerEvents = 'auto';

        return de;
    }

    function createLine(color) {

        var de = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        de.style.pointerEvents = 'none';

        return de;
    }

    function dist(pa, pb) {

        var ox = pa.x - pb.x,
            oy = pa.y - pb.y;
        
        return Math.sqrt(ox*ox + oy*oy);
    }
};

p._setupPoint = function (point, src) {

    point.anchor.x = src.anchor.x;
    point.anchor.y = src.anchor.y;
    point.handleLeft.x = src.handleLeft.x;
    point.handleLeft.y = src.handleLeft.y;
    point.handleRight.x = src.handleRight.x;
    point.handleRight.y = src.handleRight.y;
    point.linked = !!src.linked;
    
    var s = point.style = _.defaults({}, src.style, BASE_POINT_STYLE);

    point._de.style.stroke = s.pathStroke;
    point._de.style.strokeWidth = s.pathStrokeWidth;

    point.anchor._de.setAttribute('r', s.anchorRadius);
    point.anchor._de.style.fill = s.anchorFill;
    point.anchor._de.style.stroke = s.anchorStroke;
    point.anchor._de.style.strokeWidth = s.anchorStrokeWidth;

    point.handleLeft._deLine.style.stroke = s.handleLineStroke;
    point.handleLeft._deLine.style.strokeWidth = s.handleLineStrokeWidth;
    point.handleRight._deLine.style.stroke = s.handleLineStroke;
    point.handleRight._deLine.style.strokeWidth = s.handleLineStrokeWidth;

    point.handleLeft._de.setAttribute('r', s.handleRadius);
    point.handleLeft._de.style.fill = s.handleFill;
    point.handleLeft._de.style.stroke = s.handleStroke;
    point.handleLeft._de.style.strokeWidth = s.handleStrokeWidth;
    point.handleRight._de.setAttribute('r', s.handleRadius);
    point.handleRight._de.style.fill = s.handleFill;
    point.handleRight._de.style.stroke = s.handleStroke;
    point.handleRight._de.style.strokeWidth = s.handleStrokeWidth;

    return point;
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

    this._buffPoints.push(removedPoint);
};

p._splitCurve = function (pa, pb, x, y) {

    var curve = [
            pa.anchor.x, pa.anchor.y,
            pa.handleRight.x, pa.handleRight.y,
            pb.handleLeft.x, pb.handleLeft.y,
            pb.anchor.x, pb.anchor.y
        ],
        mPos = {x: x, y: y},
        p = {
            anchor: {x: 0, y: 0},//jsBezier.pointOnCurve(curve, loc),
            handleLeft: {x: 0, y: 0},
            handleRight: {x: 0, y: 0},
            linked: true,
        },
        pm = {},
        dl = dist(pa.anchor, pa.handleRight) + 
            dist(pa.handleRight, pb.handleLeft) + 
            dist(pb.handleLeft, pb.anchor),
        minDist, pos, loc;

    for (var di = 0; di < dl; ++di) {

        var _loc = di/dl,
            _pos = calcPos(_loc),
            _dist = dist(_pos, mPos);

        if (minDist === undefined || minDist > _dist) {

            minDist = _dist;
            loc = _loc;
            pos = _pos;
        }
    };

    p.anchor = pos;

    pm.x = pa.handleRight.x + (pb.handleLeft.x - pa.handleRight.x) * loc;
    pm.y = pa.handleRight.y + (pb.handleLeft.y - pa.handleRight.y) * loc;
    pa.handleRight.x = pa.anchor.x + (pa.handleRight.x - pa.anchor.x) * loc;
    pa.handleRight.y = pa.anchor.y + (pa.handleRight.y - pa.anchor.y) * loc;
    pb.handleLeft.x = pb.handleLeft.x + (pb.anchor.x - pb.handleLeft.x) * loc;
    pb.handleLeft.y = pb.handleLeft.y + (pb.anchor.y - pb.handleLeft.y) * loc;
    p.handleLeft.x = pa.handleRight.x + (pm.x - pa.handleRight.x) * loc;
    p.handleLeft.y = pa.handleRight.y + (pm.y - pa.handleRight.y) * loc;
    p.handleRight.x = pm.x + (pb.handleLeft.x - pm.x) * loc;
    p.handleRight.y = pm.y + (pb.handleLeft.y - pm.y) * loc;

    function calcPos(pos) {

        var p = curve.slice(),
            l = p.length / 2;

        while (--l > 0) {

            for (var i = 0; i < l; ++i) {
                count(i*2);
            }
        }

        return {x: p[0], y: p[1]};

        function count(i) {

            p[i+0] = p[i+0] + (p[i+2] - p[i+0]) * pos;
            p[i+1] = p[i+1] + (p[i+3] - p[i+1]) * pos;
        }
    };

    function dist(pa, pb) {

        var dx = pb.x - pa.x,
            dy = pb.y - pa.y;

        return Math.sqrt(dx*dx + dy*dy);
    }

    return p;
};


p.createGraphics = function () {

    this.domElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.domElem.style.position = 'absolute';
    this.domElem.style.overflow = 'visible';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';

    this._dePathCont = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.domElem.appendChild(this._dePathCont);

    this._deHandleCont = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.domElem.appendChild(this._deHandleCont);

    this._deAnchorCont = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.domElem.appendChild(this._deAnchorCont);
};