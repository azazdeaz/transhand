import React from 'react';
import heuristicGlobalToLocal from './heuristicGlobalToLocal';
import findWhere from 'lodash/collection/findWhere';
import assign from 'lodash/object/assign';

const TRANSFORM_PROPS = ['transform', 'transformOrigin', 'prespective',
  'prespectiveOrigin', 'transformStyle'];
const NULL_VALUES = ['none', 'matrix(1, 0, 0, 1, 0, 0)'];

export default class CssCooldinator {

  constructor() {

    this._buffMockDiv = [];
    this._picker = <div key='picker'/>;

    this._mockMount = document.createElement('div');
    this._mockMount.style.pointerEvents = 'none';
    this._mockMount.style.opacity = 0;
    this._mockMount.style.position = 'absolute';
    this._mockMount.style.top = '0px';
    this._mockMount.style.left = '0px';
    this._mockMount.setAttribute('transhand-dom-tree-mock', 1);//just for debug
    document.body.appendChild(this._mockMount);
  }

  localToGlobal(p) {
    // document.body.appendChild(this._mockMount);

    var dePicker = this._dePicker;

    dePicker.style.left = p.x + 'px';
    dePicker.style.top = p.y + 'px';

    var br = dePicker.getBoundingClientRect();

    // document.body.removeChild(this._mockMount);

    console.log('localToGlobal', p, {
      x: br.left,
      y: br.top,
    })
    return {
      x: br.left,
      y: br.top,
    };
  }

  globalToLocal(p) {

    // document.body.appendChild(this._mockMount);

    var ret = heuristicGlobalToLocal(p, this._dePicker);

    // document.body.removeChild(this._mockMount);
    console.log('globalToLocal', p, ret)
    return ret;
  }

  setLocalRoot() {
    if (this.isProcessing) {
      console.warn('fednek a setLocalRoor-ok!!!')
      return;
    }
    this.isProcessing = true;//tells the the Transhand that it isn't ready

    setTimeout(() => this._setLocalRoot(...arguments));
  }

  _setLocalRoot(deParent, deTarget) {


    var transformeds = [], ret;

    walkBack(deParent);

    React.render(<MockDiv
      parentLeft = {-window.scrollX}
      parentTop = {-window.scrollY}
      transformList={transformeds}>
      <div id='picker'/>
    </MockDiv>, this._mockMount, () => {

      this._dePicker = this._mockMount.querySelector('#picker');
      this.isProcessing = false;

      if (this.onProcessingDone) {
        this.onProcessingDone();
        this.onProcessingDone = undefined;
      }
    });


    if (deTarget) {
      //calculate the offset from the local root. It can be used as
      // the base prop of Transhand
      let inlineTransform = deTarget.style.transform;
      deTarget.style.transform = 'none';

      let brA = deTarget.getBoundingClientRect(),
        brB = deParent.getBoundingClientRect();

      ret = {
        x: brA.left - brB.left,
        y: brA.top - brB.top,
        w: brA.width,
        h: brA.height,
      };

      deTarget.style.transform = inlineTransform;
    }


    transformeds.forEach(reg => {
      reg.de.style.transform = reg.inlineTransform;
    });

    return ret;


    function walkBack(de) {

        if (!de || de === window.document.body) return;

        if (de.nodeName === '#document') {

          var iframes = de.defaultView.parent.document.querySelectorAll('iframe');
          var iframe = findWhere(iframes, {contentDocument: de});

          if (iframe) {
            walkBack(iframe);
            return;
          }
          else {
            return;
          }
        }

        var reg,
            computedStyle = window.getComputedStyle(de);

        TRANSFORM_PROPS.forEach(function (propName) {

            var value = computedStyle.getPropertyValue(propName);
            if (value && NULL_VALUES.indexOf(value) === -1) {
              set(propName, value);
            }
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
    //
    // function assemble() {
    //
    //     var transformReg = transformeds[assembleIdx++],
    //         deNext = transformReg ? transformReg.de : de,
    //         nextPos = deNext.getBoundingClientRect();
    //
    //     var deNew = getDiv();
    //     deTop.appendChild(deNew);
    //     deTop = deNew;
    //
    //     deNew.style.left = (nextPos.left - parentPos.left) + 'px';
    //     deNew.style.top = (nextPos.top - parentPos.top) + 'px';
    //
    //     parentPos = nextPos;
    //
    //     if (transformReg) {
    //
    //         //for the transform and perspective origin
    //         deNew.style.width = nextPos.width + 'px';
    //         deNew.style.height = nextPos.height + 'px';
    //
    //         Object.keys(transformReg.style).forEach(function (propName) {
    //
    //             deNew.style[propName] = transformReg.style[propName];
    //         });
    //
    //         assemble();
    //     }
    // }
    //
    //
    // function disassemble(de) {
    //
    //     de.removeAttribute('style');
    //     de.removeAttribute('picker');//debug
    //     that._buffMockDiv.push(de);
    //
    //     var child = de.firstChild;
    //     if (child) {
    //         de.removeChild(child);
    //         disassemble(child);
    //     }
    // }
    //
    // function getDiv() {
    //
    //     var de = that._buffMockDiv.pop() || document.createElement('div');
    //     de.style.position = 'absolute';
    //     de.style.left = '0px';
    //     de.style.top = '0px';
    //     de.setAttribute('mock', 1);//debug
    //
    //     return de;
    // }
  }
}

class MockDiv extends React.Component {
  static defaultProps = {
    transformListIdx: 0,
    parentLeft: 0,
    parentTop: 0,
  }

  render() {
    var {transformList, transformListIdx, parentLeft, parentTop} = this.props,
      transformReg = transformList[transformListIdx],
      node = transformReg.de,
      pos = node.getBoundingClientRect();

    var renderChild = () => {
      if (transformListIdx < transformList.length - 1) {
        return <MockDiv
          picker={this.props.picker}
          parentLeft = {pos.left}
          parentTop = {pos.top}
          transformList = {transformList}
          transformListIdx = {transformListIdx + 1}>
          {this.props.chidren}
        </MockDiv>;
      }
      else {
        return this.props.children;
      }
    };

    return <div style={assign({
      left: pos.left - parentLeft,
      top: pos.top - parentTop,
      width: pos.width,
      height: pos.height,
    }, transformReg.style)}>

      {renderChild()}
    </div>;
  }
}
