import Ember from "ember";
const { Controller, inject } = Ember;

export default Controller.extend({
    index: inject.controller(),
    showModal: false,
    modalName: '',
    modalContext: {}
});