const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

app.setName('생산계산기 초급자용');


function createWindow() {
  const win = new BrowserWindow({
    width: 1060,
    height: 820,
    minWidth: 420,
    minHeight: 640,
    title: '생산계산기 초급자용',
    icon: path.join(__dirname, 'app', 'assets', 'app-icon.png'),
    backgroundColor: '#06112c',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

