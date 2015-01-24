quidprofollow
==================

Makes a Twitter bot's (or human user's) follower and followee lists match by following and unfollowing to make it happen.

Installation
------------

    npm install quidprofollow

Usage
-----

    var quidprofollow = require('quidprofollow');
    
    quidprofollow(
      {
        twitterAPIKeys: {
          consumer_key: 'asdfkljqwerjasdfalpsdfjas',
          consumer_secret: 'asdfasdjfbkjqwhbefubvskjhfbgasdjfhgaksjdhfgaksdxvc',
          access_token: '9999999999-zxcvkljhpoiuqwerkjhmnb,mnzxcvasdklfhwer',
          access_token_secret: 'opoijkljsadfbzxcnvkmokwertlknfgmoskdfgossodrh'
        }
      },
      function done(error, followed, unfollowed) {
        console.log('Followed:', followed);
        console.log('Unfollowed:', unfollowed);
      }
    );

Output:

    Followed: [807322189, 17400671, 2911212198]
    Unfollowed: [74496732, 1000904942]

You can also pass a `followFilter` in the opts, which should be a function that takes userIds and calls back with the ids that it is OK to follow.

    quidprofollow(
      {
        twitterAPIKeys: config,
        followFilter: function filterUserIdsHigherThan100Million(userIds, done) {
          var okIds = userIds.filter(function isOver100Million(userId) {
            return userId > 100000000;
          });
          conformAsync.callBackOnNextTick(done, null, okIds);          
        },
        function done(error, followed, unfollowed) {
          console.log('Followed:', followed);
          console.log('Unfollowed:', unfollowed);
        }
    );

Tests
-----

Run tests with `make test`.

Run functional test by creating a `config.js` (be careful not to check that in anywhere) in the root directory that looks like this:

    module.exports = {
      twitter: {
        consumer_key: 'asdfkljqwerjasdfalpsdfjas',
        consumer_secret: 'asdfasdjfbkjqwhbefubvskjhfbgasdjfhgaksjdhfgaksdxvc',
        access_token: '9999999999-zxcvkljhpoiuqwerkjhmnb,mnzxcvasdklfhwer',
        access_token_secret: 'opoijkljsadfbzxcnvkmokwertlknfgmoskdfgossodrh'
      }
    };

Then run, `make test-functional`. In this test, you cannot rely on the assertions to make sure things are working because result depend on the followers and followees of the account at the time you run the test. So, check the console output and make sure it's reasonable. It should looks something like:

    Would have followed: { id: 319086998 }
    Would have followed: { id: 607793 }
    Would have followed: { id: 903200748 }
    Would have followed: { id: 114240739 }
    Would have followed: { id: 372519518 }
    Would have followed: { id: 24047669 }
    Would have followed: { id: 37587142 }
    Would have followed: { id: 2292747043 }
    Would have followed: { id: 2509547241 }
    Would have followed: { id: 287422826 }
    Would have unfollowed: { id: 14375294 }

License
-------

MIT.
