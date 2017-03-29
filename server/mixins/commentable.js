'use strict';

const co = require('co');
const loopback = require('loopback');
const app = require('../server.js');

const config = require('../config/index.js');

module.exports = (Model, options) => {
  const Comment = require('./models/comment');

  if (Model.modelName !== 'Comment') {
    Model.hasMany('comment', {
      as: 'comments',
      polymorphic: {
        foreignKey: 'commentable_id',
        discriminator: 'commentable_type',
      },
    });
  } else {
    Model.defineProperty('commentable_id', {
      type: Number,
    });
    Model.defineProperty('commentable_type', {
      type: String,
    });
    Model.hasMany('comment', {
      as: 'comments',
      foreignKey: 'parent_id',
    });
  }

  loopback.configureModel(Model, {
    dataSource: Model.dataSource,
    acls: [
      {
        accessType: 'EXECUTE',
        principalType: 'ROLE',
        principalId: '$authenticated',
        permission: 'ALLOW',
        property: '__create__comments',
      },
    ],
  });
};
