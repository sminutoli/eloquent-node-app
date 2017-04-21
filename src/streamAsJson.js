const StreamAsJson = {
  read(stream) {
    const toParseTheStream = (fulfilled, rejected) => {
      let data = '';
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => {
        try {
          fulfilled(JSON.parse(data));
        } catch(err) {
          rejected(err);
        }
      });
      stream.on('error', rejected);
    };
    return new Promise(toParseTheStream);
  }
};

module.exports = StreamAsJson;