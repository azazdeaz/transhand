'use strict';

var Transformer = require('./hands/Transformer');
var Boxer = require('./hands/Boxer');
var Curver = require('./hands/curver/Curver');
var EventEmitter = require('eventman');
var inherits = require('inherits');
var _ = require('lodash');

function Transhand() {

    EventEmitter.call(this);

    this._hands = {};

    this._buffMockDiv = [];

    this._createDomElem();

    Object.defineProperty(this.domElem, 'renderLevel', {
        get: function () { 
            return (this._currHand && this._currHand.renderLevel) || 0;
        }.bind(this),
    });


    // [Transformer, Boxer, Curver].forEach(function (Hand) {

    //     var hand = new Hand(this);

    //     hand.on('change', this.emit.bind(this, 'change'));

    //     this.hands[Hand.id] = hand;
    // }, this);
}

inherits(Transhand, EventEmitter);
var p = Transhand.prototype;
module.exports = Transhand;

p.setup = function (opt) {

    var hand = this._getHand(opt.hand.type);

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

p._getHand = function (type) {

    if (type in this._hands) {

        return this._hands[type];
    }

    var Hand = _.find([Transformer, Boxer, Curver], {id: type});

    if (!Hand) throw Error;

    var hand = new Hand(this);
    hand.on('change', this.emit.bind(this, 'change'));    
    this._hands[Hand.id] = hand;

    return hand;
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
    };
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

var tProps = ['transform', 'transformOrigin', 'prespective', 'prespectiveOrigin', 'transformStyle'];

p.setLocalRoot = function (de) {

    var that = this, 
        deRoot = getDiv(), 
        deTop = deRoot,
        dePicker = getDiv(),
        transformeds = [],
        parentPos = {left: -window.scrollX, top: -window.scrollY},
        assembleIdx = 0;

    if (this._deLocalRoot) {
        disassemble(this._deLocalRoot);
    }

    walkBack(de);
    assemble();

    deTop.appendChild(dePicker);

    this._deLocalRoot = deRoot;
    this._deLocalRootPicker = dePicker;
    this._deLocalRootPicker.setAttribute('picker', 1);//debug
    // document.body.appendChild(this._deLocalRoot);


    function walkBack(de) {

        if (de.nodeName === 'BODY') return;

        var computedStyle = window.getComputedStyle(de),
            reg, pv;

        tProps.forEach(function (propName) {

            var value = computedStyle.getPropertyValue(propName);
            if (value) set(propName, value);
        });

        walkBack(de.parentNode);

        function set(propName, value) {

            if (!reg) {
                reg = {
                    de: de,
                    inlineTransform: de.style.transform,
                    style: {}
                };

                transformeds.unshift(reg);
            }

            de.style.transform = 'none';

            reg.style[propName] = value;
        }
    }

    function assemble() {

        var transformReg = transformeds[assembleIdx++],
            deNext = transformReg ? transformReg.de : de,
            nextPos = deNext.getBoundingClientRect();

        var deNew = getDiv();
        deTop.appendChild(deNew);
        deTop = deNew;

        deNew.style.left = (nextPos.left - parentPos.left) + 'px';
        deNew.style.top = (nextPos.top - parentPos.top) + 'px';

        parentPos = nextPos;

        if (transformReg) {

            //for the transform and perspective origin
            deNew.style.width = nextPos.width + 'px';
            deNew.style.height = nextPos.height + 'px';
            
            Object.keys(transformReg.style).forEach(function (propName) {

                deNew.style[propName] = transformReg.style[propName];
            });

            assemble();
        }
    }

    transformeds.forEach(function (reg) {
        reg.de.style.transform = reg.inlineTransform;
    });
    transformeds.length = 0;

    function disassemble(de) {

        de.removeAttribute('style');
        de.removeAttribute('picker');//debug
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
        de.style.left = '0px';
        de.style.top = '0px';
        de.setAttribute('mock', 1);//debug

        return de;
    }
    
    // function assemble(de) {

    //     if (de.nodeName === 'BODY') return;

    //     var transformed,
    //         computedStyle = window.getComputedStyle(de, null),
    //         position = $(de).position();

    //     if (de.offsetLeft) {
    //         deRoot.style.left = (parseInt(deRoot.style.left || 0))
    //             + position.left
    //             /*+ parseInt(computedStyle.getPropertyValue('margin-left'))*/ + 'px';
    //     }
    //     if (de.offsetTop) {
    //         deRoot.style.top = (parseInt(deRoot.style.top || 0))
    //             + position.top
    //             /*+ parseInt(computedStyle.getPropertyValue('margin-top'))*/ + 'px';
    //     }

    //     if (de.style.transform) {
    //         transformed = true;
    //         deRoot.style.transform = de.style.transform;
    //         //for the transform-origin
    //         deRoot.style.width = (parseInt(deRoot.style.width || 0) + de.offsetWidth) + 'px';
    //         deRoot.style.height = (parseInt(deRoot.style.height || 0) + de.offsetHeight) + 'px';
            
    //         if (de.style.transformOrigin) {
    //             deRoot.style.transformOrigin = de.style.transformOrigin;
    //         }
    //     }
    //     if (de.style.prespective) {
    //         transformed = true;
    //         deRoot.style.prespective = de.style.prespective;
            
    //         if (de.style.prespectiveOrigin) {
    //             deRoot.style.prespectiveOrigin = de.style.prespectiveOrigin;
    //         }
    //     }
    //     if (de.style.transformStyle) {
    //         transformed = true;
    //         deRoot.style.transformStyle = de.style.transformStyle;
    //     }

    //     if (transformed) {

    //         var parent = getDiv();
    //         parent.appendChild(deRoot);
    //         deRoot = parent;
    //     }

    //     assemble(de.parentNode);
    // }
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