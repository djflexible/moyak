//이미지로 문의하기
var pool = require('./dbConnection');//db연결
var urlencode = require('urlencode');
var querystring = require('querystring');

//사진 리퀘스트 관련 모듈,    fileUpload2.js  강의 참고
var http = require('http');
var formidable = require('formidable');
var util = require('util');

//aws부분
var fs = require('fs');
var pathUtil = require('path');
var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-1';

AWS.config.accessKeyId = 'AKIAIAWD7N6NWZVNU5UA';
AWS.config.secretAccessKey = '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'

	var uploadDir = "./upload";
	exports.addRequestImg = function(req, res){	//post 방식

		console.log('문의서 사진으로 생성');
		console.log('클라이언트 리퀘스트 : ', req.body);

		var form = new formidable.IncomingForm();
		form.encoding = 'utf-8';
		form.uploadDir = uploadDir;

		form.parse(req, function (err, fields, files) {
		         // 에러
		         if (err) {
		            console.log('에러 : ' + err);
		            res.statusCode = 404;
		            res.end();
		         }
		         else {
		            // 제목
		            console.log('files 출력 : ', files);
		            console.log('fields 출력 : ', fields);
		            //res.end('success');

		            console.log('리퀘스트 경도2: ', fields.longitude);

		          	////아마존 서버에 있는 것을 (upload) 아마존 S3에다가 올리기
		          	console.log(req.headers['content-type']);	//헤더 확인
		          	console.log('이미지 경로: ', files.imageCamera.path);

		          	var file = files.imageCamera.path;
		          	var readStream = fs.createReadStream(file);

		          	// 버킷 이름
		          	var bucketName = 'dongjoo';
		          	// 버킷 내 객체 키 생성
		          	var extname = pathUtil.extname(file); // 확장자
		          	var now = new Date(); // 날짜를 이용한 파일 이름 생성
		          	var itemKey = 'moyak/' + now.getHours() + now.getMinutes() + now.getSeconds() + Math.floor(Math.random()*1000) + extname+'.png';
		          	var contentType = 'image/jpg'; // TODO : 파일에 따라서 컨텐츠 타입 설정

		          	var params = {
		          	   Bucket: bucketName,  // 필수
		          	   Key: itemKey,			// 필수
		          	   ACL: 'public-read',
		          	   Body: readStream,
		          	   ContentType: contentType
		          	}
		          	// s3 - Upload
		          	var s3 = new AWS.S3();
		          	s3.putObject(params, function (err, data) {
		          	   if (err) {
		          	      console.error('S3 PutObject Error', err);
		          	      throw err;
		          	   }
		          	   // 접근 경로 - 2가지 방법
		          	   var imageUrl = s3.endpoint.href + bucketName + '/' + itemKey; // http, https
		          	   console.log('data값 : ', data);
		          	   console.log('Image Upload Success : ', imageUrl);
		          	   ////S3 올리기 종료
		          	   //imageUrl db저장 부분

		          	    //사진으로 문의하기 기본정보 저장
		          	    var patientId = fields.patientId;
		          	    var replace = fields.replace;
		          	    var quick = fields.quick;
		          	    var distance = fields.distance;
		          	    var format = fields.format;
		          	    var latitude = fields.latitude;
		          	    var longitude = fields.longitude;

		          	    pool.getConnection(function(err, conn){		//dbConnect
		          	    	console.log('로그1');
		          	    	console.log('Image Upload Success2 : ', imageUrl);
		          	    	console.log('로그1114');

		          	    	var requestdataImg = {
		          	    				'patientId': patientId,
		          	    				'replace' : replace,
		          	    				'quick' : quick,
		          	    				'distance' : distance,
		          	    				'format' : format,
		          	    				'latitude' : latitude,
		          	    				'longitude' : longitude,
		          	    				'requestPicture' : imageUrl
		          	    			};

		          	    	var query = 'INSERT INTO request SET ?';

		          	    	conn.query(query, requestdataImg, function(err, result){
		          	    			if(err){
		          	    					res.status(404).json({id:-1});
		          	    					res.end('INSERT FAIL1');
		          	    					return;
		          	    			}
		          	    			else {
		          	    				//res.status(200);
		          	    				res.status(200).end();
		          	    				console.log('INSERT SUCCESS1');
		          	    		}
		          	    		conn.release();
		          	    		});
		          	    	});//db종료
		          			});
		         			}//큰 else 종료
		      			});
							}