export function radDiff(r0, r1) {

    r0 %= Math.PI
    r1 %= Math.PI
    r0 += Math.PI
    r1 += Math.PI

    return r1 - r0
}

export function sqr(x) {
    return x * x
}

export function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y)
}

export function distToSegmentSquared(p, v, w) {

    var l2 = dist2(v, w)

    if (l2 === 0) return dist2(p, v)

    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2

    if (t < 0) return dist2(p, v)
    if (t > 1) return dist2(p, w)

    return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) })
}

export function distToSegment(p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w))
}

export function distToPointInAngle(p0, p1, rad) {

    var dx = p1.x - p0.x,
        dy = p1.y - p0.y,
        d = Math.sqrt(dx**2 + dy**2),
        mRad = Math.atan2(dy, dx)

    rad = mRad - rad

    // console.log('dx', dx, 'dy', dy, 'd', d, 'mRad', mRad, 'rad', rad, 'return', Math.cos(rad) * d)

    return Math.cos(rad) * d

}

export function isInside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point.x, y = point.y

    var inside = false
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y
        var xj = vs[j].x, yj = vs[j].y

        var intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }

    return inside
}

export function equPoints(pa, pb) {

  return pa.x === pb.x && pa.y === pb.y
}
