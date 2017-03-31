import Ember from "ember";
const { TextField } = Ember;

export default TextField.extend({
    tagName: "input",
    type: "file",
    classNames: ["save-button", "hidden"],
    attributeBindings: ['nwsaveas']
});