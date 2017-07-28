import { Router } from 'express';
import * as path from 'path';

const sw = Router();

const swPath = path.resolve(path.join('dist', 'client', 'sw.js'));

sw.get('/', (req, res) => {
    res.sendFile(swPath);
});

console.log('[App: manifest] initialized.');
export default sw;
