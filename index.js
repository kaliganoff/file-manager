import os from "os";
import path from "path";

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
});


