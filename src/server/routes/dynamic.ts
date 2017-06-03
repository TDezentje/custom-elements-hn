import { Router } from 'express';
import * as path from 'path';
import * as Mustache from 'mustache';

import * as crypto from 'crypto';
import * as fs from 'fs';

const dynamic = Router();

let assetsData = JSON.parse(fs.readFileSync(path.resolve(path.join('dist', 'assets.json')), 'utf8'));

dynamic.get('/*', (req, res) => {
    let html = Mustache.render(require('views/index.mustache'), {
        asset: () => {
            return (text, render) => {
                let assetString = assetsData[text] || text;
                return `${assetsData[text] || text}`;
            }
        }
    });
    
    res.send(html);
});

console.log('[App: Dynamic] initialized.');
export default dynamic;
