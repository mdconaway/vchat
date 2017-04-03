import Ember from 'ember';
const { Component } = Ember;
export default Component.extend({
    value: '',
    classNames: ['input-group'],
    fileInput: null,
    didInsertElement: function(){
        let fileInput = this.$('.file-chooser').first();
        fileInput.change(() => {
            this.sendAction('change', fileInput.val());
        });
        this.set('fileInput', fileInput);
    },
    actions: {
        findFile: function(){
            this.get('fileInput').click();
        }
    }
});
