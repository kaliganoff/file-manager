import os from "os";
import path from "path";
import fs from 'fs';
import { spawn } from "child_process";

const { stdin, stdout } = process;
let dir = os.homedir();
process.chdir(dir);


const username = process.env.npm_config_username;
if (username) {
    console.log(`Welcome to the File Manager, ${username}!`);
    console.log('You are currently in ' + process.cwd());
    console.log('Please enter commands: ');
} else {
    console.log('Please specify your username as an argument like this: ')
    console.log('npm run start -- --username=your_username')
    process.exit(0);
}

stdin.on('data', (data) => {
    if (data.toString() === 'up' + os.EOL) {
        dir = path.join(dir, '..');
        process.chdir(dir);
        console.log('You are currently in ' + dir);
    }
    if (data.toString() === 'ls' + os.EOL) {
        fs.readdir(dir, { withFileTypes: true }, (err, dirents) => {
            if (err) throw new Error('Operation failed');
            let directories = dirents.filter(item => item.isDirectory()).map(item => [item.name, 'directory']);
            let files = dirents.filter(item => item.isFile()).map(item => [item.name, 'file']);
            console.table([...directories, ...files])
          });
    }
    if (data.toString().includes('cd')) {
        const newDir = data.toString().split(' ')[1];
        try {
        process.chdir(newDir.split(os.EOL)[0]);
        dir = process.cwd();
        console.log(process.cwd())
        } catch(error) {
            console.log('Invalid input')
        }
    }
});


