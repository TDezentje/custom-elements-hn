import { Router } from 'express';
import * as path from 'path';
import * as fs from 'fs';

const dynamic = Router();

import { dom } from 'dom';
dom();

import { AppElement } from 'app/app.element';
import { StyleRegistry } from 'decorators/custom-element.decorator';
import { PermanentRedirectError } from 'errors/permanent-redirect.error';

const indexHtml = path.resolve('index.html');
const htmlFile = fs.readFileSync(path.resolve('index.html'), 'utf8');
const styleRegex = /<(hn-[^> ]+)/g;

const swPath = path.resolve('sw.js');
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

async function handleAll(req, res) {
    try {
        let app = new AppElement();
        app.requestContext = req;
        app.responseContext = res;
        await (app as any).connectedCallback();
        const rendered = '<hn-app ssr>' + app.innerHTML + '</hn-app>';

        const selectors = [];

        let match;
        while ((match = styleRegex.exec(rendered)) !== null) {
            const selector = match[1];
            if (selectors.indexOf(selector) === -1) {
                selectors.push(selector);
            }
        }

        res.send(htmlFile.replace('<hn-app></hn-app>', rendered)
            .replace('</head>', `${selectors.map(selector => StyleRegistry.get(selector)).join('')}</head>`)
        );
    } catch (error) {
        if (error instanceof PermanentRedirectError) {
            res.redirect(301, error.path);
        } else {
            console.log(error);
            res.sendStatus(500);
        }
    }
}

dynamic.get('/*', handleAll);
dynamic.post('/*', handleAll);

console.log('[App: Dynamic] initialized.');
export default dynamic;
