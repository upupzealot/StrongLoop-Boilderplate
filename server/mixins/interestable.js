'use strict';

module.exports = (Model, options) => {
  const Interest = require('./models/interest.js');

  const interest = function*(userId) {
    const interest = yield Interest.findOrCreate({
      created_by: userId,
      interestable_type: Model.modelName,
      interestable_id: this.id,
    });
    if (interest.is_canceled) {
      yield interest.updateAttribute('is_canceled', false);
    }
  };

  const uninterest = function*(userId) {
    const interest = yield Interest.findOne({
      created_by: userId,
      interestable_type: Model.modelName,
      interestable_id: this.id,
    });

    if (!interest.is_canceled) {
      yield interest.updateAttribute('is_canceled', true);
    }
  };

  const isInterested = function*(userId) {
    const count = yield Interest.count({
      created_by: userId,
      interestable_type: Model.modelName,
      interestable_id: this.id,
      is_canceled: false,
    });
    return count !== 0;
  };

  if (Model.modelName === 'user') {
    Model.prototype.follow = interest;
    Model.prototype.unfollow = uninterest;
    Model.prototype.following = isInterested;
  } else {
    Model.prototype.like = interest;
    Model.prototype.unlike = uninterest;
    Model.prototype.liking = isInterested;
  }
};
