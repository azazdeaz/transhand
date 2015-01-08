'use strict';

var Transformer = require('./hands/Transformer');
var Boxer = require('./hands/Boxer');
var Curver = require('./hands/curver/Curver');
var EventEmitter = require('eventman');
var inherits = require('inherits');

function Transhand() {

    EventEmitter.call(this);

    this.hands = {};

    this._createDomElem();

    Object.defineProperty(this.domElem, 'renderLevel', {
        get: function () { 
            return (this._currHand && this._currHand.renderLevel) || 0;
        }
    });

    this._buffMockDiv = [];

    [Transformer, Boxer, Curver].forEach(function (Hand) {

        var hand = new Hand(this);

        hand.on('change', this.emit.bind(this, 'change'));

        this.hands[Hand.id] = hand;
    }, this);
}

inherits(Transhand, EventEmitter);
var p = Transhand.prototype;
module.exports = Transhand;

p.setup = function (opt) {

    var hand = this.hands[opt.hand.type];

    if (this._currHand && this._currHand !== hand) {

        this.deactivate();
    }

    if (hand) {

        hand.setup(opt.hand);
        this._currHand = hand;
    }
    else {
        throw 'Unknown hand type: ' + opt.hand.type;
    }

    if (typeof(opt.on) === 'object') {

        Object.keys(opt.on).forEach(function (eventType) {

            this.on(eventType, opt.on[eventType]);
        }, this);
    }
};

p.activate = function () {

    if (this._currHand) {

        this._currHand.activate();
        
        this.domElem.appendChild(this._currHand.domElem);
    }
};

p.deactivate = function () {

    if (this._currHand) {

        this._currHand.deactivate();

        if (this._currHand.domElem.parentNode === this.domElem) {

            this.domElem.removeChild(this._currHand.domElem);
        }
    }
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'fixed';
    this.domElem.style.pointerEvents = 'none';
    this.domElem.style.left = '0px';
    this.domElem.style.top = '0px';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
};



















p.L2G = function (p) {

    if (!this._deLocalRootPicker) {
        return p;
    }

    this._deLocalRootPicker.style.left = p.x + 'px';
    this._deLocalRootPicker.style.top = p.y + 'px';

    document.body.appendChild(this._deLocalRoot);
    var br = this._deLocalRootPicker.getBoundingClientRect();
    document.body.removeChild(this._deLocalRoot);

    return {
        x: br.left,
        y: br.top,
    }
};

p.G2L = function (p) {

    if (!this._deLocalRootPicker) {
        return p;
    }

    document.body.appendChild(this._deLocalRoot);
    var ret = nastyLocal2Global(p, this._deLocalRootPicker);
    document.body.removeChild(this._deLocalRoot);
    
    return ret;
};

p.setLocalRoot = function (de) {

    var that = this, 
        deRoot = getDiv(), 
        dePicker = getDiv();

    deRoot.appendChild(dePicker);

    if (this._deLocalRoot) {
        disassemble(this._deLocalRoot);
    }
    assemble(de);

    this._deLocalRoot = deRoot;
    this._deLocalRootPicker = dePicker;
    this._deLocalRootPicker.setAttribute('picker', 1);
    // document.body.appendChild(this._deLocalRoot);

    function assemble(de) {

        var transformed;

        if (de.offsetLeft) {
            deRoot.style.left = (parseInt(deRoot.style.left || 0) + de.offsetLeft) + 'px'
        }
        if (de.offsetTop) {
            deRoot.style.top = (parseInt(deRoot.style.top || 0) + de.offsetTop) + 'px'
        }

        if (de.style.transform) {
            transformed = true;
            deRoot.style.transform = de.style.transform;
            //for the transform-origin
            deRoot.style.width = (parseInt(deRoot.style.width || 0) + de.offsetWidth) + 'px';
            deRoot.style.height = (parseInt(deRoot.style.height || 0) + de.offsetHeight) + 'px';
            
            if (de.style.transformOrigin) {
                deRoot.style.transformOrigin = de.style.transformOrigin;
            }
        }
        if (de.style.prespective) {
            transformed = true;
            deRoot.style.prespective = de.style.prespective;
            
            if (de.style.prespectiveOrigin) {
                deRoot.style.prespectiveOrigin = de.style.prespectiveOrigin;
            }
        }
        if (de.style.transformStyle) {
            transformed = true;
            deRoot.style.transformStyle = de.style.transformStyle;
        }

        if (transformed) {

            var parent = getDiv();
            parent.appendChild(deRoot);
            deRoot = parent;
        }

        if (de.parentNode &&  de.parentNode.nodeName !== '#document' && de.parentNode.nodeName !== 'HTML') {
            assemble(de.parentNode);
        }
    }

    function disassemble(de) {

        de.removeAttribute('style');
        that._buffMockDiv.push(de);

        var child = de.firstChild;
        if (child) {
            de.removeChild(child);            
            disassemble(child);
        }
    }

    function getDiv() {
        
        var de = that._buffMockDiv.pop() || document.createElement('div');
        de.style.position = 'absolute';
        de.setAttribute('mock', 1);

        return de;
    }
};














function nastyLocal2Global (mPos, dePicker) {

    var tweakDist = 128,
        tweakDistStep = 0,
        tweakRad = Math.PI / 2,
        dist = tweakDist * 2,
        rad = 0,
        nullPos = {x:0, y: 0},
        globalNullPos = L2G(nullPos),
        globalRad = getRad(globalNullPos, mPos),
        globalDist = posDist(globalNullPos, mPos);

    while (tweakRad > .000001) {

        var globalTestRad = getRad(mPos, L2G(Rad2Pos(rad, tweakDist)));

        if (radDiff(globalRad, globalTestRad) < 0) {

            rad += tweakRad;
        }
        else {
            rad -= tweakRad;
        }

        tweakRad /= 2;
    }


    while (posDist(globalNullPos, L2G(Rad2Pos(rad, dist + 2*tweakDist))) < globalDist && dist < tweakDist * 64) {

        dist += 4*tweakDist;
    }
    
    while (tweakDist > 1) {

        if (posDist(globalNullPos, L2G(Rad2Pos(rad, dist))) < globalDist) {

            dist += tweakDist;
        }
        else {
            dist -= tweakDist;
        }

        tweakDist /= 2;
    }
  
    return Rad2Pos(rad, dist);
  
    
  
  
    function closestRad(aRad, bRad) {

        var aPos = L2G(Rad2Pos(aRad, tweakDist)),
            bPos = L2G(Rad2Pos(bRad, tweakDist)),
            gARad = getRad(globalNullPos, aPos),
            gBRad = getRad(globalNullPos, bPos);

      
        $('#s0').css('left', aPos.x);
        $('#s0').css('top', aPos.y);
        $('#s1').css('left', bPos.x);
        $('#s1').css('top', bPos.y);

      return radDiff(gARad, globalRad) < radDiff(gBRad, globalRad) ? aRad : bRad;
    }
  
    function getRad(aPos, bPos) {
      
       return Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x);
    }

    function Rad2Pos(rad, dist) {

        return {
            x: Math.cos(rad) * dist,
            y: Math.sin(rad) * dist,
        };
    }

    function L2G(pos) {

        dePicker.style.left = pos.x + 'px';
        dePicker.style.top = pos.y + 'px';

        var br = dePicker.getBoundingClientRect();

        return {x: br.left, y: br.top};
    }
  
    function radDiff(aRad, bRad) {

      bRad -= aRad;
      bRad %= Math.PI*2;

      if (bRad > Math.PI) bRad -= 2*Math.PI;
      else if (bRad < -Math.PI) bRad += 2*Math.PI;
      
      return bRad;
    }

    function posDist(aP, bP) {

        var dx = aP.x - bP.x,
            dy = aP.y - bP.y;

        return Math.sqrt(dx*dx+ dy*dy);
    }
}