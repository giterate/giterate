function defineOne(Type, method, ReaderWriter) {
  Type.prototype[method] = function () {
    this._definitions[method] = this._definitions[method]
      || new ReaderWriter(this, ...arguments);

    return this._definitions[method];
  }
};

module.exports = function define(Type, definitions) {
  Object.entries(definitions)
    .forEach(([method, ReaderWriter]) => {
      defineOne(Type, method, ReaderWriter);
    });
}
