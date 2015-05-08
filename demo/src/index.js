import scatterThings from 'prepare';

var handler = new Transhand(),
    currDomElem;

scatterThings();

handler.on('change', onChangeHandler);

document.body.appendChild(handler.domElem);

window.addEventListener('click', onClickWindow)

function onClickWindow(e) {

    if (e.target._handlerDemo) {

        currDomElem = e.target;
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
