
const url = require("url");

const Router = {
  routes: [],
  add(method, url, handler) {
    this.routes.push({method, url, handler});
  },
  resolve(request, response) {
    const path = url.parse(request.url).pathname;

    return this.routes.some(function(route) {
      const match = route.url.exec(path);
      if (!match || route.method != request.method)
        return false;

      const urlParts = match.slice(1).map(decodeURIComponent);
      const params = [request, response, ...urlParts];
      route.handler(...params);
      return true;
    });
  }
};

module.exports = Router;
