'use strict';

const _ = require('lodash');
const assert = require('assert');
const Promise = require('bluebird');

const loopback = require('loopback');

module.exports = (NotificationEvent) => {
  NotificationEvent.push = function*(event) {
    assert(event && event.from_id, 'from id 未定义');
    assert(event.action);
    assert(event.target_type);
    assert(event.target_id);

    // 消息事件
    const noti = _.merge({}, {
      type: 'notification',
    }, event);
    const notiEvent = yield NotificationEvent.create(noti);

    // 找到相关订阅
    const Subscription = loopback.getModel('Subscription');
    const subscriptions = yield Subscription.find({
      where: {
        action: notiEvent.action,
        target_type: notiEvent.target_type,
        target_id: notiEvent.target_id,
      },
    });

    // 创建消息实体
    const noties = subscriptions.map((subscription) => {
      return {
        event_id: notiEvent.id,
        to_id: subscription.id,
      };
    });
    const Notification = loopback.getModel('Notification');
    const notifications = yield Promise.map(noties, (noti) => {
      return Notification.create(noti);
    });

    return notifications;
  };
};
