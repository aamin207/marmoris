import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const cleanedArgs = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--host') {
    cleanedArgs.push('-H');
  } else {
    cleanedArgs.push(args[i]);
  }
}

console.log(`> Spawning Next.js dev server with arguments: ${JSON.stringify(cleanedArgs)}`);

const child = spawn('next', ['dev', '-p', '3000', ...cleanedArgs], {
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  process.exit(code || 0);
});
