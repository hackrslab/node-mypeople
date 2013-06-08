var util = require('util');
var Client = require('./client');

var Receiver = module.exports = function(key, opts) {
  opts = opts || {};
  this.opts = {
    key: key || opts.key,
    server: opts.server || 'https://apis.daum.net'
  };
  this.client = new Client(this.opts.key, {server: this.opts.server});
  process.EventEmitter.call(this);
}
util.inherits(Receiver, process.EventEmitter);

Receiver.prototype.start = function() {
  this.groups = {};
  var express = require('express');
  app = express();
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.post('/mypeople/callback', this.receiver.bind(this));
  app.listen(process.env.MYPEOPLE_CALLBACK_PORT || 3000);
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
  var self = this;
  if (this.groups[id]) {
    return this.groups[id];
  }

  this.groups[id] = new Group();
  return this.groups[id];
};

function Group() {
  this.id = id;
};

Group.prototype.sendMessage = function(groupId, message) {
  self.client.sendGroupMessage(groupId, message, null, function() {
    // TODO: handling
  });
};
