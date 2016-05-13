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
//
AWS.config.accessKeyId = '***';
AWS.config.secretAccessKey = '***'

	var uploadDir = "./upload";

exports.addChat = function(req, res){	//post 방식
			console.log('대화 내용 추가 0:text, 1:이미지');

			//moyak에서 post는 새로운 환자 정보 추가
			var pharmacistId = req.body.pharmacistId;
			var patientId = req.body.patientId;
			var type = req.body.type;
			var format= req.body.format;
			var message = req.body.message;
			var created = req.body.created;
			var id = 99;
			//var format = 1;
			console.log('pharmacistId 값 : ', pharmacistId);
			console.log('req.body 값1 : ', req.body);

		if(format == 0)	//채팅 메시지 보내기
			{
				console.log('format 확인1 : ', format);
				console.log(req.headers['content-type']);	//헤더 확인

				pool.getConnection(function(err, conn){		//dbConnect

					var query = 'INSERT INTO chat SET ?';
					var sql = 'DELETE FROM chat WHERE id = ?';

					var chatData = {
								'pharmacistId': pharmacistId,
								'patientId' : patientId,
								'type' : type,
								'format' : format,
								'message' : message,
								'created' : created
							};

				console.log('채팅 데이터 받은 정보 : ', req.body);
				console.log('format 확인1 : ', format);
				console.log('상담내용 정보 텍스트 : ', chatData);	//환자 정보
				conn.query(query, chatData, function(err, result){

						if(err){
								res.writeHead(404);
								//res.statusCode = 404;
								res.end('INSERT FAIL');
						}
						else{
								res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
								res.end(JSON.stringify(chatData));//리턴 값으로 사진이면 0 메세지면 1
								console.log('채팅 메세지 추가 성공 번호 : ', result.insertId);

								id = result.insertId;

								///채팅 추가후 다시 삭제
								console.log('채팅 삭제 부분1', id);
								conn.query(sql, [id], function(err, rows){

									console.log('채팅 삭제 부분2', id);
									console.log('sql문 : ', sql);

										if (err) {	//삭제할 데이터가 없다면 에러처리 어떻게?
											res.writeHead(404);
											res.end('채팅 삭제 실패');	//클라이언트에게 갈 메세지
										}
											else {
									    res.statusCode = 200;
									    res.end('채팅 삭제 성공 : ', id);
										}
									});
								}
							conn.release();
						});
///////////////
					});//db연결 종료
				}//if 종료

				else if(format != 0)	//채팅 이미지 보내기, fortmat이 1일 경우를 읽어오지 못하고 있음
				{
					format = 1;
					var id = 99;

					console.log('format 확인2 : ', format);
					console.log('req.body 값2 : ', req.body);
					console.log(req.headers['content-type']);	//헤더 확인
					//console.log('상담내용 정보 이미지 : ', chatData);	//환자 정보
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
					          	////아마존 서버에 있는 것을 (upload) 아마존 S3에다가 올리기
					          	console.log('이미지 경로: ', files.message.path);

					          	var file = files.message.path;
					          	var readStream = fs.createReadStream(file);
					          	// 버킷 이름
					          	var bucketName = '***';
					          	// 버킷 내 객체 키 생성
					          	var extname = pathUtil.extname(file); // 확장자
					          	var now = new Date(); // 날짜를 이용한 파일 이름 생성
					          	var itemKey = '***/' + now.getHours() + now.getMinutes() + now.getSeconds() + Math.floor(Math.random()*1000) + extname+'.png';
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
							          var pharmacistId = fields.pharmacistId;
							          var patientId = fields.patientId;
							          var type = fields.type;
							          var format= fields.format;
							          var created = fields.created;

							          console.log('fields값 2 : ', fields);
							          console.log('pharmacistId 값 2 : ', pharmacistId);

					          	    pool.getConnection(function(err, conn){		//dbConnect

					          	    	var sql = 'DELETE FROM chat WHERE id = ?';
					          	    	var query = 'INSERT INTO chat SET ?';

					          	    	console.log('로그1');
					          	    	console.log('Image Upload Success2 : ', imageUrl);
					          	    	console.log('로그1114');
					          	    	console.log('fields값 3 : ', fields);

			          	    			var chatData = {
			          	    						'patientId' : patientId,
			          	    						'pharmacistId': pharmacistId,
			          	    						'type' : type,
			          	    						'format' : format,
			          	    						'message' : imageUrl,
			          	    						'created' : created
			          	    					};

			          	    			console.log('chatData 값 : ', chatData);
			          	    			console.log('query 값 : ', query);
					          	    	conn.query(query, chatData, function(err, result){

					          	    			if(err){
					          	    					console.log('pharmacistId 값 3 : ', pharmacistId);
					          	    					console.log('err 내용 : ', err);
					          	    					res.status(404).json({id:-1});
					          	    					res.end('INSERT FAIL');
					          	    					return;
					          	    			}
					          	    			else {
					          	    				res.status(200).json({message : imageUrl});//로그인 성공 반환값
					          	    				res.end();
					          	    				//res.status(200).end();
					          	    				console.log('INSERT SUCCESS1');
					          	    				id = result.insertId;

					          	    				///채팅 추가후 다시 삭제
					          	    				console.log('채팅 삭제 부분1', id);
					          	    				conn.query(sql, [id], function(err, rows){

					          	    					console.log('채팅 삭제 부분2', id);
					          	    					console.log('sql문 : ', sql);

					          	    						if (err) {	//삭제할 데이터가 없다면 에러처리 어떻게?
					          	    							res.writeHead(404);
					          	    							res.end('채팅 삭제 실패');	//클라이언트에게 갈 메세지
					          	    						}
					          	    							else {
					          	    					    res.statusCode = 200;
					          	    					    res.end('채팅 삭제 성공 : ', id);
					          	    						}
					          	    					});
					          	    				}
					          	    			conn.release();
					          	    		});
					          	    	});//db종료
													});
					         }//큰 else 종료
					      });
				}//else if 종료
}
//채팅 메시지 추가 종료

////////채팅 리스트 보기
	exports.showChatList = function(req, res){

			console.log('채팅리스트');
			var url = req.url;
			console.log('show url : '+url);

			var patientId = url.split('=')[1];	// =로 나눈 것의 2번째 것을 가져옴
			patientId = urlencode.decode(patientId);
			console.log('patientId 값 : '+ patientId);

			pool.getConnection(function(err, conn){
					var sql = 'SELECT pharmacistId, type, format, created, message FROM chat WHERE patientId = ?';

					conn.query(sql, [patientId], function(err, rows){
						//TODO 에러처리
						var chatListData = rows[0];
						console.log('대화 목록 :', chatListData);	//환자 정보

								if (chatListData == undefined) {
											//res.writeHead(404);
											res.status(404).json({patientId:-1});
											console.log('err 보기',err);
									  	 console.log('채팅 리스트 보기 실패');
									    res.end('SHOW FAIL');
										}
									else {
									    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
									    res.end(JSON.stringify(rows));
									    console.log('SHOW SUCCESS', rows);
									}
									conn.release();
									});
							});
					}

/////문의서 보기 종료
//대화 내용 지우기

exports.deleteChat = function(req, res){

	console.log('채팅 내용 지우기');
	var url = req.url;
	console.log('show url : '+url);
	var id = url.split('/')[2];	// /로 나눈 것의 2번째 것을 가져옴

	id = urlencode.decode(id);
	console.log('삭제할 채팅 id : ', id);

	pool.getConnection(function(err, conn){
			var sql = 'DELETE FROM chat WHERE id = ?';
			conn.query(sql, [id], function(err, rows){
					if (err) {	//삭제할 데이터가 없다면 에러처리 어떻게?
						res.writeHead(404);
						res.end('채팅 삭제 실패');	//클라이언트에게 갈 메세지
					}
						else {
				    res.statusCode = 200;
				    res.end('채팅 삭제 성공');
						}
					conn.release();
					});
				});
			}

