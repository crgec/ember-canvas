import Ember from 'ember';
import Layer from '../../mixins/layer'
import { requiredAttr, optionalAttr } from 'ember-strong-attrs';

const {
  Component,
  RSVP
} = Ember;

const FADE_DURATION = 500;
const easeInCubic = (t) => t * t * t;

@requiredAttr('src', String)
@optionalAttr('style', Object)
@optionalAttr('fadeIn')
@optionalAttr('fadeInDuration', Number)
export default class extends Ember.Component.extend(Layer, {
  tagName: '',
  type: 'image',
  imageAlpha: 1,
  
  didReceiveAttrs({ oldAttrs, newAttrs }) {
    console.log('update attrs');
    this._super(...arguments);
    if (!oldAttrs || oldAttrs.src !== newAttrs.src) {
      this.mount();   
    }
  },
  
  mount() {
    let image = new Image();
    let onLoad = ({ target }) => this.handleImageLoad(target);
    image.onload = onLoad;
    image.src = this.get('src');
  },
  
  handleImageLoad(image) {
    let frame = this.get('frame');
    let imageAlpha = this.get('imageAlpha');
    if (this.get('fadeIn')) {
      imageAlpha = 0;
    }
    return this.drawImage(image, frame, imageAlpha)
      .then(() => this.setProperties({ loaded: true }));
  },
  
  drawImage(image, frame, initialAlpha = 1) {
    return new RSVP.Promise((resolve) => {
      this._animationStartTime = Date.now();
      this.stepThroughAnimation(image, frame, initialAlpha);
      resolve();
    });
  },

  stepThroughAnimation(image, frame, imageAlpha) {
    let fadeInDuration = this.getWithDefault('fadeInDuration', FADE_DURATION);
    let alpha = easeInCubic((Date.now() - this._animationStartTime) / fadeInDuration);
    this.setProperties({ imageAlpha });
    this.attrs.draw(image, frame, imageAlpha);
    if (imageAlpha < 1) {
      this._pendingAnimationFrame = requestAnimationFrame(() => this.stepThroughAnimation(image, frame, Math.min(Math.max(alpha, 0), 1)));
    }
  }
}) { }
