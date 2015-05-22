import React from 'react';
import Transhand from './Transhand';
import CssCoordinator from './CssCoordinator';

export default class CssTranshand() {

  static propTypes = {
    deTarget: React.PropTypes.node.isRequired,
    props: React.propTypes.shape({
      tx: React.PropTypes.number,
      ty: React.PropTypes.number,
      sx: React.PropTypes.number,
      sy: React.PropTypes.number,
      rz: React.PropTypes.number,
      ox: React.PropTypes.number,
      oy: React.PropTypes.number,
    }),
  }

  constructor(props) {
    super(props);

    this.coordinator = new CssCoordinator();
  }

  componentWillReceiveProps(nextProps) {
    var {deTarget} = nextProps;

    this.coordinator.setLocalRoot(deTarget.parentElement, deTarget, );
  }

  shouldComponentUpdate() {

    return false;

    var {deTarget} = nextProps;

    this.coordinator.setLocalRoot(deTarget.parentElement, deTarget);

    if (this.coordinator.isProcessing) {
      this.coordinator.onDoneProcessing(() => this.forceUpdate());
      return false;
    }
    else {
      return true;
    }
  }

  render() {
    var node = Editor.getModuleDOMNodeById(module.id);
    var base = this.coordinator.setLocalRoot(node.parentNode, node);
    var params = {};

    forIn(PROPMAP, (styleKey, key) => {

      var value = parseFloat(styleEditor.interface.transform[styleKey]);

      if (styleKey === 'rotate') value = value / 180 * Math.PI;

      params[key] = value;
    });

    params.oy = 0.5;
    params.ox = 0.5;

    return <Transhand
      base = {base}
      params = {params}
      coordinator = {this.coordinator}
      onStartDrag = {() => Editor.performanceMode = true}
      onEndDrag = {() => Editor.performanceMode = false}
      onChange = {change => this.handleChange(change)}/>
  }
}
