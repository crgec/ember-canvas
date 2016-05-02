import Ember from 'ember';
import Frame from '../utils/frame';

const {
  Mixin,
  computed
} = Ember;

export default Mixin.create({
  left: 0,
  top: 0,
  width: 0,
  height: 0,

  alpha: null,
  backgroundColor: null,
  borderColor: null,
  borderWidth: null,
  borderRadius: null,
  clipRect: null,
  scale: null,
  translateX: null,
  translateY: null,
  zIndex: null,

  shadowColor: null,
  shadowBlur: null,
  shadowOffsetX: null,
  shadowOffsetY: null,

  frame: computed('left', 'top', 'width', 'height', function () {
    let { left, top, width, height } = this.getProperties('left', 'top', 'width', 'height');
    return new Frame(left, top, width, height);
  }),

  onTouchStart() {
    console.log('start', arguments);
  },
  onTouchEnd() {
    console.log('end', arguments);
  },
  onTouchMove() {
    console.log('move', arguments);
  },
  onTouchCancel() {
    console.log('canlce', arguments);
  },
  onClick() {
    console.log('click', arguments);
  },
  onContextMenu() {
    console.log('contextmenu', arguments);
  },
  onDoubleClick() {
    console.log('dbl click', arguments);
  },
});
