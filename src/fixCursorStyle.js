//HACK the animated data uri svg cursors doesn't refresh in chrome without this

import {findDOMNode} from 'react-dom'
/**
 * ref - mounted react component or DOM element
 * cursor - string
*/
export default function fixCursorStyle(ref, cursor) {
  const node = findDOMNode(ref)
  node.style.cursor = 'default'
  node.style.cursor = cursor
}
