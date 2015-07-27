import Ember from "ember";
export default Ember.TextField.extend({
    tagName: "input",
    type: "file",
    classNames: ["save-button", "hidden"],
    attributeBindings: ['nwsaveas']
});