'use strict';

var Transformer = require('./hands/Transformer');
var Boxer = require('./hands/Boxer');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function Transhand() {

    EventEmitter.call(this);

    this.hands = {};

    this._createDomElem();

    this._buffMockDiv = [];

    [Transformer, Boxer].forEach(function (Hand) {

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

p.L2G = function (p) {

    if (!this._deLocalRootPicker) {
        return p;
    }

    this._deLocalRootPicker.style.left = p.x + 'px';
    this._deLocalRootPicker.style.top = p.y + 'px';

    var br = this._deLocalRootPicker.getBoundingClientRect();

    return {
        x: br.left,
        y: br.top,
    }
};

p.G2L = function (p) {

    if (!this._deLocalRootPicker) {
        return p;
    }

    var x = 0,
        y = 0,
        px = p.x,
        py = p.y,
        tx = Math.pow(2, 18),
        ty = Math.pow(2, 18),
        br;

    while (tx > 1) {

        tx /= 2;
        x += tx;

        this._deLocalRootPicker.style.left = p.x + 'px';
        br = this._deLocalRootPicker.getBoundingClientRect();
        
        if (x + tx > px) x += tx;
    }
};

p.setLocalRoot = function (de) {

    var that = this, deRoot = getDiv();

    disassemble(this._deLocalRoot);
    assemble(de);

    this._deLocalRoot = deRoot;
    this._deLocalRootPicker = this._deLocalRootPicker || getDiv();
    this._deLocalRoot.appendChild(_deLocalRootPicker);

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

        if (de.offsetParent) {
            assemble(de.offsetParent);
        }
    }

    function disassemble(de) {

        de.removeAttribute('style');
        that._buffMockDiv.push(de);

        var parent = de.parentNode;
        if (parent) {
            parent.removeChild(de);            
            disassemble(parent);
        }
    }

    function getDiv() {
        
        return that._buffMockDiv.pop() || document.createElement('div');
    }
}



p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'fixed';
    this.domElem.style.pointerEvents = 'none';
    this.domElem.style.left = '0px';
    this.domElem.style.top = '0px';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
}
