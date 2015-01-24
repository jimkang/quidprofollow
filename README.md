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

Tests
-----

Run tests with `make test`.

License
-------

MIT.
