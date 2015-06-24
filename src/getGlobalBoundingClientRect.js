import findWhere from 'lodash/collection/findWhere'

export default function getGlobalBoundingClientRect(de) {

  var {top, left, width, height} = de.getBoundingClientRect()

  function check(deCheck) {
    var {ownerDocument} = deCheck

    if (ownerDocument !== document) {
      let parentDocument = ownerDocument.defaultView.parent.document
      let iframes = parentDocument.querySelectorAll('iframe')
      let iframe = findWhere(iframes, {contentDocument: ownerDocument})
      if (iframe) {
        let brIframe = iframe.getBoundingClientRect()
        left += brIframe.left
        top += brIframe.top
      }
    }
  }

  check(de)

  return {top, left, width, height}
}
