import defaults from 'lodash/object/defaults';


export default class Style {

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

    this.group = {
      pointerEvents: 'none'
    };

    this.canvas = {
      position: 'absolute',
    };

    this.fullHit = {
      position: 'absolute',
      pointerEvents: 'none',
      width: '100%',
      height: '100%',
    };

    this.originHit = {
      position: 'absolute',
      border: `${config.rotateFingerDist}px solid rgba(234,0,0,0)`,
      borderRadius: `${config.rotateFingerDist}px`,
    };

    this.svgRoot = {
      overflow: 'visible',
    };

    this.hitBox = {
      strokeWidth: config.rotateFingerDist * 2,
      stroke: 'rgba(0,0,0,0)',
      fill: 'rgba(0,0,0,0)',
      strokeLinejoin: 'round',
    };
  }
}
