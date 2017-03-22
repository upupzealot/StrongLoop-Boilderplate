'use strict';

module.exports = (Model) => {
  // TODO: other mixins

  Model.observe('loaded', (ctx, next) => {
    const instance = ctx.instance || ctx.data;
    instance.listUrl = `/${Model.pluralModelName}`;
    instance.url = `/${Model.pluralModelName}/${instance.id}`;
    next();
  });
};
