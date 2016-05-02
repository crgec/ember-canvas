import Ember from 'ember';
import layout from './template';
import { requiredAttr, optionalAttr } from 'ember-strong-attrs';
import { hitTest, getHitHandle } from '../../utils/hit-test';
import EventTypes from '../../utils/event-types';
import Frame from '../../utils/frame';

const {
  Component,
  computed
} = Ember;

const multiply = (...dependencies) => 
  computed(...dependencies, function() {
    return dependencies
      .map(prop => this.get(prop))
      .reduce((a, b) => a * b);
  });

@requiredAttr('width', Number)
@requiredAttr('height', Number)
@optionalAttr('scale', Number)
export default class extends Component.extend({
  layout,
  left: 0,
  right: 0,
  scale: window.devicePixelRatio || 1,
  
  scaledWidth: multiply('width', 'scale'),
  scaledHeight: multiply('height', 'scale'),
  
  rootLayer: computed('parentView', function() {
    return this;
  }),
  
  frame: computed('left', 'top', 'width', 'height', function() {
    let { left, top, width, height } = this.getProperties('left', 'top', 'width', 'height');
    return new Frame(left, top, width, height);
  }),
  
  didInsertElement() {
    this._super(...arguments);
    let canvas = this.getCanvas();
    let { 
      scaledWidth, 
      scaledHeight, 
      scale 
    } = this.getProperties('scaledWidth', 'scaledHeight', 'scale');
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    canvas.getContext('2d').scale(scale, scale);
  },
  
  getCanvas() {
    let [canvas] = this.$().find('canvas');
    return canvas;
  },
  
  draw(element, { x, y, width, height }, alpha) {
    return new Ember.RSVP.Promise((resolve) => {
      let canvas = this.getCanvas();
      let context = canvas.getContext('2d');
      context.save();
      context.globalAlpha = alpha;
      context.drawImage(element, x, y, width, height);
      resolve(context);
    });
  },

  hitTest(e) {
    let canvas = this.getCanvas();
    let hitTarget = hitTest(e, this.get('rootLayer'), canvas);
    if (hitTarget) {
      hitTarget[getHitHandle(e.type)](e);
    }
  },

  handleTouchStart(e) {
    let canvas = this.getCanvas();
    var hitTarget = hitTest(e, this.get('rootLayer'), canvas);
    var touch;
    if (hitTarget) {
      // On touchstart: capture the current hit target for the given touch.
      this._touches = this._touches || {};
      for (var i=0, len=e.touches.length; i < len; i++) {
        touch = e.touches[i];
        this._touches[touch.identifier] = hitTarget;
      }
      hitTarget[getHitHandle(e.type)](e);
    }
  },

  handleTouchMove(e) {
    this.hitTest(e);
  },

  handleTouchEnd(e) {
    // touchend events do not generate a pageX/pageY so we rely
    // on the currently captured touch targets.
    if (!this._touches) {
      return;
    }

    var hitTarget;
    var hitHandle = getHitHandle(e.type);
    for (var i=0, len=e.changedTouches.length; i < len; i++) {
      hitTarget = this._touches[e.changedTouches[i].identifier];
      if (hitTarget && hitTarget[hitHandle]) {
        hitTarget[hitHandle](e);
      }
      delete this._touches[e.changedTouches[i].identifier];
    }
  },

  handleClick(e) {
    this.hitTest(e);
  },

  handleContextMenu(e) {
    this.hitTest(e);
  },

  handleDoubleClick(e) {
    this.hitTest(e);
  },
  
  actions: {
    draw(element) {
      this.draw(element, element.get('frame'));
    },
    onTouchStart(e) {
      this.handleTouchStart(e);
    },
    onTouchEnd(e) {
      this.handleTouchEnd(e);
    },
    onTouchMove(e) {
      this.handleTouchMove(e);
    },
    onTouchCancel(e) {
      this.handleTouchEnd(e);
    },
    onClick(e) {
      this.handleClick(e);
    },
    onContextMenu(e) {
      this.handleContextMenu(e);
    },
    onDoubleClick(e) {
      this.handleDoubleClick(e);
    },
  }
}) { }
