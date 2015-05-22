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

  shouldComponentUpdate(nextProps) {

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

  }
}
