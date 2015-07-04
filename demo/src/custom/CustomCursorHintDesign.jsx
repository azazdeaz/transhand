import React from 'react'
import {List, Panel} from 'react-matterkit'

export default class CustomCursorHintDesign extends React.Component {
  render() {
    var {hint, x, y} = this.props

    var style = {
      position: 'absolute',
      left: x,
      top: y,
    }

    return <Panel style={style}>
      <List items={hint}/>
    </Panel>
  }
}
