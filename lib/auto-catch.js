module.exports = function autoCatch(handlers) {
  if (typeof handlers === "function") return auto(handlers);

  return Object.keys(handlers).reduce((autoHandlers, key) => {
    autoHandlers[key] = auto(handlers[key]);
    return autoHandlers;
  }, {});
};

function auto(handler) {
  return (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}
