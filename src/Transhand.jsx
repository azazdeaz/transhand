import React from 'react';
import clone from 'lodash/lang/clone';
import Styles from './Styles';
import Coordinator from './Coordinator';
import {radDiff, sqr, dist2, distToSegmentSquared, distToSegment,
  distToPointInAngle, isInside, equPoints} from './utils';

var Transhand;
export default Transhand =  React.createClass({

  getDefaultProps() {

    var rotateFingerDist = 16;
    var originRadius =  6;

    return {
      params: {
          tx: 0, ty: 0,
          sx: 1, sy: 1,
          rz: 0,
          ox: 0.5, oy: 0.5,
      },
      base: {
        x: 0, y: 0, w: 0, h: 0,
      },
      rotateFingerDist,
      originRadius,
      coordinator: new Coordinator(),
      styles: new Styles({
        rotateFingerDist: rotateFingerDist,
        originRadius: originRadius,
      }),
    };
  },

  getInitialState() {
    return {
      points: [{}, {}, {}, {}],
      pOrigin: {},
    };
  },

  componentWillMount() {

    var {deParent, deTarget, coordinator} = this.props;

    if (this.props.de) {

    }
  }

  componentWillReceiveProps(nextProps) {

    this.refreshPoints(nextProps);
  },

  shouldComponentUpdate(nextProps, nextState) {

    var {points, pOrigin} = this.state;

    return !(equPoints(pOrigin, nextState.pOrigin) &&
      equPoints(points[0], nextState.points[0]) &&
      equPoints(points[1], nextState.points[1]) &&
      equPoints(points[2], nextState.points[2]) &&
      equPoints(points[3], nextState.points[3]));
  },









  refreshPoints(props) {

    props = props || this.props;

    var {base, params, coordinator} = props,
        p = this.state.points.map(p => clone(p)),
        po = clone(this.state.pOrigin);

    base.x += params.tx;
    base.y += params.ty;

    po.x = base.x + (base.w * params.ox);
    po.y = base.y + (base.h * params.oy);

    var tox = base.x + params.ox * base.w,
        toy = base.y + params.oy * base.h;

    t(p[0], base.x, base.y);
    t(p[1], base.x + base.w, base.y);
    t(p[2], base.x + base.w, base.y + base.h);
    t(p[3], base.x, base.y + base.h);

    function t(p, x, y) {

      var dx = (x - tox) * params.sx,
          dy = (y - toy) * params.sy,
          d = Math.sqrt(dx*dx + dy*dy),
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
  },







  // Event Handlers ////////////////////////////////////////////////////////////

  handleMouseDown(e) {
    if (!this._finger) {
        return;
    }

    e.stopPropagation();
    e.preventDefault();

    this._isHandle = true;

    this._deFullHit.style.pointerEvents = 'auto';

    this._mdPos = {
        m: this._th.G2L({x: e.clientX, y: e.clientY}),
        params: _.cloneDeep(this._params),
        points: _.cloneDeep(this._points),
        pOrigin: _.cloneDeep(this._pOrigin)
    };

    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('mouseleave', this._onMouseUp);
    window.addEventListener('mousemove', this._onDrag);
  },

  getHitEvents() {
    //TODO onFirstMove - handle when transhand appears under the mouse
    return {
      onMouseEnter: () => this.setState({overHitbox: true}),
      onMouseLeave: () => this.setState({overHitbox: false}),
      onMouseDown: e => this.handleMouseDown(e),
    };
  },

  handleMouseMove(e) {

    if (!this._isHandle && this._isOverHitbox) {

      this._setFinger(e);
    }
    else {
      this._th.cursorHint.setHints(null);
    }

    if (this._cursorFunc) {
      this._setCursor(this._cursorFunc(e.clientX, e.clientY));
    }
  },

  handleMouseUp() {

    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('mouseleave', this._onMouseUp);
    window.removeEventListener('mousemove', this._onDrag);

    if (this._rafOnDragRafId) {
        this._rafOnDrag();
    }

    this._isHandle = false;

    this._deFullHit.style.pointerEvents = 'none';
  },








  renderHandler() {

    var p = this._points.map(p => coordinator.L2G(p)),
        po = this._th.L2G(this._pOrigin),
        c = this._deCanvas,
        or = this._originRadius,
        ctx = c.getContext('2d'),
        margin = 7,
        minX = Math.min(p[0].x, p[1].x, p[2].x, p[3].x, po.x),
        maxX = Math.max(p[0].x, p[1].x, p[2].x, p[3].x, po.x),
        minY = Math.min(p[0].y, p[1].y, p[2].y, p[3].y, po.y),
        maxY = Math.max(p[0].y, p[1].y, p[2].y, p[3].y, po.y);

    c.style.left = (minX - margin) + 'px';
    c.style.top = (minY - margin) + 'px';
    c.width = (maxX - minX) + (margin * 2);
    c.height = (maxY - minY) + (margin * 2);

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

    ctx.strokeStyle = '#4f2';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();



    //hitboxes

    this._deOriginHit.style.left = (po.x - this._rotateFingerDist) + 'px';
    this._deOriginHit.style.top = (po.y - this._rotateFingerDist) + 'px';

    var hbp = '';
    hbp += p[0].x + ',' + p[0].y + ' ';
    hbp += p[1].x + ',' + p[1].y + ' ';
    hbp += p[2].x + ',' + p[2].y + ' ';
    hbp += p[3].x + ',' + p[3].y;
    this._deHitbox.setAttribute('points', hbp);
  },








  handleDrag(e) {

    this._onDragMe = e;

    if (!this._rafOnDragRafId) {

      this._rafOnDragRafId = requestAnimationFrame(this._rafOnDrag);
    }
  },

  deferredHandleDrag () {

    var e = this._onDragMe;
    this._onDragMe = undefined;

    window.cancelAnimationFrame(this._rafOnDragRafId);
    this._rafOnDragRafId = undefined;

    var params = this._params,
        base = this._base,
        pOrigin = this._pOrigin,
        md = this._mdPos,
        finger = this._finger,
        m = this._th.G2L({x: e.clientX, y: e.clientY}),
        dx = m.x - md.m.x,
        dy = m.y - md.m.y,
        alt = e.altKey,
        shift = e.shiftKey,
        change = {};

    if (finger === 'origin') {

      setOrigin();
    }

    if (finger === 'move') {

      setTransform();
    }

    if (finger.charAt(0) === '1') {

      setScale(-Math.PI/2, 'sy', -1);
    }

    if (finger.charAt(1) === '1') {

      setScale(0, 'sx', 1);
    }

    if (finger.charAt(2) === '1') {

      setScale(Math.PI/2, 'sy', 1);
    }

    if (finger.charAt(3) === '1') {

      setScale(Math.PI, 'sx', -1);
    }

    if (finger === 'rotate') {

      setRotation();
    }

    if (shift && 'sx' in change && 'sy' in change) {

      fixProportion();
    }


    this.emit('change', change, 'transform');





    function setScale(r, sN, way) {

      var rad = r + md.params.rz,
          mdDist = distToPointInAngle(md.pOrigin, md.m, rad),
          dragDist = distToPointInAngle(md.pOrigin, m, rad),
          scale = (dragDist / mdDist) * md.params[sN];

      if (alt) {
        var es = (scale - md.params[sN]) / 2,
            tN = 't' + sN.charAt(1),
            dN = sN.charAt(1) === 'x' ? 'w' : 'h';

        scale -= es;
        change[tN] = params[tN] = md.params[tN] + base[dN] * es/2 * way;
      }

      change[sN] = params[sN] = scale;
    }

    function fixProportion() {

      var mx = m.x - pOrigin.x,
          my = m.y - pOrigin.y,
          mr = Math.abs(radDiff(params.rz, Math.atan2(my, mx))),
          isVertical = mr > Math.PI/4 && mr < Math.PI/4 * 3,
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
        }
        else {
          change.tx = params.tx = md.params.tx;
          change.ty = params.ty = md.params.ty + dy;
        }
      }
      else {
        change.tx = params.tx = md.params.tx + dx;
        change.ty = params.ty = md.params.ty + dy;
      }
    }

    function setOrigin() {

      var mx = m.x - md.pOrigin.x,
          my = m.y - md.pOrigin.y,
          dist = Math.sqrt(mx*mx + my*my),
          r = Math.atan2(my, mx) - params.rz,
          x = (Math.cos(r) * dist) / params.sx,
          y = (Math.sin(r) * dist) / params.sy;

      x = parseInt(x * 1000) / 1000;//?hack??
      y = parseInt(y * 1000) / 1000;

      change.ox = params.ox = md.params.ox + (x / base.w);
      change.oy = params.oy = md.params.oy + (y / base.h);
      change.tx = params.tx = md.params.tx + (mx - x);
      change.ty = params.ty = md.params.ty + (my - y);
    }
  },









  setFinger(e) {

      var base = this._base,
          params = this._params,
          p = this._points,
          po = this._pOrigin,
          diff = 3,
          rDiff = 16,
          m = this._th.G2L({x: e.clientX, y: e.clientY}),
          dox = po.x - m.x,
          doy = po.y - m.y,
          dOrigin = Math.sqrt(dox*dox + doy*doy),
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

          this._finger = 'origin';
      }
      else if (top || right || bottom || left) {
          //TODO its sould be top-right-bottom-left
          this._finger = ('000' + (top * 1000 + left * 100 + bottom * 10 + right * 1)).substr(-4);
          cursorScale = true;
          this._th.cursorHint.setHints(hints.scale);
      }
      else if (inside) {

          this._finger = 'move';
          this._th.cursorHint.setHints(hints.move);
      }
      else if (dTop < rDiff || dRight < rDiff || dBottom < rDiff || dLeft < rDiff || dOrigin < rDiff) {

          this._finger = 'rotate';
          this._th.cursorHint.setHints(hints.rotate);
      }
      else {
          this._finger = false;
          this._th.cursorHint.setHints(null);
      }

      if (this._finger === 'rotate') {

          this._cursorFunc = this._getRotateCursor;
      }
      else if (cursorScale) {

          this._cursorFunc = this._getScaleCursor;
      }
      else {
          this._cursorFunc = undefined;

          if (this._finger) {

              this._setCursor(MOUSESTATES[this._finger]);
          }
          else {
              this._setCursor('auto');
          }
      }
  },




  setCursor(cursor) {

    this._deHitbox.style.cursor = cursor;
    this._deOriginHit.style.cursor = cursor;
    this._deFullHit.style.cursor = cursor
  },

  getRotateCursor(mx, my) {

    var po = this._th.L2G(this._pOrigin),
        r = Math.atan2(my - po.y, mx - po.x) / Math.PI * 180;

    return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" ><path transform="rotate('+r+', 16, 16)" d="M18.907 3.238l-7.54-2.104s8.35 3.9 8.428 15.367c.08 11.794-7.807 14.49-7.807 14.49l7.363-1.725" stroke="#000" stroke-width="2.054" fill="none"/></svg>\') 16 16, auto';
  },

  getScaleCursor: (function () {

    var FINGERS = ['0100', '0110', '0010', '0011', '0001', '1001', '1000', '1100'];

    return function () {

      var sideDeg = FINGERS.indexOf(this._finger) * 45,
          po = this._th.L2G(this._pOrigin),
          oTweak = {x: this._pOrigin.x + 1234, y: this._pOrigin.y},
          pot = this._th.L2G(oTweak),
          baseRad = Math.atan2(pot.y - po.y, pot.x - po.x) + this._params.rz,
          r = sideDeg + (baseRad / Math.PI * 180);


      return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path transform="rotate('+r+', 16, 16)" d="M22.406 12.552l5.88 4.18H3.677l5.728 4.36" stroke="#000" stroke-width="2.254" fill="none"/></svg>\') 16 16, auto';
    };
  }()),












  render() {

    var {styles} = this.state;

    return <div style={styles.root}>
      <div ref='group' style={styles.group}>
        <canvas ref='canvas' style={styles.canvas}/>
        <div ref='fullHit' style={styles.fullHit} {...this.getHitEvents()}/>
        <div ref='originHit' style={styles.originHit} {...this.getHitEvents()}/>
        <svg ref='svgRoot' style={styles.svgRoot}>
        </svg>
      </div>
    </div>;
  }
});
