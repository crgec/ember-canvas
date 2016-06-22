/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-canvas',

  init(app) {
    this.options = this.options || {};
    this.options.babel = this.options.babel || {};
    this.options.babel.optional = this.options.babel.optional || [];

    if (this.options.babel.optional.indexOf('es7.decorators') === -1) {
      this.options.babel.optional.push('es7.decorators');
    }
  },
  included: function(app) {
    this._super.included(app);
    app.import(`${app.bowerDirectory}/rxjs/dist/rx.all.js`);
  }
};
