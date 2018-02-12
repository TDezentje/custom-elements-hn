import * as fs from 'fs';
import * as path from 'path';


const fileContents = fs.readFileSync(path.resolve('settings.json'), 'utf8');
const Settings = JSON.parse(fileContents);

export {Settings};