import { Router } from 'express';
import * as path from 'path';

import * as crypto from 'crypto';
import * as fs from 'fs';

const dynamic = Router();

import { dom } from 'dom';
dom();

import { App } from 'app/app.element';
import { StyleRegistry } from 'decorators/custom-element.decorator';

const indexHtml = path.resolve(path.join('dist', 'index.html'));
const htmlFile = fs.readFileSync(path.resolve(path.join('dist', 'index.html')), 'utf8');
const styleRegex = /<(hn-[^> ]+)/g;

const swPath = path.resolve(path.join('dist', 'sw.js'));
dynamic.get('/sw.js', (req, res) => {
    res.sendFile(swPath);
});

dynamic.get('/index.html', (req, res) => {
    res.sendFile(indexHtml);
});

const favicon = path.resolve(path.join('dist/assets', 'favicon.ico'));
dynamic.get('/favicon.ico', (req, res) => {
    res.sendFile(favicon);
});

dynamic.get('/*', async (req, res) => {
    (<any>global).location.pathname = req.originalUrl;

    try {
        let app = new App();
        await app.connectedCallback();
        const rendered = '<hn-app ssr>' + app.innerHTML + '</hn-app>';

        const selectors = [];
        
        let match;
        while ((match = styleRegex.exec(rendered)) !== null) {
            const selector = match[1];
            if(selectors.indexOf(selector) === -1) {
                selectors.push(selector);
            }
        }

        res.send(htmlFile.replace('<hn-app></hn-app>', rendered)
            .replace('</head>', `${selectors.map(selector => StyleRegistry.get(selector)).join('')}</head>`)
        );
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

console.log('[App: Dynamic] initialized.');
export default dynamic;
