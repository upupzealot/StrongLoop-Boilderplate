'use strict';

const loopback = require('loopback');
const app = require('../../server.js');

const config = require('../../config/index.js');

let Interest = loopback.findModel('Interest');
if (!Interest) {
  const db = app.dataSources.db;

  // 创建 Interest Model
  Interest = db.createModel('Interest', {
    // properties
    is_canceled: {
      type: 'boolean',
      default: false,
      description: '已取消',
    },
  }, {
    // options
    description: 'Follow、Like 关系表',
    mixins: {
      Marks: {
        createdAt: true,
        createdBy: true,
      },
      Commentable: {},

      RemoteRouting: {
        only: [
          '@deleteById',
        ],
      },
    },
    relations: {
      user: {
        type: 'belongsTo',
        model: 'user',
        foreignKey: config.marksMixin.createdBy,
      },
      commentable: {
        type: 'belongsTo',
        polymorphic: {
          foreignKey: 'interestable_id',
          discriminator: 'interestable_type',
        },
      },
    },
  });
  app.model(Interest, {
    public: true,
    dataSource: db,
  });

  Interest.observe('after save', (ctx, next) => {
    const instance = ctx.instance;

    co(function*() {
      
      if(!instance.is_canceled) {
        // 订阅
        
      } else {
        // 取消订阅
        
      }

      next();
    }).catch(next);

  });
}

module.exports = Interest;
