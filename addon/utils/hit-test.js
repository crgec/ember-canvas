import { default as Frame, inset } from './frame';
import EventTypes from './event-types';

export function hitTest(e, rootLayer, rootNode) {
  let touch = e.touches ? e.touches[0] : e;
  let touchX = touch.pageX;
  let touchY = touch.pageY;
  let rootNodeBox;
  if (rootNode) {
    rootNodeBox = rootNode.getBoundingClientRect();
    touchX -= rootNodeBox.left;
    touchY -= rootNodeBox.top;
  }

  touchY = touchY - window.pageYOffset;
  touchX = touchX - window.pageXOffset;
  
  return getLayerAtPoint(
    rootLayer,
    e.type,
    new Frame(touchX, touchY, 1, 1),
    rootLayer.translateX || 0,
    rootLayer.translateY || 0
  );
}

export function getHitHandle (type) {
  var hitHandle;
  for (var tryHandle in EventTypes) {
    if (EventTypes[tryHandle] === type) {
      hitHandle = tryHandle;
      break;
    }
  }
  return hitHandle;
}

function sortByZIndexDescending (layer, otherLayer) {
  return (otherLayer.zIndex || 0) - (layer.zIndex || 0);
}

function getLayerAtPoint (root, type, point, tx, ty) {
  var layer = null;
  var hitHandle = getHitHandle(type);
  var sortedChildren;
  var hitFrame = root.get('frame').clone();

  // Early bail for non-visible layers
  if (typeof root.alpha === 'number' && root.alpha < 0.01) {
    return null;
  }

  // Child-first search
  if (root.get('childViews.length')) {
    sortedChildren = root.get('childViews').slice().reverse().sort(sortByZIndexDescending);
    for (var i=0, len=sortedChildren.length; i < len; i++) {
      layer = getLayerAtPoint(
        sortedChildren[i],
        type,
        point,
        tx + (root.translateX || 0),
        ty + (root.translateY || 0)
      );
      if (layer) {
        break;
      }
    }
  }

  // Check for hit outsets
  if (root.hitOutsets) {
    hitFrame = inset(hitFrame,
      -root.hitOutsets[0], -root.hitOutsets[1],
      -root.hitOutsets[2], -root.hitOutsets[3]
    );
  }

  // Check for x/y translation
  if (tx) {
    hitFrame.x += tx;
  }

  if (ty) {
    hitFrame.y += ty;
  }

  // No child layer at the given point. Try the parent layer.
  if (!layer && root[hitHandle] && hitFrame.intersects(point)) {
    layer = root;
  }

  return layer;
}

export default {
  hitTest,
  getHitHandle
}