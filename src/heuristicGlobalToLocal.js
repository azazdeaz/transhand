//convert a global position into the local coordinate system of a
// (css transformed) DomElement

export default function heuristicGlobalToLocal (mPos, dePicker) {

    var tweakDist = 128,
        // tweakDistStep = 0,
        tweakRad = Math.PI / 2,
        dist = tweakDist * 2,
        rad = 0,
        nullPos = {x:0, y: 0},
        globalNullPos = localToGlobal(nullPos),
        globalRad = getRad(globalNullPos, mPos),
        globalDist = posDist(globalNullPos, mPos)

    while (tweakRad > 0.000001) {

        var globalTestRad = getRad(mPos, localToGlobal(Rad2Pos(rad, tweakDist)))

        if (radDiff(globalRad, globalTestRad) < 0) {

            rad += tweakRad
        }
        else {
            rad -= tweakRad
        }

        tweakRad /= 2
    }


    while (posDist(globalNullPos, localToGlobal(Rad2Pos(rad, dist + 2*tweakDist))) < globalDist && dist < tweakDist * 64) {

        dist += 4*tweakDist
    }

    while (tweakDist > 1) {

        if (posDist(globalNullPos, localToGlobal(Rad2Pos(rad, dist))) < globalDist) {

            dist += tweakDist
        }
        else {
            dist -= tweakDist
        }

        tweakDist /= 2
    }

    return Rad2Pos(rad, dist)



    //utils/////////////////////////////////////////////////////////////////////

    function getRad(aPos, bPos) {

       return Math.atan2(bPos.y - aPos.y, bPos.x - aPos.x)
    }

    function Rad2Pos(rad, dist) {

        return {
            x: Math.cos(rad) * dist,
            y: Math.sin(rad) * dist,
        }
    }

    function localToGlobal(pos) {

        dePicker.style.left = pos.x + 'px'
        dePicker.style.top = pos.y + 'px'

        var br = dePicker.getBoundingClientRect()

        return {x: br.left, y: br.top}
    }

    function radDiff(aRad, bRad) {

      bRad -= aRad
      bRad %= Math.PI*2

      if (bRad > Math.PI) bRad -= 2*Math.PI
      else if (bRad < -Math.PI) bRad += 2*Math.PI

      return bRad
    }

    function posDist(aP, bP) {

        var dx = aP.x - bP.x,
            dy = aP.y - bP.y

        return Math.sqrt(dx*dx+ dy*dy)
    }
}
