import * as express from 'express';
import dynamic from './routes/dynamic';
import staticFiles from './routes/static-files';
import manifest from './routes/manifest';

import * as fs from 'fs';
import * as path from 'path';
import * as compression from 'compression';

const PORT = process.env.PORT || 8080;
const app = express();

app.use(compression());

app.use('/manifest.json', manifest);
app.use('/assets', staticFiles);
app.use('/', dynamic);

app.listen(PORT, () => {
  console.log(`Redirect listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
