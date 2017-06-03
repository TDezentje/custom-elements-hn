const path = require('path');
const fs = require('fs');
const NodeUglifier = require('node-uglifier');

new NodeUglifier(path.resolve(__dirname, '../node_modules/@webcomponents/custom-elements/custom-elements.min.js'))
    .uglify()
    .exportToFile(path.resolve(__dirname, '../dist/client/assets/custom-elements.js'));


let contentsPromise = fs.readFileSync(path.resolve(__dirname, '../node_modules/promise-polyfill/promise.js'), 'utf8');
let contentsFetch = fs.readFileSync(path.resolve(__dirname, '../node_modules/whatwg-fetch/fetch.js'), 'utf8');
let filePath = path.resolve(__dirname, '../dist/client/assets/fetch.js');

fs.writeFileSync(filePath, contentsPromise + '\n'+ contentsFetch);


new NodeUglifier(filePath)
    .uglify()
    .exportToFile(filePath);

const iconsFolder = path.resolve(__dirname, `../dist/client/assets/icons`);

if(!fs.existsSync(iconsFolder)) {
    fs.mkdirSync(iconsFolder);
}

let content = fs.readdirSync(path.resolve(__dirname, '../icons'));
for(let item of content) {
    fs.writeFileSync(iconsFolder +'/' + item, fs.readFileSync(path.resolve(__dirname, `../icons/${item}`)));
}