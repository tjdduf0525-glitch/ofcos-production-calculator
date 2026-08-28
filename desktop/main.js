const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

app.setName('생산계산기');

function createWindow() {
  const win = new BrowserWindow({
    width: 1060,
    height: 820,
    minWidth: 420,
    minHeight: 640,
    title: '생산계산기',
    icon: path.join(__dirname, 'app', 'assets', 'app-icon.png'),
    backgroundColor: '#06112c',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  if (app.isPackaged) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox({
        type: 'info', title: '생산계산기 업데이트',
        message: '새 업데이트가 준비되었습니다.',
        detail: '지금 다시 시작하면 자동으로 적용됩니다.',
        buttons: ['지금 다시 시작', '나중에'], defaultId: 0
      }).then(({ response }) => { if (response === 0) autoUpdater.quitAndInstall(false, true); });
    });
  }
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

