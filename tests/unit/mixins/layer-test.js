import Ember from 'ember';
import LayerMixin from 'ember-canvas/mixins/layer';
import { module, test } from 'qunit';

module('Unit | Mixin | layer');

// Replace this with your real tests.
test('it works', function(assert) {
  let LayerObject = Ember.Object.extend(LayerMixin);
  let subject = LayerObject.create();
  assert.ok(subject);
});
