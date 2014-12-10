
var handler = new Transhand(),
    currDomElem;
    svg = new Snap(),
    svgPath = svg.path(),
    path = [{
        anchor: {x: 100, y: 100, color: 'deepskyblue'},
        handlerLeft: {x: 75, y: 100, color: 'tomato'},
        handlerRight: {x: 125, y: 100, color: 'tomato'},
    }, {
        anchor: {x: 200, y: 200, color: 'deepskyblue'},
        handlerLeft: {x: 175, y: 200, color: 'tomato'},
        handlerRight: {x: 225, y: 200, color: 'tomato'},
    }, {
        anchor: {x: 300, y: 100, color: 'deepskyblue'},
        handlerLeft: {x: 275, y: 100, color: 'tomato'},
        handlerRight: {x: 325, y: 100, color: 'tomato'},
        linked: true,
    }, {
        anchor: {x: 400, y: 200, color: 'deepskyblue'},
        handlerLeft: {x: 375, y: 200, color: 'tomato'},
        handlerRight: {x: 425, y: 200, color: 'tomato'},
    }];

document.body.appendChild(svg.node);

handler.setLocalRoot(document.body);

handler.on('change', onChangeHandler);

focusHandler()

document.body.appendChild(handler.domElem);

function focusHandler() {

    handler.setup({
        hand: {
            type: 'curver',
            autoRefresh: true,
            path: path
        }
    });

    handler.activate();
}

function onChangeHandler(change) {

    console.log('change event:', change);

    path = change;

    // this.renderPath(path);
}

function renderPath(path) {

    var p = shape.points, pa, pb,
        cmd = 'M' + p[0].anchore.x + ',' + p[0].anchore.y + ' ';

    for (var i = 1; i < p.length; ++i) {

        pa = p[i-1];
        pb = p[i];

        cmd += 'C' + pa.handlerRight.x + ',' + pa.handlerRight.y + ' ';
        cmd += pb.handlerLeft.x + ',' + pb.handlerLeft.y + ' ';
        cmd += pb.anchore.x + ',' + pb.anchore.y + ' ';
    }

    svgPath.attr({d: cmd});
}