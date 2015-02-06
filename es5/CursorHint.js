"use strict";

var _ = require("lodash");

function CursorHint() {
    this._createBase();

    this._onMove = this._createOnMove().bind(this);
}

var p = CursorHint.prototype;
module.exports = CursorHint;

p.setHints = function (hints) {
    var _this = this;


    this.domElem.innerHTML = "";

    if (_.isArray(hints)) {
        hints.forEach(function (itemOpt) {
            _this._createItem(itemOpt);
        });

        this._active = true;
        this._onMove();
        window.addEventListener("mousemove", this._onMove);
    } else {
        this._active = false;
        this._onMove();
        window.removeEventListener("mousemove", this._onMove);
    }
};

p._createOnMove = function () {
    var _this = this;


    var showSetT,
        delay = 879,
        showing = false,
        x = 0,
        y = 0;

    var show = function () {
        if (!_this._active) return;

        showing = true;

        _this.domElem.style.left = x + 7 + "px";
        _this.domElem.style.top = y + 7 + "px";
        document.body.appendChild(_this.domElem);
    };

    var hide = function () {
        showing = false;

        document.body.removeChild(_this.domElem);
    };

    return function (e) {
        if (showing) hide();

        if (e) {
            x = e.x;
            y = e.y;
        }

        clearTimeout(showSetT);
        showSetT = setTimeout(show, delay);
    };
};

p._createBase = function () {
    this.domElem = document.createElement("ul");
    this.domElem.style.position = "fixed";
    this.domElem.style.listStyleType = "none";
    this.domElem.style.margin = 0;
    this.domElem.style.padding = 0;
    this.domElem.style.pointerEvents = "none";
};

p._createItem = function (opt) {
    if (typeof opt === "string") {
        opt = { text: opt };
    }

    var li = document.createElement("li");
    li.style.textAlign = "left";
    li.style.fontFamily = "\"Open Sans\", sans-serif";
    li.style.fontSize = "14px";
    li.style.padding = "0 3px";
    li.style.cursor = "pointer";
    li.style.color = "#000";
    li.style.background = "rgba(222,232,222,.785)";
    li.innerHTML = opt.text;


    this.domElem.appendChild(li);
};