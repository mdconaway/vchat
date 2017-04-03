import Ember from 'ember';
import config from './config/environment';

let Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('settings', function() {
    this.route('loading');
    this.route('openssl');
  });
});

export default Router;
