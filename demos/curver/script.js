
var handler = new Transhand(),
    currDomElem;

var div0 = createDiv({top: '123px', left: '123px', width: '223px', height: '223px', background: 'deepskyblue'},
    {tx: 0, ty: 0, sx: 1, sy: 1, rz: 1, ox: 0.5, oy: 0.5},
    document.body);

var div1 = createDiv({top: '123px', left: '123px', width: '123px', height: '123px', background: 'darkred'},
    {tx: 0, ty: 0, sx: 1, sy: 1, rz: 1, ox: 0.5, oy: 0.5},
    div0);

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

function createShape (color, points) {

    var s = new Snap();

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

function renderShape(shape) {

    var p = shape.points,
        cmd = 'M' + p[0].x + ',' + p[0].y + ' ';

    for (var i = 1; i < shape.points.length; i += 3) {

        cmd += 'C' + p[i].x + ',' + p[i].y + ' ';
        cmd += p[i+1].x + ',' + p[i+1].y + ' ';
        cmd += p[i+2].x + ',' + p[i+2].y + ' ';
    }
}