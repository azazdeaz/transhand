import React from 'react';
import Content from './Content';

export default class CursorHint extends React.Component {
  static defaultProps = {
    delay: 879,
    ContentComponent: Content,
    hints: null,
  }

  show = () => {
    this.setState({show: true});
  }

  handleMouseMove = (e) => {
    clearTimeout(this._showSetT);
    this._showSetT = setTimeout(this.show, this.props.delay);

    this.setState({
      show: false,
      x: e.clientX + 7,
      y: e.clientY + 7,
    });
  }

  render() {
    var {hints} = this.hints;
    var {show} = this.state;

    return show && hints ? <this.props.CustomHintContentComponent
      hints={hints}/> : <div hidden/>;
  }
}
