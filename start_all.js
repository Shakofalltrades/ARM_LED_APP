const { spawn } = require('child_process');
const path = require('path');

const runCommandInNewTerminal = (command, args, cwd) => {
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/k', 'cd', cwd, '&&', command, ...args], { stdio: 'inherit' });
  } else if (process.platform === 'darwin') {
    return spawn('osascript', ['-e', `tell app "Terminal" to do script "cd ${cwd} && ${command} ${args.join(' ')}"`], { stdio: 'inherit' });
  } else {
    return spawn('gnome-terminal', ['--', 'bash', '-c', `cd ${cwd} && ${command} ${args.join(' ')}; exec bash`], { stdio: 'inherit' });
  }
};

const commands = [
  { command: 'node', args: ['server.js'], cwd: path.join(__dirname, 'back-end') },
  { command: 'node', args: ['websocketserver.js'], cwd: path.join(__dirname, 'websocket-server') },
  { command: 'npm', args: ['start'], cwd: path.join(__dirname, 'front-end') }
];

commands.forEach(cmd => {
  runCommandInNewTerminal(cmd.command, cmd.args, cmd.cwd);
});
