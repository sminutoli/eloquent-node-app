const trace = message => value => console.log(message, value) || value;

module.exports = trace;