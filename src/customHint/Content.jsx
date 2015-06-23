import React from 'react';

const styles = {
  ul: {
    position: 'fixed',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    pointerEvents: 'none',
  },
  li: {
    textAlign: 'left',
    fontFamily: '"Open Sans", sans-serif',
    fontSize: '14px',
    padding: '0 3px',
    cursor: 'pointer',
    color: '#000',
    background: 'rgba(222,232,222,.785)',
  }
};

export default class Content extends React.Component {
  render() {
    var {hints} = this.props;

    return <ul style={styles.ul}>
      {hints.map(hint => {
        return <li>{hint}</li>;
      })}
    </ul>;
  }
}
