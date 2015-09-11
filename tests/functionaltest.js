var test = require('tape');
var quidprofollow = require('../index');
var callNextTick = require('call-next-tick');
var twitterjerkdetector = require('twitterjerkdetector');

var config = require('../config').twitter;
var Twit = require('twit');
var twit = new Twit(config);

var filterJerkAccounts = twitterjerkdetector.createFilter({
  twit: twit
});

// The results of this test vary, depending on the followers and followees of 
// of the config's account at the moment. So, run it and watch the console 
// output.

test('Run it without actually following/unfollowing', function run(t) {
  t.plan(3);

  quidprofollow({
    twitterAPIKeys: config,
    twit: {
      get: twit.get.bind(twit),
      post: function mockPost(path, opts, postDone) {
        if (path === 'friendships/create') {
          console.log('Would have followed:', opts);
        }
        else if (path === 'friendships/destroy') {
          console.log('Would have unfollowed:', opts);
        }
        callNextTick(postDone);
      }
    },
    followFilter: filterJerkAccounts
  },
  function done(error, followed, unfollowed) {
    t.ok(!error, 'It completes without an error');
    t.ok(Array.isArray(followed), 'It reports userIds it followed.');
    t.ok(Array.isArray(unfollowed), 'It reports userIds unfollowed.');
  });
});
