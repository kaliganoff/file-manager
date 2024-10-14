import os from "os";
import path from "path";
import fs from 'fs';
import { createHash } from "crypto";
import { createGunzip, createGzip } from "zlib";
import { pipeline } from "stream";

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
            if (err) console.log('Operation failed');
            let directories = dirents.filter(item => item.isDirectory()).map(item => [item.name, 'directory']);
            let files = dirents.filter(item => item.isFile()).map(item => [item.name, 'file']);
            console.table([...directories, ...files])
          });
    }
    if (data.toString().startsWith('cd')) {
        const newDir = data.toString().split(' ')[1];
        try {
        process.chdir(newDir.split(os.EOL)[0]);
        dir = process.cwd();
        console.log('You are currently in ' + dir)
        } catch(error) {
            console.log('Invalid input')
        }
    }
    if (data.toString().startsWith('cat')) {
        const filePath = data.toString().split(' ')[1].split(os.EOL)[0];
        try {
        const readStream = fs.createReadStream(filePath, 'utf-8');
        readStream.on('data', (chunk) => stdout.write(chunk));
        readStream.on('end', () => stdout.write(os.EOL));
        } catch(error) {
            console.log('Invalid input')
        }
    }
    if (data.toString().startsWith('add')) {
        const fileName = data.toString().split(' ')[1].split(os.EOL)[0];
        fs.writeFile(fileName, '', { flag: 'wx' }, err => {
            if (err) {
              console.log('Operation failed');
            } else {
                console.log('File created')
            }
          });
    }
    if (data.toString().startsWith('rn')) {
        const filePath = data.toString().split(' ')[1];
        const newName = data.toString().split(' ')[2].split(os.EOL)[0];
        const newPath = path.join(path.dirname(filePath), newName);
        const exists = fs.existsSync(newPath);
        if (!exists) {
        fs.promises.rename(filePath, newPath).then(() => console.log('File renamed successfully')).catch(() => {
            console.error('FS operation failed')
        })
    } else {
        console.error('FS operation failed')
    }
    }
    if (data.toString().startsWith('cp')) {
        try {
        const filePath = data.toString().split(' ')[1];
        const fileName = path.basename(filePath);
        const newDir = data.toString().split(' ')[2].split(os.EOL)[0];
            const readStream = fs.createReadStream(filePath, 'utf-8');
            const writeStream = fs.createWriteStream(path.join(newDir + fileName), 'utf-8');
            readStream.pipe(writeStream);
            readStream.on('error', () => {
                console.log('1')
            });
    } catch(error) {
        console.log(error);
    }
}
if (data.toString().startsWith('mv')) {
    try {
        const filePath = data.toString().split(' ')[1];
        const fileName = path.basename(filePath);
        const newDir = data.toString().split(' ')[2].split(os.EOL)[0];
            const readStream = fs.createReadStream(filePath, 'utf-8');
            const writeStream = fs.createWriteStream(path.join(newDir + fileName), 'utf-8');
            readStream.pipe(writeStream);
            readStream.on('error', () => {
                console.log(1);
            });
            readStream.on('close', () => {
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Operation failed');
                  }); 
            })
    } catch(error) {
        console.log('Invalid input');
    }
}
if (data.toString().startsWith('rm')) {
    try {
        const filePath = data.toString().split(' ')[1].split(os.EOL)[0];
        fs.unlink(filePath, (err) => {
          if (err) console.error('Operation failed');
        }); 
    } catch (error) {
        console.error(error);
    }
}
if (data.toString().startsWith('hash')) {
    const getHash = path => new Promise((resolve, reject) => {
        const hash = createHash('sha256');
        const readStream = fs.createReadStream(path);
        readStream.on('error', reject);
        readStream.on('data', chunk => hash.update(chunk));
        readStream.on('end', () => resolve(hash.digest('hex')));
       })
 try {
        const filePath = data.toString().split(' ')[1].split(os.EOL)[0];
        getHash(filePath).then(value => console.log(value)).catch(error => console.log(error));
 }
 catch(error) {
    console.log(error);
 }
}
if (data.toString().startsWith('compress')) {
    const filePath = data.toString().split(' ')[1];
    const newPath = data.toString().split(' ')[2].split(os.EOL)[0];
    const gzip = createGzip();
    const source = fs.createReadStream(filePath);
    const destination = fs.createWriteStream(newPath);

    pipeline(source, gzip, destination, (err) => {
        if (err) {
          console.error('An error occurred:', err);
          process.exitCode = 1;
        }
      });
}
if (data.toString().startsWith('decompress')) {
    const filePath = data.toString().split(' ')[1];
    const newPath = data.toString().split(' ')[2].split(os.EOL)[0];
    const gunzip = createGunzip();
    const source = fs.createReadStream(filePath);
    const destination = fs.createWriteStream(newPath);

    pipeline(source, gunzip, destination, (err) => {
        if (err) {
          console.error('An error occurred:', err);
          process.exitCode = 1;
        }
      });
}
});