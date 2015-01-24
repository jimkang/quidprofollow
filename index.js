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

      var followersNotCurrentlyFollowed = 
        _.without.apply(_, [followers].concat(friends));

      var followeesCurrentNotFollowingMe = 
        _.without.apply(_, [friends].concat(followers));

      var followUnfollowQueue = queue();
      safeTwitPost = twit.post.bind(twit);

      followersNotCurrentlyFollowed.forEach(function queueFollow(userId) {
        followUnfollowQueue.defer(
          safeTwitPost, 'friendships/create', {id: userId}
        );
      });

      followeesCurrentNotFollowingMe.forEach(function queueUnfollow(userId) {
        followUnfollowQueue.defer(
          safeTwitPost, 'friendships/destroy', {id: userId}
        );
      });

      followUnfollowQueue.awaitAll(function reportResults(error) {
        if (error) {
          done(error);
        }
        else {
          done(
            null, followersNotCurrentlyFollowed, followeesCurrentNotFollowingMe
          );
        }
      });
    }
  });
}

module.exports = quidprofollow;
