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

// @requiredAttr('width', Number)
// @requiredAttr('height', Number)
// @optionalAttr('scale', Number)
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

  didInsertElement() {
    this._super(...arguments);
    let canvas = this.getCanvas();
    paper.setup(canvas);
    // Create a Paper.js Path to draw a line into it:
		var path = new paper.Path();
    var raster = new paper.Raster('images/smokin.jpg');
    raster.position = paper.view.center;
		paper.view.draw();

    var source = Rx.Observable.fromEventPattern(
      function add (h) {
        paper.view.onResize = h;
      },
      function remove (h) {
        paper.view.onResize = null;
      }
    );

    source.subscribe((e) => {
      raster.position = paper.view.center;    
    });
  },

  init() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', () => {
      let canvas = this.getCanvas();
      let clickStream = Rx.Observable.fromEvent(canvas, 'click');
      let scrollStream = Rx.Observable.fromEvent(canvas, 'mousewheel');

      scrollStream.subscribe((e) => {
        let { offsetX, offsetY, deltaY } = e;
        let { view, Point } = paper;
        let mousePosition = new Point(offsetX, offsetY);
        let viewPosition = view.viewToProject(mousePosition)
        let center = view.center;
        let oldZoom = view.zoom;
        let [newZoom, offset] = this.changeZoom(view.zoom, deltaY, center, viewPosition);
        view.zoom = newZoom;
        view.center = view.center.add(offset);
        e.preventDefault();
        view.draw();
      });

      var tool = new paper.Tool();
      tool.activate();
		  var path;

      var mouseDownStream = Rx.Observable.fromEventPattern(
        function add (h) {
          tool.onMouseDown = h;
        }
      );
      var mouseDragStream = Rx.Observable.fromEventPattern(
        function add (h) {
          tool.onMouseDrag = h;
        }
      );

      mouseDragStream.subscribe((e) => {
        path.add(e.point);
      });

      mouseDownStream.subscribe((e) => {
        path = new paper.Path();
        path.add(e.point);
        path.strokeColor = 'white';
      });
    });
  },

  changeZoom(oldZoom, delta, c, p) {
    let factor = 1.05;
    let newZoom = oldZoom;
    if (delta < 0) {
      newZoom = oldZoom * factor;
    }
    if (delta > 0) {
      newZoom = oldZoom / factor;
    }
    let beta = oldZoom / newZoom;
    let pc = p.subtract(c);
    let a = p.subtract(pc.multiply(beta)).subtract(c);
    return [newZoom, a];
  },

  getCanvas() {
    let [canvas] = this.$().find('canvas');
    return canvas;
  },

  actions: {
    zoom() {

    },
    close() {

    }
  }
}) { }
