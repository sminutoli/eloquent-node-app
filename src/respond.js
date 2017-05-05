function respond(response, status, data, type = 'text/plain') {
  response.writeHead(status, {
    'Content-Type': type
  });
  return response.end(data);
}

function respondJSON(response, status, data) {
  return respond(response, status, JSON.stringify(data), 'application/json');
}

module.exports = {
  respond,
  respondJSON
};
