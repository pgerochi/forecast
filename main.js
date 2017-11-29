const {app, BrowserWindow, ipcMain, Tray} = require('electron')
const path = require('path')

const assetsDirectory = path.join(__dirname, 'assets')

process.env.GOOGLE_API_KEY = "AIzaSyAjQz5Scgjt8A-n_PKQWjNiYg-ht2gUJts"

var menubar = require('menubar')
var mb = menubar(
  {
    width: 300,
    height: 550,
    icon: assetsDirectory + '/icon.png'
  }
)
var mainWindow = null;

mb.on('ready', function ready () {
  console.log('app is ready')

})

