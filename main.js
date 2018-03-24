const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, globalShortcut, ipcMain} = electron;

let mainWindow;
let addWindow;

// Listen for the app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({});
  // Load the html file into the window
  mainWindow.loadURL(url.format({
    // loadURL works this way file://dirname/mainWindow.html
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Quit app when closed
  mainWindow.on('close', function(){
    app.quit();
  })

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert the Menu
  Menu.setApplicationMenu(mainMenu);
  //Register a shortcut
  globalShortcut.register('CommandOrControl+Q', () => {
     app.quit();
   });
  globalShortcut.register('CommandOrControl+I', () => {
    mainWindow.openDevTools();
    addWindow.openDevTools();
  });

});

// Handle create add Window
function createAddWindow(){
  // Create new window
  addWindow = new BrowserWindow({
    width: 400,
    height: 200,
    title: 'Add shopping list item'
  });
  // Load the html file into the window
  addWindow.loadURL(url.format({
    // loadURL works this way file://dirname/mainWindow.html
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  //Garbage collection handler
  addWindow.on('close', function(){
    addWindow = null;
  })
}

// Catch item:admin
ipcMain.on('item:add', function(e, item){
  // console.log(item);
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});
// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add item',
        click(){
          createAddWindow();
        }
      },
      {
        label: 'Clear items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If mac, add empty object to Menu
if (process.platform == "darwin") {
  // unshift method insert a new object in the begging of the array
  mainMenuTemplate.unshift({});
}

// Add developer tools itms if not in production
if (process.env.NOD_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        label: 'Toggle DevTools',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
