'use strict';

const co = require('co');

const loopback = require('loopback');
const Notification = loopback.getModel('Notification');

module.exports = (router, server) => {
  router.get('/Notifications/:notiId', (req, res, next) => {
    co(function*() {
      const notiId = req.params.notiId;
      let notification = yield Notification.findById(notiId, {
        include: {
          relation: 'event',
          scope: {
            include: ['target'],
          },
        },
      });

      const user = res.locals.user;
      if (!user || !notification || user.id !== notification.to_id) {
        return res.redirect('back');
      }

      yield notification.updateAttribute('is_read', true);

      notification = notification.toJSON();
      const event = notification.event;
      if (notification.event.action === 'comment' || notification.event.action === 'reply') {
        const commentableModel = loopback.getModel(event.target.commentable_type);
        const commentable = yield commentableModel.findById(event.target.commentable_id);
        return res.redirect(commentable.url);
      } else {
        return res.redirect(event.target.url);
      }
    }).catch(next);
  });
};
