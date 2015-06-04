import defaults from 'lodash/object/defaults';

export default class Styles {

  constructor(config) {

    defaults(config, {
      rotateFingerDist: 16,
      originRadius: 6,
    });

    this.root = {
      position: 'fixed',
      pointerEvents: 'none',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
    };

    this.fullHit = {
      position: 'absolute',
      pointerEvents: 'auto',
      width: '100%',
      height: '100%',
    };
  }
}
