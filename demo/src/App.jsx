import React from 'react';
import Transhand from 'SRC/Transhand';
import CssCoordinator from 'SRC/CssCoordinator';
import assign from 'lodash/object/assign';

export default class App extends React.Component {

  constructor() {

    super();

    this.coordinator = new CssCoordinator();

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

    this.forceUpdate();
  }

  generateCssTransform(params) {

    var cssTransform = '';

    cssTransform += ' translateX(' + params.tx + 'px)';
    cssTransform += ' translateY(' + params.ty + 'px)';
    cssTransform += ' rotate(' + params.rz + 'rad)';
    cssTransform += ' scaleX(' + params.sx + ')';
    cssTransform += ' scaleY(' + params.sy + ')';

    return cssTransform;
  }

  render() {

    var {currDomElem} = this.state;

    if (currDomElem) {

      let deParent = currDomElem.parentNode;

      let base = this.coordinator.setLocalRoot(deParent, currDomElem);

      return <Transhand
        base = {base}
        params = {currDomElem._handlerParams}
        coordinator = {this.coordinator}
        onChange = {change => this.handleChange(change)}/>;
    }
    else {
      return <div hidden={true}/>;
    }
  }
}
