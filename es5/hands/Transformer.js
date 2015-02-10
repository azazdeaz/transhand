"use strict";

var EventEmitter = require("eventman");
var inherits = require("inherits");
var _ = require("lodash");

var MOUSESTATES = {
    move: "move",
    rotate: "-webkit-grab",
    origin: "crosshair",
    "1000": "ns-resize",
    "1100": "nesw-resize",
    "0100": "ew-resize",
    "0110": "nwse-resize",
    "0010": "ns-resize",
    "0011": "nesw-resize",
    "0001": "ew-resize",
    "1001": "nwse-resize" };

var INIT_PARAMS = {
    tx: 0, ty: 0,
    sx: 1, sy: 1,
    rz: 0,
    ox: 0.5, oy: 0.5 };

var INIT_BASE = {
    x: 0,
    y: 0,
    w: 0,
    h: 0 };

var hints = {
    scale: ["shift - keep proportion", "alt - from the opposite side"],
    rotate: ["shift - 15° steps"],
    move: ["shift - move in one dimension"] };


function Transformer(transhand) {
    EventEmitter.call(this);

    this._th = transhand;
    this._params = _.clone(INIT_PARAMS);
    this._base = _.clone(INIT_BASE);
    this._points = [{}, {}, {}, {}];
    this._pOrigin = {};
    this._originRadius = 6;
    this._rotateFingerDist = 16;


    this._onDrag = this._onDrag.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._rafOnDrag = this._rafOnDrag.bind(this);
    this._onOverHitbox = this._onOverHitbox.bind(this);
    this._onOutHitbox = this._onOutHitbox.bind(this);
}


inherits(Transformer, EventEmitter);
var p = Transformer.prototype;

Transformer.id = "transformer";
p.renderLevel = 1;

p.setup = function (opt) {
    if (!this.domElem) {
        this.createGraphics();
    }

    _.extend(this._params, INIT_PARAMS, opt.params);
    _.extend(this._base, INIT_BASE, opt.base);
    this._refreshPoints();
    this._renderHandler();
    this._refreshHitbox();
};

p.activate = function () {
    if (this._isActivated) return;
    this._isActivated = true;

    window.addEventListener("mousemove", this._onMouseMove);
    this._deHitbox.addEventListener("mousedown", this._onMouseDown);
    this._deOriginHit.addEventListener("mousedown", this._onMouseDown);
};

p.deactivate = function () {
    if (!this._isActivated) return;
    this._isActivated = false;

    window.removeEventListener("mousemove", this._onMouseMove);
    this._deHitbox.removeEventListener("mousedown", this._onMouseDown);
    this._deOriginHit.removeEventListener("mousedown", this._onMouseDown);
};





p._onMouseDown = function (e) {
    if (!this._finger) {
        return;
    }

    e.stopPropagation();
    e.preventDefault();

    this._isHandle = true;

    this._deFullHit.style.pointerEvents = "auto";

    this._mdPos = {
        m: this._th.G2L({ x: e.clientX, y: e.clientY }),
        params: _.cloneDeep(this._params),
        points: _.cloneDeep(this._points),
        pOrigin: _.cloneDeep(this._pOrigin)
    };

    window.addEventListener("mouseup", this._onMouseUp);
    window.addEventListener("mouseleave", this._onMouseUp);
    window.addEventListener("mousemove", this._onDrag);
};

p._onMouseMove = function (e) {
    if (!this._isHandle && this._isOverHitbox) {
        this._setFinger(e);
    }

    if (this._cursorFunc) {
        this._setCursor(this._cursorFunc(e.clientX, e.clientY));
    }
};

p._onMouseUp = function () {
    window.removeEventListener("mouseup", this._onMouseUp);
    window.removeEventListener("mouseleave", this._onMouseUp);
    window.removeEventListener("mousemove", this._onDrag);

    if (this._rafOnDragRafId) {
        this._rafOnDrag();
    }

    this._isHandle = false;

    this._deFullHit.style.pointerEvents = "none";
};

p._onOverHitbox = function () {
    this._isOverHitbox = true;
};

p._onOutHitbox = function () {
    this._isOverHitbox = false;
};








p._refreshPoints = function () {
    var base = _.clone(this._base),
        params = this._params,
        p = this._points,
        po = this._pOrigin;

    base.x += params.tx;
    base.y += params.ty;

    po.x = base.x + base.w * params.ox;
    po.y = base.y + base.h * params.oy;

    var tox = base.x + params.ox * base.w,
        toy = base.y + params.oy * base.h;

    t(p[0], base.x, base.y);
    t(p[1], base.x + base.w, base.y);
    t(p[2], base.x + base.w, base.y + base.h);
    t(p[3], base.x, base.y + base.h);

    function t(p, x, y) {
        var dx = (x - tox) * params.sx,
            dy = (y - toy) * params.sy,
            d = Math.sqrt(dx * dx + dy * dy),
            rad = Math.atan2(dy, dx) + params.rz,
            nx = Math.cos(rad),
            ny = Math.sin(rad),
            rx = d * nx,
            ry = d * ny,
            px = tox + rx,
            py = toy + ry;

        p.x = px;
        p.y = py;
    }
};



p._renderHandler = function () {
    var p = this._points.map(this._th.L2G, this._th),
        po = this._th.L2G(this._pOrigin),
        c = this._deCanvas,
        or = this._originRadius,
        ctx = c.getContext("2d"),
        margin = 7,
        minX = Math.min(p[0].x, p[1].x, p[2].x, p[3].x, po.x),
        maxX = Math.max(p[0].x, p[1].x, p[2].x, p[3].x, po.x),
        minY = Math.min(p[0].y, p[1].y, p[2].y, p[3].y, po.y),
        maxY = Math.max(p[0].y, p[1].y, p[2].y, p[3].y, po.y);

    c.style.left = minX - margin + "px";
    c.style.top = minY - margin + "px";
    c.width = maxX - minX + margin * 2;
    c.height = maxY - minY + margin * 2;

    ctx.save();
    ctx.translate(margin - minX, margin - minY);
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    ctx.lineTo(p[1].x, p[1].y);
    ctx.lineTo(p[2].x, p[2].y);
    ctx.lineTo(p[3].x, p[3].y);
    ctx.closePath();

    ctx.moveTo(po.x - or, po.y);
    ctx.lineTo(po.x + or, po.y);
    ctx.moveTo(po.x, po.y - or);
    ctx.lineTo(po.x, po.y + or);


    // ctx.shadowColor = '#f00';
    // ctx.shadowBlur = 3;
    // ctx.shadowOffsetX = 0;
    // ctx.shadowOffsetY = 0;

    ctx.strokeStyle = "#4f2";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();



    //hitboxes

    this._deOriginHit.style.left = po.x - this._rotateFingerDist + "px";
    this._deOriginHit.style.top = po.y - this._rotateFingerDist + "px";

    var hbp = "";
    hbp += p[0].x + "," + p[0].y + " ";
    hbp += p[1].x + "," + p[1].y + " ";
    hbp += p[2].x + "," + p[2].y + " ";
    hbp += p[3].x + "," + p[3].y;
    this._deHitbox.setAttribute("points", hbp);
};

p._refreshHitbox = function () {};


















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
        base = this._base,
        pOrigin = this._pOrigin,
        md = this._mdPos,
        finger = this._finger,
        m = this._th.G2L({ x: e.clientX, y: e.clientY }),
        dx = m.x - md.m.x,
        dy = m.y - md.m.y,
        alt = e.altKey,
        shift = e.shiftKey,
        change = {};

    if (finger === "origin") {
        setOrigin();
    }

    if (finger === "move") {
        setTransform();
    }

    if (finger.charAt(0) === "1") {
        setScale(-Math.PI / 2, "sy", -1);
    }

    if (finger.charAt(1) === "1") {
        setScale(0, "sx", 1);
    }

    if (finger.charAt(2) === "1") {
        setScale(Math.PI / 2, "sy", 1);
    }

    if (finger.charAt(3) === "1") {
        setScale(Math.PI, "sx", -1);
    }

    if (finger === "rotate") {
        setRotation();
    }

    if (shift && "sx" in change && "sy" in change) {
        fixProportion();
    }


    this.emit("change", change, "transform");





    function setScale(r, sN, way) {
        var rad = r + md.params.rz,
            mdDist = distToPointInAngle(md.pOrigin, md.m, rad),
            dragDist = distToPointInAngle(md.pOrigin, m, rad),
            scale = dragDist / mdDist * md.params[sN];

        if (alt) {
            var es = (scale - md.params[sN]) / 2,
                tN = "t" + sN.charAt(1),
                dN = sN.charAt(1) === "x" ? "w" : "h";

            scale -= es;
            change[tN] = params[tN] = md.params[tN] + base[dN] * es / 2 * way;
        }

        change[sN] = params[sN] = scale;
    }

    function fixProportion() {
        var mx = m.x - pOrigin.x,
            my = m.y - pOrigin.y,
            mr = Math.abs(radDiff(params.rz, Math.atan2(my, mx))),
            isVertical = mr > Math.PI / 4 && mr < Math.PI / 4 * 3,
            spx = params.sx / md.params.sx,
            spy = params.sy / md.params.sy;

        spx *= spx < 0 ? -1 : 1;
        spy *= spy < 0 ? -1 : 1;

        var sp = isVertical ? spy : spx;

        change.sx = params.sx = md.params.sx * sp;
        change.sy = params.sy = md.params.sy * sp;
    }

    function setRotation() {
        var mdx = md.m.x - pOrigin.x,
            mdy = md.m.y - pOrigin.y,
            mdr = Math.atan2(mdy, mdx),
            mx = m.x - pOrigin.x,
            my = m.y - pOrigin.y,
            mr = Math.atan2(my, mx),
            r = mr - mdr;

        if (shift) {
            r = Math.floor(r / (Math.PI / 12)) * (Math.PI / 12);
        }

        change.rz = params.rz = md.params.rz + r;
    }

    function setTransform() {
        if (shift) {
            if (Math.abs(dx) > Math.abs(dy)) {
                change.tx = params.tx = md.params.tx + dx;
                change.ty = params.ty = md.params.ty;
            } else {
                change.tx = params.tx = md.params.tx;
                change.ty = params.ty = md.params.ty + dy;
            }
        } else {
            change.tx = params.tx = md.params.tx + dx;
            change.ty = params.ty = md.params.ty + dy;
        }
    }

    function setOrigin() {
        var mx = m.x - md.pOrigin.x,
            my = m.y - md.pOrigin.y,
            dist = Math.sqrt(mx * mx + my * my),
            r = Math.atan2(my, mx) - params.rz,
            x = Math.cos(r) * dist / params.sx,
            y = Math.sin(r) * dist / params.sy;

        x = parseInt(x * 1000) / 1000; //?hack??
        y = parseInt(y * 1000) / 1000;

        change.ox = params.ox = md.params.ox + x / base.w;
        change.oy = params.oy = md.params.oy + y / base.h;
        change.tx = params.tx = md.params.tx + (mx - x);
        change.ty = params.ty = md.params.ty + (my - y);
    }
};














p._setFinger = function (e) {
    var base = this._base,
        params = this._params,
        p = this._points,
        po = this._pOrigin,
        diff = 3,
        rDiff = 16,
        m = this._th.G2L({ x: e.clientX, y: e.clientY }),
        dox = po.x - m.x,
        doy = po.y - m.y,
        dOrigin = Math.sqrt(dox * dox + doy * doy),
        dTop = distToSegment(m, p[0], p[1]),
        dLeft = distToSegment(m, p[1], p[2]),
        dBottom = distToSegment(m, p[2], p[3]),
        dRight = distToSegment(m, p[3], p[0]),
        top = dTop < diff,
        left = dLeft < diff,
        bottom = dBottom < diff,
        right = dRight < diff,
        inside = isInside(m, p),
        cursorScale;

    if (base.w * params.sx < diff * 2 && inside) {
        left = false;
        right = false;
    }

    if (base.h * params.sy < diff * 2 && inside) {
        top = false;
        bottom = false;
    }

    if (dOrigin < this._originRadius) {
        this._finger = "origin";
    } else if (top || right || bottom || left) {
        //TODO its sould be top-right-bottom-left
        this._finger = ("000" + (top * 1000 + left * 100 + bottom * 10 + right * 1)).substr(-4);
        cursorScale = true;
        this._th.cursorHint.setHints(hints.scale);
    } else if (inside) {
        this._finger = "move";
        this._th.cursorHint.setHints(hints.move);
    } else if (dTop < rDiff || dRight < rDiff || dBottom < rDiff || dLeft < rDiff || dOrigin < rDiff) {
        this._finger = "rotate";
        this._th.cursorHint.setHints(hints.rotate);
    } else {
        this._finger = false;
    }

    if (this._finger === "rotate") {
        this._cursorFunc = this._getRotateCursor;
    } else if (cursorScale) {
        this._cursorFunc = this._getScaleCursor;
    } else {
        this._cursorFunc = undefined;

        if (this._finger) {
            this._setCursor(MOUSESTATES[this._finger]);
        } else {
            this._setCursor("auto");
        }
    }
};










p._setCursor = function (cursor) {
    this._deHitbox.style.cursor = cursor;
    this._deOriginHit.style.cursor = cursor;
    this._deFullHit.style.cursor = cursor;
};

p._getRotateCursor = function (mx, my) {
    var po = this._th.L2G(this._pOrigin),
        r = Math.atan2(my - po.y, mx - po.x) / Math.PI * 180;

    return "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" ><path transform=\"rotate(" + r + ", 16, 16)\" d=\"M18.907 3.238l-7.54-2.104s8.35 3.9 8.428 15.367c.08 11.794-7.807 14.49-7.807 14.49l7.363-1.725\" stroke=\"#000\" stroke-width=\"2.054\" fill=\"none\"/></svg>') 16 16, auto";
};

p._getScaleCursor = (function () {
    var FINGERS = ["0100", "0110", "0010", "0011", "0001", "1001", "1000", "1100"];

    return function () {
        var sideDeg = FINGERS.indexOf(this._finger) * 45,
            po = this._th.L2G(this._pOrigin),
            oTweak = { x: this._pOrigin.x + 1234, y: this._pOrigin.y },
            pot = this._th.L2G(oTweak),
            baseRad = Math.atan2(pot.y - po.y, pot.x - po.x) + this._params.rz,
            r = sideDeg + baseRad / Math.PI * 180;


        return "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\"><path transform=\"rotate(" + r + ", 16, 16)\" d=\"M22.406 12.552l5.88 4.18H3.677l5.728 4.36\" stroke=\"#000\" stroke-width=\"2.254\" fill=\"none\"/></svg>') 16 16, auto";
    };
})();







p.createGraphics = function () {
    this.domElem = document.createElement("div");
    this.domElem.style.pointerEvents = "none";

    this._deCanvas = document.createElement("canvas");
    this._deCanvas.style.position = "absolute";
    this.domElem.appendChild(this._deCanvas);

    this._deFullHit = document.createElement("div");
    this._deFullHit.style.position = "absolute";
    this._deFullHit.style.pointerEvents = "none";
    this._deFullHit.style.width = "100%";
    this._deFullHit.style.height = "100%";
    this.domElem.appendChild(this._deFullHit);

    var onFirstMove = (function () {
        this._onOverHitbox();
        this._deHitbox.removeEventListener("mousemove", onFirstMove);
        this._deOriginHit.removeEventListener("mousemove", onFirstMove);
    }).bind(this);

    var addHitboxEvents = (function (de) {
        de.style.pointerEvents = "auto";
        de.addEventListener("mouseenter", this._onOverHitbox);
        de.addEventListener("mouseleave", this._onOutHitbox);
        de.addEventListener("mousemove", onFirstMove);

        return de;
    }).bind(this);

    this._deOriginHit = addHitboxEvents(document.createElement("div"));
    this._deOriginHit.style.position = "absolute";
    this._deOriginHit.style.border = this._rotateFingerDist + "px solid rgba(234,0,0,0)";
    this._deOriginHit.style.borderRadius = this._rotateFingerDist + "px";
    this.domElem.appendChild(this._deOriginHit);

    this._svgRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._svgRoot.style.overflow = "visible";
    this.domElem.appendChild(this._svgRoot);

    this._deHitbox = addHitboxEvents(document.createElementNS("http://www.w3.org/2000/svg", "polygon"));
    this._deHitbox.style.strokeWidth = this._rotateFingerDist * 2;
    this._deHitbox.style.stroke = "rgba(0,0,0,0)";
    this._deHitbox.style.fill = "rgba(0,0,0,0)";
    this._deHitbox.style.strokeLinejoin = "round";
    this._svgRoot.appendChild(this._deHitbox);
};

module.exports = Transformer;












//utils/////////////////////////////////////////////////////

function radDiff(r0, r1) {
    r0 %= Math.PI;
    r1 %= Math.PI;
    r0 += Math.PI;
    r1 += Math.PI;

    return r1 - r0;
}

function sqr(x) {
    return x * x;
}

function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y);
}

function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);

    if (l2 === 0) return dist2(p, v);

    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;

    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);

    return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w));
}

function distToPointInAngle(p0, p1, rad) {
    var dx = p1.x - p0.x,
        dy = p1.y - p0.y,
        d = Math.sqrt(dx * dx + dy * dy),
        mRad = Math.atan2(dy, dx);

    rad = mRad - rad;

    // console.log('dx', dx, 'dy', dy, 'd', d, 'mRad', mRad, 'rad', rad, 'return', Math.cos(rad) * d)

    return Math.cos(rad) * d;
}

function isInside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point.x,
        y = point.y;

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x,
            yi = vs[i].y;
        var xj = vs[j].x,
            yj = vs[j].y;

        var intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }

    return inside;
}


// var base = this._base,
//     params = this._params,
//     po = this._pOrigin,
//     leftScale = (base.w * params.ox * (params.sx-1)),
//     topScale = (base.h * params.oy * (params.sy-1)),
//     w = (base.w * params.sx),
//     h = (base.h * params.sy),
//     ox = rfd + (w * params.ox),
//     oy = rfd + (h * params.oy);


// this._deHitbox.style.left = (-rfd + base.x + params.tx - leftScale) + 'px';
// this._deHitbox.style.top = (-rfd + base.y + params.ty - topScale) + 'px';
// this._deHitbox.style.width = w + 'px';
// this._deHitbox.style.height = h + 'px';
// this._deHitbox.style.transformOrigin = ox + 'px ' + oy + 'px';
// this._deHitbox.style.transform = 'rotate(' + this._params.rz + 'rad)';