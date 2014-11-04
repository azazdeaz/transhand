'use strict';

var Transformer = require('./hands/Transformer');
var Boxer = require('./hands/Boxer');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function Transhand() {

    EventEmitter.call(this);

    this.hands = {};

    this._createDomElem();

    [Transformer, Boxer].forEach(function (Hand) {

        var hand = new Hand();

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
}
