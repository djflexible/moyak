//GCM 관련
var gcm = require('node-gcm');	//GCM 서비스
var sender = new gcm.Sender(***');	// Server API Key
var devices = [];	// 디바이스 등록 배열

//일단 1개 디바이스만

var regIds = ['c2c4dea1fe8736ea	Android	eYOEpvQ38E4:APA91bGAcIDSx_HbRulpP21Qi9LFIorL_T9ZyRC7yV8sDIg42bL7q68emKzUoXbGlZpJNHiY5iAURXokZKPIL8qP4znCjtmnTUwazRD0eIeH5oUDCJLfqOJtI82CN3DVKxFmXosgwiLy']; //내 서버키

var regIds2 = ['eQH93welfh0:APA91bFDAKUSXiEuYM6-PUw377BuuwpnmVP31Tjeq1184bqHskX7bo2ySXAQ3uB4U1H2V3fJ3NhMs18lIx4O91E_EwICPPjOHKy5eneoRN_e2MAUElY-BmjXtepfyttRgC3QnLA27Td9'];	//예훈이꺼

var regIds3 = ['fBZTLISFLxw:APA91bFdHUb09gr9ShcSXRKZMmGTIkl93ufvMPwgR530Kzz3eMFmpfj9OMnIcAAiXNLiW3gIPOT91JtEl_PINHftRlryTl96bLTTZ7uqNJ2hYvnvu_wrgzFNvKjMRH1eTGyArXR9eevD'];	//새로받은 서버


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
