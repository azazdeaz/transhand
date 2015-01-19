
var handler = new Transhand(),
    currDomElem;

var div0 = createDiv({top: '123px', left: '123px', width: '223px', height: '223px', background: '#0074D9'},
    {tx: 12, ty: 21, sx: 1, sy: 1, rz: 0.8, ox: 0.5, oy: 0.5},
    document.body);

var div1 = createDiv({top: '123px', left: '123px', width: '123px', height: '123px', background: '#7FDBFF'},
    {tx: 0, ty: 0, sx: 1, sy: 1, rz: 1, ox: 0.5, oy: 0.5},
    div0);

var div2 = createDiv({top: '43px', left: '43px', width: '73px', height: '73px', background: '#FF4136'},
    {tx: 23, ty: 32, sx: 1, sy: 1, rz: 1.2, ox: 0.5, oy: 0.5},
    div1);

handler.setLocalRoot(div1);

handler.on('change', onChangeHandler);

document.body.appendChild(handler.domElem);

window.addEventListener('click', onClickWindow)


function onClickWindow(e) {

    if (e.target._handlerDemo) {

        currDomElem = e.target;
        

        handler.setLocalRoot(currDomElem.parentNode);
        focusHandler();
    }
    else if (e.target.nodeName === 'BODY') {
        currDomElem = undefined;
        handler.deactivate();
    }
}

function focusHandler() {

    if (currDomElem._handlerDemo === 'transformer') {
        
        handler.setup({
            hand: {
                type: 'transformer',
                base: currDomElem._handlerBase,
                params: currDomElem._handlerParams
            }
        });
    }
    else if (currDomElem._handlerDemo === 'boxer') {

        handler.setup({
            hand: {
                type: 'boxer',
                params: currDomElem._handlerParams
            }
        });
    }

    handler.activate();
}

function onChangeHandler(change) {

    console.log('change event:', change);

    Object.keys(change).forEach(function (name) {

        currDomElem._handlerParams[name] = change[name];
    });

    focusHandler();

    if (currDomElem._handlerDemo === 'transformer') {

        applyTransform(currDomElem);
    }
    else if (currDomElem._handlerDemo === 'boxer') {
        
        applyLayout(currDomElem);
    }
}

function applyTransform(de) {

    var params = de._handlerParams,
        cssTransform = '';

    cssTransform += ' translateX(' + params.tx + 'px)';
    cssTransform += ' translateY(' + params.ty + 'px)';
    cssTransform += ' rotate(' + params.rz + 'rad)';
    cssTransform += ' scaleX(' + params.sx + ')';
    cssTransform += ' scaleY(' + params.sy + ')';

    de.style.transform = cssTransform;
    de.style.transformOrigin = (params.ox * 100) + '% ' + (params.oy * 100) + '%';
}

function applyLayout(de) {

    var params = de._handlerParams;

    de.style.left = params.x + 'px';
    de.style.top = params.y + 'px';
    de.style.width = params.w + 'px';
    de.style.height = params.h + 'px';
}

function createDiv (css, params, parent) {

    var div = document.createElement('div');
    parent.appendChild(div);

    for (var paramName in css) {

        div.style[paramName] = css[paramName];
    }
    div.style.position = 'absolute';
        
    div._handlerBase = {
        x: div.offsetLeft,
        y: div.offsetTop,
        w: div.offsetWidth,
        h: div.offsetHeight,
    };

    div._handlerDemo = 'transformer';
    div._handlerParams = params;

    applyTransform(div);

    return div;
};