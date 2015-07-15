export function initialize(registry, application) {
    var gui = require('nw.gui');
    var menubar = new gui.Menu({ type: 'menubar' });
    console.log(process.platform);
    if(process.platform == "darwin")
    {
        menubar.createMacBuiltin("Video Chat");
    }
    var win = gui.Window.get();
    //var file = new gui.Menu();
    //var help = new gui.Menu();
    win.menu = menubar;
    //win.menu.insert(new gui.MenuItem({ label: 'File', submenu: file}), 1);
    //win.menu.append(new gui.MenuItem({ label: 'Help', submenu: help}));
    //file.append(new gui.MenuItem({ label: 'Open'}));
}

export default {
  name: 'guiBar',
  initialize: initialize
};