var Twit = require('twit');
var _ = require('lodash');
var queue = require('queue-async');
var callNextTick = require('call-next-tick');

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
      callNextTick(done, new Error('No Twitter config provided.'));
      return;
    }
  }

  var q = queue();

  q.defer(twit.get.bind(twit), 'followers/ids');
  q.defer(twit.get.bind(twit), 'friends/ids');

  q.await(adjustFollowers);

  function adjustFollowers(error, followerResponse, friendResponse) {
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

      var q = queue();

      if (opts.followFilter) {
        // opts.followFilter(usersToFollow, followFilterDone);
        q.defer(opts.followFilter, usersToFollow);
      }

      if (opts.retainFilter) {
        q.defer(opts.retainFilter, usersToUnfollow);
      }

      q.await(runAdjustment);
    }

    function runAdjustment(error, list1, list2) {
      if (error) {
        // An error may have occured because a followFilter hit the
        // users/profile rate limit. It is not reason to not carry through
        // with the lists we did get.
        console.log(error, error.stack);
      }

      var followFilterResults = [];
      var usersToRetain = [];

      if (opts.followFilter) {
        followFilterResults = list1;
        usersToFollow = followFilterResults.coolguys;

        if (opts.retainFilter) {
          usersToRetain = list2;
        }
      }
      else if (opts.retainFilter) {
        usersToRetain = list1;
      }

      usersToUnfollow = removeArrayFromOtherArray(
        usersToRetain, usersToUnfollow
      );
      
      adjustFollowerList(
        {
          twitPost: safeTwitPost,
          usersToFollow: usersToFollow,
          usersToUnfollow: usersToUnfollow,
          usersFilteredOut: followFilterResults.jerks
        },
        done
      );
    }
  }
}

function removeArrayFromOtherArray(array, otherArray) {
  return _.without.apply(_.without, [otherArray].concat(array));
}

function adjustFollowerList(opts, done) {
  var twitPost;
  var usersToFollow;
  var usersToUnfollow;
  var usersFilteredOut;

  if (opts) {
    twitPost = opts.twitPost;
    usersToFollow = opts.usersToFollow;
    usersToUnfollow = opts.usersToUnfollow;
    usersFilteredOut = opts.usersFilteredOut;
  }

  var q = queue();

  q.defer(postUsers, twitPost, 'friendships/create', usersToFollow);
  q.defer(postUsers, twitPost, 'friendships/destroy', usersToUnfollow);

  q.awaitAll(function reportResults(error, followResponse, unfollowResponse) {
    if (error) {
      done(error);
    }
    else {
      done(null, usersToFollow, usersToUnfollow, usersFilteredOut);
    }
  });
}

function postUsers(twitPost, path, userIds, done) {
  if (!userIds) {
    callNextTick(done);
    return;
  }
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
