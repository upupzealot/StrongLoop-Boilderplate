'use strict';

module.exports = (Model) => {
  // TODO: other mixins

  Model.listUrl = () => {
    return `/${Model.pluralModelName}`;
  };
  Model.prototype.listUrl = () => {
    return Model.listUrl();
  };
  Model.prototype.url = function () {
    return `/${Model.pluralModelName}/${this.id}`;
  };
};
