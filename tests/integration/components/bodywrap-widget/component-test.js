import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('bodywrap-widget', 'Integration | Component | bodywrap widget', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{bodywrap-widget}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#bodywrap-widget}}
      template block text
    {{/bodywrap-widget}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
