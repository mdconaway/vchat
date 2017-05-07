import DS from 'ember-data';
const { RESTAdapter } = DS;

export default RESTAdapter.extend({
    host: 'https://vchat-server.herokuapp.com'
});