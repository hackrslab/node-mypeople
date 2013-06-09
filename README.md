# MyPeople Node API

MyPeople API 다시 만들었습니다. 물론 DAUM에서 제공한 코드 중 일부는 복사했습니다. (https://github.com/daumdna/apis/tree/master/Samples/8.Mypeople/BotAPI/Node.js/mypeople)

* hubot 을 만들기위해서 급하게 만든 프로젝트입니다.
* http://HOST/mypeople/callback 으로 콜백 등록하세요. :-)
* 다음 마이피플 서버에서 콜백전송을 못하는 경우가 많습니다.

[Hubot MyPeople Adapter](https://github.com/dgkim84/hubot-mypeople)

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

client.sendMessage(buddyId, content, callback);
client.sendGroupMessage(groupId, content, callback);
client.getFriendInfo(buddyId, callback);
client.getGroupMembers(groupId, callback);
client.exitGroup(groupId, callback);
client.download(fileId, filename);

# stream readable 객체면 첨부파일로 보냅니다. 해보니까 첨부파일은 메세지와 함께 전송은 안되는 것 같습니다. 그래서 변수는 하나만 받아요. 그룹 전송도 동일.
client.sendMessage(buddyId, fstream.Reader("path/to/dir"))
# or
client.sendMessage(buddyId, request('xxx'))
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

