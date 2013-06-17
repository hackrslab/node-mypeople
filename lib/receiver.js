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
  if (body === null || body.action === null) {
    this.emit('error', {
      'message': 'request is wrong'
    });
    return;
  }
  this.emit(body.action, body);

  switch (body.action) {
  case 'sendFromMessage':
  case 'sendFromGroup':
    this.emit('message', newMessage(body, ['message', body.content]));
    break;
  case 'createGroup':
  case 'inviteToGroup':
    var content = typeof(body.content) == 'string' ? JSON.parse(body.content) : body.content;
    content = Array.isArray(content) ? content : [];
    this.emit('new invite', newMessage(body, ['group', {
      id: body.groupId,
      members: content.map(newFriend)
    }]));
    break;
  case 'exitFromGroup':
    this.emit('left user', newMessage(body));
    break;
  case 'helpFromMessage':
  case 'helpFromGroup':
    this.emit('need help', newMessage(body));
    break;
  case 'exitBot':
    this.emit('kick', newMessage(body));
    break;
  case 'addBuddy':
    var user = newFriend(body.content || {});
    this.emit('new friend', {
      friend: user,
      user: user
    });
    this.emit('addBuddy@0.2.1', {
      message: body.content,
      friend: {
        id: body.buddyId
      },
      group: {
        id: body.groupId
      }
    });
    break;
  }
};

Receiver.prototype.execute = function(fn) {
  if (typeof(fn) == 'function') {
    fn(this.client);
  }
};

Receiver.prototype.sendMessage = function(userId, message, fn) {
  this.client.sendMessage(userId, message, function(error, message, originalMessage) {
    if (typeof(fn) == 'function') {
      fn(error, message, originalMessage);
    }
  });
};

Receiver.prototype.group = function(id) {
  if (this.groups[id]) {
    return this.groups[id];
  }

  this.groups[id] = new Group(id, this.client);
  return this.groups[id];
};

function newMessage(body) {
  var message = {
    // deprecated. please use "user" instead.
    friend: {
      id: body.buddyId
    },
    user: {
      id: body.buddyId
    },
    group: {
      id: body.groupId
    }
  };
  Array.prototype.slice.call(arguments, 1).forEach(function(v) {
    message[v[0]] = v[1];
  });
  return message;
}

function newFriend(content) {
  return {
    id: content.buddyId,
    name: content.name,
    photoId: content.photoId,
    isBot: content.isBot == 'Y' || content.isBot == 'true' || content.isBot === true
  };
}

function Group(id, client) {
  this.id = id;
  this.client = client;
};

Group.prototype.sendMessage = function(groupId, message, fn) {
  this.client.sendGroupMessage(groupId, message, function(error, message, originalMessage) {
    if (typeof(fn) == 'function') {
      fn(error, message, originalMessage);
    }
  });
};
