
var handle = new Transhand(),
    currDomElem;
    svg = new Snap(),
    svgPath = svg.path(),
    points = [{
        anchor: {x: 100, y: 100, color: 'deepskyblue'},
        handleLeft: {x: 75, y: 100, color: 'tomato'},
        handleRight: {x: 125, y: 100, color: 'tomato'},
    }, {
        anchor: {x: 200, y: 200, color: 'deepskyblue'},
        handleLeft: {x: 175, y: 200, color: 'tomato'},
        handleRight: {x: 225, y: 200, color: 'tomato'},
    }, {
        anchor: {x: 300, y: 100, color: 'deepskyblue'},
        handleLeft: {x: 275, y: 100, color: 'tomato'},
        handleRight: {x: 325, y: 100, color: 'tomato'},
        linked: true,
    }, {
        anchor: {x: 400, y: 200, color: 'deepskyblue'},
        handleLeft: {x: 375, y: 200, color: 'tomato'},
        handleRight: {x: 425, y: 200, color: 'tomato'},
    }];

document.body.appendChild(svg.node);

handle.setLocalRoot(document.body);

handle.on('change', onChangeHandle);

focusHandle()

document.body.appendChild(handle.domElem);

function focusHandle() {

    handle.setup({
        hand: {
            type: 'curver',
            autoRefresh: true,
            points: points
        }
    });

    handle.activate();
}

function onChangeHandle(change) {

    // console.log('change event:', change);

    points = change;

    // this.renderPath(ppointsath);
}

function renderPath(points) {

    var p = shape.points, pa, pb,
        cmd = 'M' + p[0].anchore.x + ',' + p[0].anchore.y + ' ';

    for (var i = 1; i < p.length; ++i) {

        pa = p[i-1];
        pb = p[i];

        cmd += 'C' + pa.handleRight.x + ',' + pa.handleRight.y + ' ';
        cmd += pb.handleLeft.x + ',' + pb.handleLeft.y + ' ';
        cmd += pb.anchore.x + ',' + pb.anchore.y + ' ';
    }

    svgPath.attr({d: cmd});
}