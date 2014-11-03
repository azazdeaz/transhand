
var handler = new Transhand(),
    currDomElem;

scatterThings();

handler.on('change', onChangeHandler);

function onClickItem() {

    currDomElem = this;

    focusHandler();
}

function onChangeHandler(change) {

    console.log(change);

    var cssTransform = '';

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

    document.body.appendChild(handler.domElem);
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



function scatterThings() {

    var srcs = [
        'assets/obj_cookiejar001.png',
        'assets/obj_fan001.png',
        'assets/obj_kettle001.png',
        'assets/obj_mixer001.png',
        'assets/obj_radio001.png',
        'assets/obj_speaker001.png',
        'assets/obj_speaker002.png',
        'assets/obj_toaster001.png',
        'assets/obj_tv001.png',
        'assets/obj_tv002.png'
    ];

    for (var i = 0; i < 12; ++i) {

        var div = document.createElement('div');
        div.style.width = (32 + 132 * Math.random()) + 'px';
        div.style.height = (32 + 132 * Math.random()) + 'px';
        div.style.background = '#' + Math.random().toString(16).substr(-3);

        place(div);

        div._handlerDemo = 'boxer';
        
        div._handlerParams = {
            x: div.offsetLeft,
            y: div.offsetTop,
            w: div.offsetWidth,
            h: div.offsetHeight,
        };
    }

    srcs.forEach(function (src) {

        var img = new Image();

        img._handlerDemo = 'transformer';
        
        img._handlerParams = {
            tx: 0, ty: 0,
            sx: 1, sy: 1,
            rz: 0,
            ox: 0.5, oy: 0.5,
        };

        img.onload = function () {

            var transformSave;

            if (img.style.transform) {

                transformSave = img.style.transform;
                img.style.transform = '';
            }

            var br = img.getBoundingClientRect();

            img.style.transform = transformSave;

            img._handlerBase = {
                x: br.left,
                y: br.top,
                w: br.width,
                h: br.height,
            };
        };
        
        place(img);

        img.src = src;
    });

    function place(de) {

        de.style.left = parseInt((window.innerWidth - 150) * Math.random()) + 'px';
        de.style.top = parseInt((window.innerHeight - 150) * Math.random()) + 'px';
        de.style.position = 'absolute';
        de.style.cursor = 'pointer';
        document.body.appendChild(de);
        

        de._handlerBase = getBase(de);

        de.addEventListener('click', onClickItem);
    }

    function getBase(de) {

    }
}