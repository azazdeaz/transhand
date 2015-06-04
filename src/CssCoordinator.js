import React from 'react';
import heuristicGlobalToLocal from './heuristicGlobalToLocal';
import findWhere from 'lodash/collection/findWhere';
import assign from 'lodash/object/assign';

const TRANSFORM_PROPS = ['transform', 'transformOrigin', 'prespective',
  'prespectiveOrigin', 'transformStyle'];
const NULL_VALUES = ['none', 'matrix(1, 0, 0, 1, 0, 0)'];

export default class CssCoordinator {

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

    if (this._hasTransform) {
      let dePicker = this._dePicker;
      if (!dePicker) return p;

      dePicker.style.left = p.x + 'px';
      dePicker.style.top = p.y + 'px';

      let br = dePicker.getBoundingClientRect();

      return {
        x: br.left,
        y: br.top,
      };
    }
    else {
      return p;
    }
  }

  globalToLocal(p) {

    if (this._hasTransform) {
      let dePicker = this._dePicker;
      if (!dePicker) return p;

      let ret = heuristicGlobalToLocal(p, dePicker);

      console.log('globalToLocal', p);
      return ret;
    }
    else {
      return p;
    }
  }

  setLocalRoot(deParent, deTarget, onDone) {
    var done = () => {
      this.isProcessing = false;

      if (this.onProcessingDone) {
        this.onProcessingDone(this._base);
        this.onProcessingDone = undefined;
      }
    };

    var walkBack = (de) => {

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

      var reg;
      var computedStyle = window.getComputedStyle(de);

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
    };

    var setBase = () => {
      let inlineTransform = deTarget.style.transform;
      deTarget.style.transform = 'none';

      let brA = deTarget.getBoundingClientRect();

      if (this._hasTransform) {
        let brB = deParent.getBoundingClientRect();

        this._base = {
          x: brA.left - brB.left,
          y: brA.top - brB.top,
          w: brA.width,
          h: brA.height,
        };
      }
      else {
          console.log(JSON.stringify(brA))
        this._base = {
          x: brA.left,
          y: brA.top,
          w: brA.width,
          h: brA.height,
        };
      }

      deTarget.style.transform = inlineTransform;
    };

    ////////////////////////////////////////////////////////////////////////////

    var transformeds = [];

    this.isProcessing = true;
    this.onProcessingDone = onDone;

    walkBack(deParent);

    this._hasTransform = transformeds.length !== 0;

    setBase();

    if (this._hasTransform) {
      React.render(<MockDiv
        parentLeft = {-window.scrollX}
        parentTop = {-window.scrollY}
        transformList={transformeds}>

        <div id='picker' style={{position: 'absolute'}}/>
      </MockDiv>, this._mockMount, () => {

        this._dePicker = this._mockMount.querySelector('#picker');
        done();
      });
    }
    else {
      done();
    }

    transformeds.forEach(reg => {
      reg.de.style.transform = reg.inlineTransform;
    });
  };
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
      position: 'absolute',
      left: pos.left - parentLeft,
      top: pos.top - parentTop,
      width: pos.width,
      height: pos.height,
    }, transformReg.style)}>

      {renderChild()}
    </div>;
  }
}
