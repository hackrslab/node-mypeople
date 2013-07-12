var fs = require('fs');
var request = require('request');
var headers = {
  'User-Agent': 'github.com:dgkim84/node-mypeople',
  'X-Node-MyPeople': '0.3.3'
};

/**
 * DAUM MyPeople Client
 */
var Client = module.exports = function(key, options) {
  var options = options || {};
  var server = options.server || 'https://apis.daum.net';

  if (typeof(key) == 'string' && key !== '') {
    console.log('MyPeople - server: ' + server + ', key: ' + key);
  } else {
    throw new Error('api key must be not null.');
  }

  this.APIs = {
    FRIEND_INFO: server + '/mypeople/profile/buddy.json?apikey=' + key,
    SEND_MESSAGE: server + '/mypeople/buddy/send.json?apikey=' + key,
    GROUP_MESSAGE: server + '/mypeople/group/send.json?apikey=' + key,
    GROUP_MEMBERS: server + '/mypeople/group/members.json?apikey=' + key,
    EXIT_GROUP: server + '/mypeople/group/exit.json?apikey=' + key,
    DOWNLOAD: server + '/mypeople/file/download.json?apikey=' + key
  };
};

/**
 * http://dna.daum.net/apis/mypeople/ref#send1on1message
 */
Client.prototype.sendMessage = function(buddyId, content, callback) {
  var r = request.post({
    uri: this.APIs.SEND_MESSAGE,
    headers: headers
  }, responseHandler(callback));

  var form = r.form();
  form.append('buddyId', buddyId);

  if (content != null && content.readable) {
    form.append('attach', content, {filename: 'attachment.jpg', contentType: 'image/jpg'});
  } else {
    form.append('content', encodeURIComponent(content));
  }
};

/**
 * http://dna.daum.net/apis/mypeople/ref#getfriendsinfo
 */
Client.prototype.getFriendInfo = function(buddyId, callback) {
  request.get({
    uri: this.APIs.FRIEND_INFO + '&buddyId=' + buddyId,
    headers: headers
  }, profileResponseHandler(callback, true));
};

/**
 * http://dna.daum.net/apis/mypeople/ref#groupuserlist
 */
Client.prototype.getGroupMembers = function(groupId, callback) {
  request.get({
    uri: this.APIs.GROUP_MEMBERS + '&groupId=' + groupId,
    headers: headers
  }, profileResponseHandler(callback, false));
};

/**
 * http://dna.daum.net/apis/mypeople/ref#sendgroupmessage
 */
Client.prototype.sendGroupMessage = function(groupId, content, callback) {
  var r = request.post({
    uri: this.APIs.GROUP_MESSAGE,
    headers: headers
  }, responseHandler(callback));

  var form = r.form();
  form.append('groupId', groupId);

  if (content != null && content.readable) {
    form.append('attach', content, {filename: 'attachment.jpg', contentType: 'image/jpg'});
  } else {
    form.append('content', encodeURIComponent(content));
  }
};

/**
 * http://dna.daum.net/apis/mypeople/ref#leavegroup
 */
Client.prototype.exitGroup = function(groupId, callback) {
  request.get({
    uri: this.APIs.EXIT_GROUP + '&groupId=' + groupId,
    headers: headers
  }, responseHandler(callback));
};

/**
 * http://dna.daum.net/apis/mypeople/ref#filedownload
 */
Client.prototype.download = function(fileId, callback) {
  return new Result(request.get({uri: this.APIs.DOWNLOAD + '&fileId=' + fileId, headers: headers}, callback));
};

/**
 * 이름은 대충...
 */
function Result(req) {
  this.req = req;
}

Result.prototype.pipe = function(writer) {
  this.req.pipe(writer);
};

function responseHandler(callback) {
  if (typeof(callback) != 'function') {
    return;
  }
  return function(error, resp, data) {
    if (error) {
      callback(error, null, data);
    } else {
      var result;
      try {
        result = JSON.parse(data);
      } catch (e) {
        callback(new Error('API Server Error - response is not JSON literal.', e), null, data);
        return;
      }
      if (parseInt(result.code, 10) == 200) {
        callback(null, result, data);
      } else {
        callback(new Error('API Server Error - unexpected result code (' + result.code + ' ' +
          resp.request.uri.href + ')'), null, data);
      }
    }
  };
};

function profileResponseHandler(callback, singleRow) {
  if (typeof(callback) != 'function') {
    return;
  }
  return function(error, resp, data) {
    if (error) {
      callback(error, null, data);
    } else {
      var result;
      try {
        result = JSON.parse(data);
      } catch (e) {
        callback(new Error('API Server Error - response is not JSON literal.', e), null, data);
        return;
      }

      if (parseInt(result.code, 10) == 200) {
        if (result.buddys && result.buddys.length > 0 && result.buddys[0] === null) {
          callback(new Error('API Server Error - response is wrong.'), null, data);
        } else {
          if (singleRow === true) {
            if (result.buddys && result.buddys.length == 1 && result.buddys[0] !== null) {
              callback(null, result.buddys[0], data);
            } else {
              callback(new Error('User not found'), null, data);
            }
          } else {
            callback(null, result.buddys, data);
          }
        }
      } else {
        callback(new Error('API Server Error - unexpected result code (' + result.code + ' ' +
          resp.request.uri.href + ')'), null, data);
      }
    } // if else
  };
};

