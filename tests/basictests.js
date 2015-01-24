var test = require('tape');
var quidprofollow = require('../quidprofollow');
var conformAsync = require('conform-async');

test('Basic test', function basicTest(t) {
  t.plan(19);

  var followCalls = 0;
  var unfollowCalls = 0;

  quidprofollow({
    twitterAPIKeys: {
      consumer_key: 'asdfkljqwerjasdfalpsdfjas',
      consumer_secret: 'asdfasdjfbkjqwhbefubvskjhfbgasdjfhgaksjdhfgaksdxvc',
      access_token: '9999999999-zxcvkljhpoiuqwerkjhmnb,mnzxcvasdklfhwer',
      access_token_secret: 'opoijkljsadfbzxcnvkmokwertlknfgmoskdfgossodrh'
    },
    twit: {
      get: function mockGet(path, getDone) {
        if (path == 'followers/ids') {
          return {
            ids: [1, 2, 3, 4, 5, 6, 7, 8]
          }
        }
        else if (path === 'friends/ids') {
          return {
            ids: [5, 6, 7, 8, 9, 10, 11, 12]
          }
        }
        conformAsync.callBackOnNextTick(getDone);
      },
      post: function mockPost(path, opts, postDone) {
        if (path === 'friendships/create') {
          var expectedFriendId = followCalls + 1;
          t.equal(opts.id, expectedFriendId);
          t.ok(opts.id < 5, 'Does not follow already followed users.');
          followCalls += 1;
        }
        else if (path === 'friendships/destroy') {
          var expectedFriendId = unfollowCalls + 9;
          t.equal(opts.id, expectedFriendId);
          t.ok(opts.id < 13, 'Does unfollow users not in the friends list.');
          unfollowCalls += 1;
        }
        conformAsync.callBackOnNextTick(postDone);
      }
    }
  },
  function done(error, followed, unfollowed) {
    t.ok(!error, 'It completes withouth an error');
    t.deepEqual(followed, [1, 2, 3, 4], 'It reports userIds it followed.');
    t.deepEqual(unfollowed, [9, 10, 11, 12], 'It reports userIds unfollowed.');
  });
});
