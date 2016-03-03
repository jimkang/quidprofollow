var sb = require('standard-bail')();
var callNextTick = require('call-next-tick');

function getCursoredResource(opts, done) {
  var twit;
  var path;
  var responseValueKey;

  if (opts) {
    twit = opts.twit;
    path = opts.path;
    responseValueKey = opts.responseValueKey;
  }

  var values = [];
  getNextFollowers('-1');

  function getNextFollowers(cursor) {
    var apiOpts = {
      cursor: cursor
    }
    twit.get(path, apiOpts, sb(accumulateFromResponse));
  }

  function accumulateFromResponse(response) {
    values = values.concat(response[responseValueKey]);
    if (response.next_cursor_str && +response.next_cursor_str > 0) {
      callNextTick(getNextFollowers, response.next_cursor_str);
    }
    else {
      callNextTick(done, null, values);
    }
  }
}

module.exports = getCursoredResource;
