'use strict';

const co = require('co');
const loopback = require('loopback');
const Comment = loopback.getModel('Comment');
const Role = loopback.getModel('Role');

Role.registerResolver('commentDeletor', (role, context, callback) => {
  co(function* () {
    if (context.modelName !== 'Comment') {
      return process.nextTick(() => callback(null, false));
    }

    const userId = context.accessToken.userId;
    if (!userId) {
      return process.nextTick(() => callback(null, false));
    }

    const comment = yield Comment.findById(context.modelId);
    if (!comment) {
      return callback(null, false);
    }

    if (comment.created_by === userId) {
      return callback(null, true);
    }

    if (comment.commentable_id) {
      const commentable = yield comment.commentable.getAsync();
      if (commentable.created_by === userId) {
        return callback(null, true);
      }
    }

    if (comment.parent_id) {
      const parent = yield comment.parent.getAsync();
      if (parent.created_by === userId) {
        return callback(null, true);
      }
    }

    return callback(false);
  }).catch(callback);
});
