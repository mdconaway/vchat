export function initialize(application) {
    debug.disableCache();
    if(application.environment === 'production')
    {
        debug.setLevel(0);  //LOG NONE OF THE THINGS!
    }
    else
    {
        debug.setLevel(9);  //LOG ALL THE THINGS!
    }
}

export default {
  name: 'setDebug',
  before: 'guiBar',
  initialize: initialize
};