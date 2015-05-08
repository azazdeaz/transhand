import React from 'react';
import Transhand from '../lib/Transhand';
import assign from 'lodash/object/assign';

export default class App extends React.Component {

  constructor() {

    this.state = {
      currDomElem: undefined,
    };
  }

  componentDidMount() {
    window.addEventListener('click', e => this.handleClickWindow(e));
  }

  handleClickWindow(e) {

    if (e.target._handlerDemo) {

      this.setState({currDomElem: e.target});
    }
    else if (e.target.nodeName === 'BODY') {
      this.setState({currDomElem: undefined});
    }
  }

  handleChange(change) {

    console.log('change event:', change);

    var { currDomElem } = this.state,
        params = currDomElem._handlerParams;

    assign(params, change);

    currDomElem.style.transform = this.generateCssTransform(params);
    currDomElem.style.transformOrigin = `${params.ox*100}% ${params.oy*100}%`;
  }

  generateCssTransform() {

    var cssTransform = '';

    cssTransform += ' translateX(' + params.tx + 'px)';
    cssTransform += ' translateY(' + params.ty + 'px)';
    cssTransform += ' rotate(' + params.rz + 'rad)';
    cssTransform += ' scaleX(' + params.sx + ')';
    cssTransform += ' scaleY(' + params.sy + ')';

    return cssTransform;
  }

  applyTransform(de) {

    var params = this.state.currDomElem._handlerParams,
        cssTransform = '';

    cssTransform += ' translateX(' + params.tx + 'px)';
    cssTransform += ' translateY(' + params.ty + 'px)';
    cssTransform += ' rotate(' + params.rz + 'rad)';
    cssTransform += ' scaleX(' + params.sx + ')';
    cssTransform += ' scaleY(' + params.sy + ')';

    de.style.transform = cssTransform;
    de.style.transformOrigin = (params.ox * 100) + '% ' + (params.oy * 100) + '%';
  }

  render() {

    var { currDomElem } = state;

    if (currDomElem) {

      let deParent = currDomElem.parentNode;

      return <Transhand
        deParent = {deParent}
        deTarget = {currentDomElem}
        params = {currDomElem._handlerParams}
        onChange = {this.handleChange}/>;
    }
    else {
      return <div hidden={true}/>;
    }
  }
}
