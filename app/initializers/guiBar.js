export function initialize() {  //(application) available if needed
    if(process.platform == "darwin")
    {
        let gui = require('nw.gui');
        let menubar = new gui.Menu({ type: 'menubar' });
        menubar.createMacBuiltin("Video Chat");
        let win = gui.Window.get();
        //var file = new gui.Menu();
        //var help = new gui.Menu();
        win.menu = menubar;
        //win.menu.insert(new gui.MenuItem({ label: 'File', submenu: file}), 1);
        //win.menu.append(new gui.MenuItem({ label: 'Help', submenu: help}));
        //file.append(new gui.MenuItem({ label: 'Open'}));
    }
}

export default {
  name: 'guiBar',
  initialize: initialize
};