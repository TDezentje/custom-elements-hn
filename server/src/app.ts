import * as express from 'express';
;
import * as methodOverride from 'method-override';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';

import dynamic from './routes/dynamic';
import staticFiles from './routes/static-files';
import api from './routes/api';

const PORT = process.env.PORT || 8081;
const app = express();

app.use(compression());
app.use(methodOverride());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/assets', staticFiles);
app.use('/api', api);
app.use('/', dynamic);

app.listen(PORT, () => {
  console.log(`Redirect listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});