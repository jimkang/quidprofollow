var Twit = require('twit');
var _ = require('lodash');
var queue = require('queue-async');
var conformAsync = require('conform-async');

function quidprofollow(opts, done) {
  var twit;

  if (opts.twit) {
    twit = opts.twit;
  }
  else {
    if (opts.twitterAPIKeys) {
      var twit = new Twit(opts.twitterAPIKeys);
    }
    else {      
      conformAsync.callBackOnNextTick(
        done, new Error('No Twitter config provided.')
      );
      return;
    }
  }

  var q = queue();

  q.defer(twit.get.bind(twit), 'followers/ids');
  q.defer(twit.get.bind(twit), 'friends/ids');

  q.await(function adjustFollowers(error, followerResponse, friendResponse) {
    if (error) {
      done(error);
    }
    else {
      var followers = followerResponse.ids;
      var friends = friendResponse.ids;

      // Followers not followed by the user.
      var usersToFollow = _.without.apply(_, [followers].concat(friends));
      // Followees not following the user.
      var usersToUnfollow = _.without.apply(_, [friends].concat(followers));

      safeTwitPost = twit.post.bind(twit);

      if (opts.followFilter) {
        opts.followFilter(
          usersToFollow, 
          function filterDone(error, okIds) {
            if (error) {
              done(error);
            }
            else {
              adjustFollowerList(safeTwitPost, okIds, usersToUnfollow, done);
            }
          }
        );
      }
      else {
        adjustFollowerList(safeTwitPost, usersToFollow, usersToUnfollow, done);        
      }
    }
  });
}

function adjustFollowerList(twitPost, usersToFollow, usersToUnfollow, done) {
  var q = queue();

  q.defer(postUsers, twitPost, 'friendships/create', usersToFollow);
  q.defer(postUsers, twitPost, 'friendships/destroy', usersToUnfollow);

  q.awaitAll(function reportResults(error, followResponse, unfollowResponse) {
    if (error) {
      done(error);
    }
    else {
      done(null, usersToFollow, usersToUnfollow);
    }
  });
}

function postUsers(twitPost, path, userIds, done) {
  var q = queue();
  userIds.forEach(function queueFollow(userId) {
    q.defer(wrapTwitPost, twitPost, path, {id: userId});
  });
  q.awaitAll(done);
}

function wrapTwitPost(twitPost, path, opts, done) {
  twitPost(path, opts, function twitPostDone(error, response) {
    // 403 (already following the user) can be ignored.
    if (error && (!error.statusCode || error.statusCode !== 403)) {
      done(error, response);
    }
    else {
      done(null, response);
    }
  });
}

module.exports = quidprofollow;
