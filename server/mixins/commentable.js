'use strict';

const co = require('co');
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
      description: '评论',
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
      relations: {
        creator: {
          type: 'belongsTo',
          model: 'user',
          foreignKey: 'created_by',
        },
        commentable: {
          type: 'belongsTo',
          polymorphic: {
            foreignKey: 'commentable_id',
            discriminator: 'commentable_type',
          },
        },
        parent: {
          type: 'belongsTo',
          model: 'Comment',
          foreignKey: 'parent_id',
        },
        replied: {
          type: 'belongsTo',
          model: 'Comment',
          foreignKey: 'replied_id',
        },
      },
    });
    app.model(Comment, {
      public: true,
      dataSource: db,
    });

    Comment.observe('before save', (ctx, next) => {
      const instance = ctx.instance;
      if (instance && instance.commentable_type === 'Comment') {
        co(function*() {
          const replied = yield Comment.findById(instance.commentable_id);

          instance.commentable_id = replied.commentable_id;
          instance.commentable_type = replied.commentable_type;
          instance.replied_id = replied.id;

          if (replied && replied.replied_id === undefined) {
            instance.parent_id = replied.id;
          } else { // replied.commentable_type === 'Comment'
            instance.parent_id = replied.parent_id;
          }

          next();
        }).catch(next);
      } else {
        next();
      }
    });
  }

  Model.hasMany('comment', {
    as: 'comments',
    polymorphic: {
      foreignKey: 'commentable_id',
      discriminator: 'commentable_type',
    },
  });
};
