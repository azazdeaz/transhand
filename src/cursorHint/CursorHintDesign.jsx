import React from 'react'
import assign from 'lodash/object/assign'

const styles = {
  ul: {
    position: 'absolute',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    pointerEvents: 'none',
  },
  li: {
    textAlign: 'left',
    fontFamily: '\'Helvetica Neue\', Helvetica, Arial, sans-serif',
    fontSize: '14px',
    padding: '0 3px',
    cursor: 'pointer',
    color: '#000',
    backgroundColor: 'rgba(222,232,222,.785)',
  }
}

export default class CursorHintDesign extends React.Component {
  render() {
    var {hint, x, y} = this.props

    var ulStyle = assign({
      left: x,
      top: y,
    }, styles.ul)

    return <ul style={ulStyle}>
      {hint.map((line, idx) => {
        return <li style={styles.li} key={idx}>{line}</li>
      })}
    </ul>
  }
}
