import DS from 'ember-data';
const { Model, attr } = DS;

export default Model.extend({
    name: attr('string'),
    username: attr('string'),
    password: attr('string'),
    email: attr('string')
});