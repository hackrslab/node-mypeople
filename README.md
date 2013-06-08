# MyPeople Node API

MyPeople API 다시 만들었습니다. 물론 DAUM에서 제공한 코드 중 일부는 복사했습니다. (https://github.com/daumdna/apis/tree/master/Samples/8.Mypeople/BotAPI/Node.js/mypeople)

* hubot 을 만들기위해서 급하게 만든 프로젝트입니다. 물론 대충 만들어서 테스트코드나 코드는 엉망이예요. :-)

## Install

```shell
$ npm install mypeople
```

## Usage

다운로드 기능은 제가 사용하질 않아서 테스트는 하지 않았습니다. 전 sendMessage, sendGroupMessage 밖에 안써서요.

```javascript
var Client = require('mypeople').Client;
var client = new Client('KEY');
// or
var client = new Client('KEY', {server: 'https://api.daum.net'});

client.sendMessage(buddyId, content, attach, callback);
client.sendGroupMessage(groupId, content, attach, callback);
client.getFriendInfo(buddyId, callback);
client.getGroupMembers(groupId, callback);
client.exitGroup(groupId, callback);
client.download(fileId, filename);
```

```javascript
var Receiver = require('mypeople').Receiver;
var receiver = new Receiver('KEY');
receiver.addListener('message', function(m) {
  console.log(m);
});
receiver.start();
```

코드 컨트리뷰션은 언제든 환영합니다.

