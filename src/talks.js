//ours
const { respond, respondJSON } = require('./respond');
const readStreamAsJSON = require('./streamAsJson');
const trace = require('./trace');

const talks = {
  __proto__: null,
  leo: {
    title: 'pebete',
    summary: 'algo modificado',
    comments: []
  }
};

const talksMatcher = /^\/talks$/;
const talkMatcher = /^\/talks\/([^\/]+)$/;

const deleteTalk = title => {
  delete talks[title];
  registerChange(title);
};

const validateTalk = aTalk => {
  const validTalk = aTalk
    && typeof aTalk.presenter === 'string'
    && typeof aTalk.summary === 'string';
  if(!validTalk) throw Error('Bad talk data');
  return aTalk;
};

const validateComment = aComment => {
  const validComment = aComment
    && typeof aComment.author === 'string'
    && typeof aComment.message === 'string';
  if(!validComment) throw Error('Bad comment data');
  return aComment;
};

const registerChange = Function.prototype;

const doGet = (request, response, title) => {
  return title in talks 
    ? respondJSON(response, 200, talks[title]) 
    : respond(response, 404, `No talk ${title} found`);
};

const doDelete = (request, response, title) => {
  return title in talks
    ? deleteTalk(title)
    : respond(response, 204, null);
};

const doPut = (request, response, title) => {
  const respondError = error => respond(response, 400, error.toString());
  const respondOk = () => respond(response, 204, null);
  const storeTalk = aTalk => {
    const { presenter, summary } = aTalk;
    talks[title] = {
      title,
      presenter,
      summary,
      comments: []
    };
    registerChange(title);
  };
  readStreamAsJSON
    .read(request)
    .then(validateTalk)
    .then(storeTalk)
    .then(respondOk)
    .catch(respondError);
};

const doPost = (request, response, title) => {
  
  const respondError = error => console.log('respondError') || respond(response, 400, error.toString());
  const respondNotFound = error => console.log('respondNotFound') || respond(response, 404, `No talk ${title} found`);
  const respondOk = () => respond(response, 204, null);
  const storeComment = aComment => {
    talks[title].comments.push(aComment);
    registerChange(title);
    return aComment;
  };
  readStreamAsJSON.read(request)
    .then(validateComment)
    .catch(respondError)
    .then(storeComment)
    .then(respondOk)
    .catch(respondNotFound);    
};

const sendTalks = (talks, response) => respondJSON(response, 200, {
  serverTime: Date.now(),
  talks
});

const waiting = [];

const waitForChanges = (since, response) => {
  const waiter = { since, response };
  const isStillWaiting = () => waiting.indexOf(waiter) > -1;
  const removeWaiter = () => waiting.splice(waiting.indexOf(waiter), 1);
  const sendEmptyResponse = () => sendTalks([], response);
  waiting.push(waiter);
  setTimeout( () => isStillWaiting()
    ? removeWaiter() && sendEmptyResponse()
    : null
  , 90 * 1000);
};

const doGetAll = (request, response) => {
  var query = require('url').parse(request.url, true).query;
  if (query.changesSince == null) {
    const list = Object.keys(talks).map( title => talks[title] );
    sendTalks(list, response);
  } else {
    const since = Number(query.changesSince);
    if (isNaN(since)) {
      respond(response, 400, "Invalid parameter");
    } else {
      const changed = getChangedTalks(since);
      if (changed.length > 0)
         sendTalks(changed, response);
      else
        waitForChanges(since, response);
    }
  }
};

const configureRouter = router => {
  router.add('GET', talksMatcher, doGetAll);
  router.add('GET', talkMatcher, doGet);
  router.add('DELETE', talkMatcher, doDelete);
  router.add('PUT', talkMatcher, doPut);
  router.add('POST', talkMatcher, doPost);
  return router;
};

module.exports = configureRouter;
