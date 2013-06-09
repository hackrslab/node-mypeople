var util = require('util');
var Client = require('./client');

var Receiver = module.exports = function(key, opts) {
  opts = opts || {};
  this.groups = {};
  this.opts = {
    key: key || opts.key,
    server: opts.server || 'https://apis.daum.net',
    callbackPath: opts.callbackPath || '/mypeople/callback',
    callbackPort: opts.callbackPort || process.env.MYPEOPLE_CALLBACK_PORT || 3000
  };
  this.client = new Client(this.opts.key, {server: this.opts.server});
  process.EventEmitter.call(this);
}
util.inherits(Receiver, process.EventEmitter);

Receiver.prototype.start = function() {
  var express = require('express');
  app = express();
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.post(this.opts.callbackPath, this.receiver.bind(this));
  app.listen(this.opts.callbackPort || 3000);
};

Receiver.prototype.receiver = function(req, res, options) {
  var body = eval(req.body);
  if (body.action == 'sendFromMessage' || body.action == 'sendFromGroup') {
    this.emit('message', {
      message: body.content,
      friend: {
        id: body.buddyId
      },
      group: {
        id: body.groupId
      }
    });
  }
};

Receiver.prototype.sendMessage = function(friendId, message) {
  this.client.sendMessage(friendId, message, null, function() {
    // TODO: handling
  });
};

Receiver.prototype.group = function(id) {
  if (this.groups[id]) {
    return this.groups[id];
  }

  this.groups[id] = new Group(id, this.client);
  return this.groups[id];
};

function Group(id, client) {
  this.id = id;
  this.client = client;
};

Group.prototype.sendMessage = function(groupId, message) {
  this.client.sendGroupMessage(groupId, message, null, function() {
    // TODO: handling
  });
};
