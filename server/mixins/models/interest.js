'use strict';

const co = require('co');
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
    },
  });
  app.model(Interest, {
    public: true,
    dataSource: db,
  });

  Interest.observe('after save', (ctx, next) => {
    const instance = ctx.instance;
    const Subscription = loopback.getModel('Subscription');

    const subs = {
      user_id: instance[config.marksMixin.createdBy],
      action: 'comment',
      target_type: instance.interestable_type,
      target_id: instance.interestable_id,
    };

    co(function*() {
      if (!instance.is_canceled) {
        // 订阅
        yield Subscription.findOrCreate(subs);
      } else {
        // 取消订阅
        const subscription = yield Subscription.findOne({where: subs});
        if (subscription) {
          yield subscription.delete();
        }
      }

      next();
    }).catch(next);
  });
}

module.exports = Interest;
