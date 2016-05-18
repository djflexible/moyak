//GCM 관련
var gcm = require('node-gcm');	//GCM 서비스
var sender = new gcm.Sender('***');	// Server API Key
var devices = [];	// 디바이스 등록 배열

//일단 1개 디바이스만

var regIds = ['***']; //내 서버키
var regIds2 = ['***'];	//예훈이꺼
var regIds3 = ['***'];	//새로받은 서버

exports.showDeviceList = function(req, res){
}
exports.registerDevice = function(req, res){
}
exports.sendResponseGCM = function(req, res){

	var string = '응답서가 도착하였습니다';
	var message = new gcm.Message({	//약사, 약국
	   collapseKey: 'demo',
	   notification:{
	      		title:'MOYAK 알림',
	      		body:string,
	       		icon:'ic_launcher'
	    	}
	})
/*
var message = new gcm.Message({	//약사, 약국
   collapseKey: 'demo',
   message.addData('title', 'MOYAK 알림'),
   message.addData('message', '응답서가 도착하였습니다')
})
*/

/*
var message = new gcm.Message();
message.addData('title', 'MOYAK 알림');//데이터로만 해야함
message.addData('message', '응답서가 도착하였습니다');
*/
	sender.send(message, regIds3, function(err, result) {	//서버에서 메세지 보냄
	  if (err) {
	    console.error('Error : ' + err);
	    console.log('result 값 : ', result)
	    //res.status(404).json({id:-1});
	    res.status(404).end();
	  }
	  else {
	  	console.log('GCM 메세지 전송 성공');
	    console.log('regIds 값 : ', result);
	    console.log('regIds3 값 : ', regIds3);
	    //console.log('message 값 : ', message);
	    //res.status(200).json(message);
	  }
	});
}
