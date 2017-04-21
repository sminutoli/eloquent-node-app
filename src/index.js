//theirs
const http = require('http');
const ecstatic = require('ecstatic');

//ours
const Router = require('./router');
const configureRouterForTalks = require('./talks');

const theFileServer = ecstatic({ root: './public' });
const port = 8000;
const theRouter = configureRouterForTalks(Router);

const resolveOrServe = (request, response) => theRouter.resolve(request, response) || theFileServer(request, response);
http.createServer(resolveOrServe).listen(port);

console.log(`listening on port ${port}`);
