import heuristicGlobalToLocal from './heuristicGlobalToLocal';
import findWhere from 'lodash/collection/findWhere';

const tProps = ['transform', 'transformOrigin', 'prespective',
  'prespectiveOrigin', 'transformStyle'];

export default class CssCooldinator {

  constructor() {

    this._buffMockDiv = [];
  }

  L2G(p) {

    if (!this._deLocalRootPicker) {
        return p;
    }

    this._deLocalRootPicker.style.left = p.x + 'px';
    this._deLocalRootPicker.style.top = p.y + 'px';

    document.body.appendChild(this._deLocalRoot);
    var br = this._deLocalRootPicker.getBoundingClientRect();
    document.body.removeChild(this._deLocalRoot);

    return {
        x: br.left,
        y: br.top,
    };
  }

  G2L(p) {

    if (!this._deLocalRootPicker) {
        return p;
    }

    document.body.appendChild(this._deLocalRoot);
    var ret = heuristicGlobalToLocal(p, this._deLocalRootPicker);
    document.body.removeChild(this._deLocalRoot);

    return ret;
  }


  setLocalRoot(de, deTarget) {

    var that = this,
        deRoot = getDiv(),
        deTop = deRoot,
        dePicker = getDiv(),
        transformeds = [],
        parentPos = {left: -window.scrollX, top: -window.scrollY},
        assembleIdx = 0,
        ret;

    if (this._deLocalRoot) {
        disassemble(this._deLocalRoot);
    }

    walkBack(de);
    assemble();

    deTop.appendChild(dePicker);

    this._deLocalRoot = deRoot;
    this._deLocalRootPicker = dePicker;
    this._deLocalRootPicker.setAttribute('picker', 1);//debug
    // document.body.appendChild(this._deLocalRoot);


    if (deTarget) {
        //calculate the offset from the local root ex. for the hand setup.base
        let inlineTransform = deTarget.style.transform;
        deTarget.style.transform = 'none';

        let brA = deTarget.getBoundingClientRect(),
            brB = de.getBoundingClientRect();

        ret = {
            x: brA.left - brB.left,
            y: brA.top - brB.top,
            w: brA.width,
            h: brA.height,
        };

        deTarget.style.transform = inlineTransform;
    }


    transformeds.forEach(function (reg) {
        reg.de.style.transform = reg.inlineTransform;
    });
    transformeds.length = 0;

    return ret;


    function walkBack(de) {

        // if (de.nodeName === 'BODY') return;
        if (!de || de === window.document.body) return;

        if (de.nodeName === '#document') {

          var iframes = de.defaultView.parent.document.querySelectorAll('iframe');
          var iframe = findWhere(iframes, {contentDocument: de});

          if (iframe) {
            return walkBack(iframe);
          }
          else {
            return;
          }
        }

        var reg,
            computedStyle = window.getComputedStyle(de);

        tProps.forEach(function (propName) {

            var value = computedStyle.getPropertyValue(propName);
            if (value) set(propName, value);
        });

        walkBack(de.parentNode);

        function set(propName, value) {

            if (!reg) {
                reg = {
                    de: de,
                    inlineTransform: de.style.transform,
                    style: {}
                };

                transformeds.unshift(reg);
            }

            de.style.transform = 'none';

            reg.style[propName] = value;
        }
    }

    function assemble() {

        var transformReg = transformeds[assembleIdx++],
            deNext = transformReg ? transformReg.de : de,
            nextPos = deNext.getBoundingClientRect();

        var deNew = getDiv();
        deTop.appendChild(deNew);
        deTop = deNew;

        deNew.style.left = (nextPos.left - parentPos.left) + 'px';
        deNew.style.top = (nextPos.top - parentPos.top) + 'px';

        parentPos = nextPos;

        if (transformReg) {

            //for the transform and perspective origin
            deNew.style.width = nextPos.width + 'px';
            deNew.style.height = nextPos.height + 'px';

            Object.keys(transformReg.style).forEach(function (propName) {

                deNew.style[propName] = transformReg.style[propName];
            });

            assemble();
        }
    }


    function disassemble(de) {

        de.removeAttribute('style');
        de.removeAttribute('picker');//debug
        that._buffMockDiv.push(de);

        var child = de.firstChild;
        if (child) {
            de.removeChild(child);
            disassemble(child);
        }
    }

    function getDiv() {

        var de = that._buffMockDiv.pop() || document.createElement('div');
        de.style.position = 'absolute';
        de.style.left = '0px';
        de.style.top = '0px';
        de.setAttribute('mock', 1);//debug

        return de;
    }
  }
}
