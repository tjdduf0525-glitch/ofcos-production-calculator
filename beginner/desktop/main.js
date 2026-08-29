const { app, BrowserWindow, dialog } = require('electron');
const https = require('https');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const path = require('path');

app.setName('생산계산기 초급자용');

const UPDATE_INFO = 'https://raw.githubusercontent.com/tjdduf0525-glitch/ofcos-production-calculator/main/updates/beginner-pc.json';
function request(url, onResponse) {
  https.get(url, { headers: { 'User-Agent': 'OFCOS-Production-Calculator' } }, response => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) return request(response.headers.location, onResponse);
    onResponse(response);
  }).on('error', () => {});
}
function versionNumber(value) { return value.replace(/^v/, '').split('.').reduce((sum, part, i) => sum + Number(part) * [1000000,1000,1][i], 0); }
function checkForUpdate() {
  request(UPDATE_INFO, response => {
    let body=''; response.on('data', chunk => body+=chunk); response.on('end', async () => {
      try {
        const info=JSON.parse(body), latest=info.version;
        if (versionNumber(latest) <= versionNumber(app.getVersion())) return;
        const {response:choice}=await dialog.showMessageBox({type:'info',title:'생산계산기 초급자용 업데이트',message:`새 버전 v${latest}이 있습니다.`,detail:'지금 업데이트하시겠습니까?',buttons:['업데이트','나중에'],defaultId:0});
        if(choice!==0)return;
        const target=path.join(os.tmpdir(),`production-calculator-beginner-update-${latest}.exe`);
        request(info.downloadUrl, fileResponse => {
          const output=fs.createWriteStream(target); fileResponse.pipe(output); output.on('finish', async () => {
            output.close();
            await dialog.showMessageBox({type:'info',title:'생산계산기 초급자용 업데이트',message:'업데이트 다운로드가 완료되었습니다.',detail:'확인을 누르면 앱을 종료하고 자동으로 설치합니다.',buttons:['확인']});
            const script=`Start-Sleep -Seconds 3; Start-Process -FilePath '${target.replace(/'/g,"''")}' -ArgumentList '/S' -Wait`;
            spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-Command',script],{detached:true,stdio:'ignore'}).unref();
            app.quit();
          });
        });
      } catch (_) {}
    });
  });
}

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
  if (app.isPackaged) setTimeout(checkForUpdate, 1500);
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

