import * as express from 'express';
import * as path from 'path';

const STATIC_PATH = path.resolve(path.join('dist', 'client', 'assets'));
const STATIC_OPTS = {
  maxAge: 31536000000
};

console.log('[App: Static] initialized.');
export default express.static(STATIC_PATH, STATIC_OPTS);
