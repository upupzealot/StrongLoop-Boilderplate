'use strict';

const loopback = require('loopback');
const app = require('../server.js');

module.exports = (Model, options) => {
  let Comment = loopback.findModel('Comment');
  if (!Comment) {
    const db = Model.getDataSource();
    Comment = db.createModel('Comment', {
      // properties
    }, {
      // options
      mixins: {
        HtmlField: {},
        Marks: {
          createdAt: 'created_at',
          createdBy: 'created_by',
          updatedAt: 'updated_at',
          updatedBy: 'updated_by',
        },
        Commentable: {},
      },
    });
    app.model(Comment, {
      public: true,
      dataSource: db,
    });
  }

  Model.hasMany('comment', {
    as: 'comments',
    polymorphic: {
      foreignKey: 'commentableId',
      discriminator: 'commentableType',
    },
  });
};
