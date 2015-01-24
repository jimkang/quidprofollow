var test = require('tape');
var quidprofollow = require('../index');
var conformAsync = require('conform-async');
var config = require('../config').twitter;
var Twit = require('twit');
var twit = new Twit(config);

// The results of this test vary, depending on the followers and followees of 
// of the config's account at the moment. So, run it and watch the console 
// output.

test('Run it without actually following/unfollowing', function run(t) {
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
        conformAsync.callBackOnNextTick(postDone);
      }
    }
  },
  function done(error, followed, unfollowed) {
    t.ok(!error, 'It completes without an error');
    t.ok(Array.isArray(followed), 'It reports userIds it followed.');
    t.ok(Array.isArray(unfollowed), 'It reports userIds unfollowed.');
  });
});
