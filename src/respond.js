function respond(response, status, data, type = 'text/plain') {
  response.writeHead(status, {
    'Content-Type': type
  });
  response.end(data);
}

function respondJSON(response, status, data) {
  respond(response, status, JSON.stringify(data), 'application/json');
}

module.exports = {
  respond,
  respondJSON
};
