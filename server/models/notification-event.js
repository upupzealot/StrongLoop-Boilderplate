'use strict';

const _ = require('lodash');
const assert = require('assert');

module.exports = (NotificationEvent) => {
  NotificationEvent.emitNoti = (notification) => {
    assert(notification && notification.from, 'from id 未定义');
    assert(notification.action);
    assert(notification.target_type);
    assert(notification.target_id);

    const noti = _.merge({}, {
      type: 'notification',
    }, notification);

    return NotificationEvent.create(noti);
  };
};
