import Ember from 'ember';
import layout from './template';
import { requiredAttr, optionalAttr } from 'ember-strong-attrs';
import { hitTest, getHitHandle } from '../../utils/hit-test';
import EventTypes from '../../utils/event-types';
import Frame from '../../utils/frame';

const {
  Component,
  computed,
  get,
  set
} = Ember;

const FADE_DURATION = 200;
const easeInCubic = (t) => t * t * t;

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
  selectedTool: null,
  left: 0,
  right: 0,
  scale: window.devicePixelRatio || 1,

  commandStream: new Rx.Subject(),

  scaledWidth: multiply('width', 'scale'),
  scaledHeight: multiply('height', 'scale'),

  rootLayer: computed('parentView', function() {
    return this;
  }),

  frame: computed('left', 'top', 'width', 'height', function() {
    let { left, top, width, height } = this.getProperties('left', 'top', 'width', 'height');
    return new Frame(left, top, width, height);
  }),

  init() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', () => {
      let canvas = this.getCanvas();
      let {
        scaledWidth,
        scaledHeight,
        scale
      } = this.getProperties('scaledWidth', 'scaledHeight', 'scale');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      let ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.scale(scale, scale);
      let clickStream = Rx.Observable.fromEvent(canvas, 'click');
      let commandStream = get(this, 'commandStream');

      commandStream.subscribe((command) => set(this, 'selectedTool', command));

      clickStream.withLatestFrom(commandStream, (click, command) => {
        return { command, click };
      }).subscribe((e) => {
        let { command, click: { layerX, layerY } } = e;
        switch(command) {
          case '#smockin':
            this.drawAvatar(layerX, layerY);
            break;
          case 'fire':
            this.drawFire(layerX, layerY);
            break;
        }
      });
    });
  },

  getCanvas() {
    let [canvas] = this.$().find('canvas');
    return canvas;
  },

  drawAvatar(x, y) {
    let image = new Image();
    let onLoad = ({ target }) => this.handleImageLoad(target, x, y);
    image.onload = onLoad;
    image.src = 'images/smokin.jpg';
  },

  drawFire(x, y) {
    return new Ember.RSVP.Promise((resolve) => {
      let canvas = this.getCanvas();
      let context = canvas.getContext('2d');

      context.save();
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = '#003300';
      context.arc(x, y, 30,0,Math.PI*2);
      context.stroke();
      context.font="30px sans-serif";
      context.fillText("🔥", x-15, y+15);
      context.closePath();
      context.restore();
      resolve(context);
    });
  },

  handleImageLoad(image, x, y) {
    let frame = new Frame(x - 30, y - 30, 60, 60);
    return this.drawImage(image, frame, 0)
    // .then(() => {
    //   let canvas = this.getCanvas();
    //   let context = canvas.getContext('2d');
    //   context.save();
    //   context.beginPath();
    //   context.lineWidth = 1;
    //   context.strokeStyle = '#003300';
    //   context.arc(frame.x+30, frame.y+30, (frame.width/2)+1,0,Math.PI*2,true);
    //   context.stroke();
    //   context.closePath();
    //   context.restore();
    // });
  },

  drawImage(image, frame, initialAlpha = 1) {
    let canvas = this.getCanvas();
    let context = canvas.getContext('2d');
    return new Ember.RSVP.Promise((resolve) => {
      this.stepThroughAnimation(image, frame, initialAlpha, resolve);
    });
  },

  stepThroughAnimation(image, frame, imageAlpha, onComplete) {
    let fadeInDuration = this.getWithDefault('fadeInDuration', FADE_DURATION);
    let alpha = easeInCubic((Date.now() - this._animationStartTime) / fadeInDuration);
    this.setProperties({ imageAlpha });
    this.draw(image, frame, imageAlpha);
    if (imageAlpha < 1) {
      return requestAnimationFrame(() => {
        return this.stepThroughAnimation(image, frame, Math.min(Math.max(alpha, 0), 1), onComplete);
      });
    }
    return onComplete();
  },

  draw(element, { x, y, width, height }, alpha) {
    let canvas = this.getCanvas();
    let context = canvas.getContext('2d');
    return new Ember.RSVP.Promise((resolve) => {
      context.save();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = alpha;

      context.beginPath();
      context.arc(x+30, y+30, width/2, 0, Math.PI*2, true);
      context.clip();
      context.drawImage(element, x, y, width, height);
      context.closePath();
      context.restore();

      context.restore();
      resolve(context);
    });
  },

  actions: {
    capture(e) {
      let commandStream = get(this, 'commandStream');
      commandStream.onNext(e);
    }
  }
}) { }
