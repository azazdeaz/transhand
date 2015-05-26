import React from 'react';
import Transhand from './Transhand';
import CssCoordinator from './CssCoordinator';

export default class CssTranshand extends React.Component {

  static propTypes = {
    deTarget: React.PropTypes.node.isRequired,
    props: React.PropTypes.shape({
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

    this.state = {x: 0, y: 0, w: 0, h: 0};

    this.takeNextDeTarget(props.deTarget);
  }

  componentWillReceiveProps(nextProps) {
    this.takeNextDeTarget(nextProps.deTarget);
  }

  takeNextDeTarget(nextDeTarget) {

    if (this.props.deTarget !== nextDeTarget) {
      this.coordinator.setLocalRoot(
        nextDeTarget.parentElement, nextDeTarget, (base) => {
          this.setState({base});
        }
      );
    }
  }

  shouldComponentUpdate() {
    return !this.coordinator.isProcessing;
  }

  render() {

    var {params, onChange, onStartDrag, onEndDrag} = this.props;
    var {base} = this.state;

    return <Transhand
      base = {base}
      params = {params}
      coordinator = {this.coordinator}
      onStartDrag = {onStartDrag}
      onEndDrag = {onEndDrag}
      onChange = {onChange}/>;
  }
}
