import os from "os";
import path from "path";
import fs from 'fs';

const { stdin, stdout } = process;
let dir = os.homedir();


const username = process.env.npm_config_username;
if (username) {
    console.log(`Welcome to the File Manager, ${username}!`);
    console.log('You are currently in ' + dir);
    console.log('Please enter commands: ');
} else {
    console.log('Please specify your username as an argument like this: ')
    console.log('npm run start -- --username=your_username')
    process.exit(0);
}

stdin.on('data', (data) => {
    if (data.toString() === 'up' + os.EOL) {
        dir = path.join(dir, '..');
        console.log('You are currently in ' + dir);
    }
    if (data.toString() === 'ls' + os.EOL) {
        fs.readdir(dir, { withFileTypes: true }, (err, dirents) => {
            if (err) throw new Error('FS operation failed');
            let directories = dirents.filter(item => item.isDirectory()).map(item => [item.name, 'directory']);
            let files = dirents.filter(item => item.isFile()).map(item => [item.name, 'file']);
            console.table([...directories, ...files])
          });
    }
});


