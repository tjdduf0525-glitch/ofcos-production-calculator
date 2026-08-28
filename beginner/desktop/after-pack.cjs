const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(context) {
  const editor = path.join(process.cwd(), 'build', 'rcedit-x64.exe');
  const icon = path.join(process.cwd(), 'build', 'app-icon.ico');
  const executable = path.join(context.appOutDir, '생산계산기 초급자용.exe');
  execFileSync(editor, [
    executable,
    '--set-icon', icon,
    '--set-version-string', 'ProductName', '생산계산기 초급자용',
    '--set-version-string', 'FileDescription', '생산계산기 초급자용',
    '--set-file-version', '1.0.0',
    '--set-product-version', '1.0.0',
  ]);
};

