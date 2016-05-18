var pool = require('./dbConnection');//db연결
var urlencode = require('urlencode');
var querystring = require('querystring');
var async = require('async');	//디비 저장

//GCM 추가
var moyakGcm = require('./moyakGcm');
	//응답서 보내기
	exports.sendResponse = function(req, res){	//post 방식
		moyakGcm.sendResponseGCM();	//GCM 전송
		console.log('GCM 확인');
		console.log('문의서 직접 생성');
		console.log('클라이언트 리퀘스트 : ', req.body);
		console.log('로그040');

		var pharmacistId = req.body.pharmacistId;
		var patientId = req.body.patientId;
		var requestId = req.body.requestId;
		var created = req.body.created;
		var distance = req.body.distance;
		var price = req.body.price;

		var isRead = 0;
		var isReserved = 0;

		console.log('응답서에서 약사 아이디 출력 : ', pharmacistId);

		pool.getConnection(function(err, conn){		//dbConnect
			console.log('로그1');
			var requestdata = {
						'pharmacistId': pharmacistId,
						'patientId' : patientId,
						'requestId' : requestId,
						'created' : created,
						'distance' : distance,
						'price' : price,
						'isRead' : isRead,
						'isReserved' : isReserved
					};
			var query = 'INSERT INTO response SET ?';

			conn.query(query, requestdata, function(err, result){
					if(err){
							res.status(404).json({id:-1});
							res.end('INSERT FAIL1');
							return;
					}
					//res.status(200)
					//res.status(200).json({id:1});
					console.log('INSERT SUCCESS1');	//리퀘스트 저장 완료
					console.log('result 값 : ', result);
					console.log('웅답서 id값 : ', result.insertId);

					async.each(req.body.pills, function(pill, callback) {

						var patientId = req.body.patientId;
							var pilldata = {
									'requestId' : result.insertId,	//requestrId 추가
									'name': pill.name,
									'company' : pill.company,
									'doseAmount' : pill.doseAmount,
									'doseTimes' : pill.doseTimes,
									'doseDays' : pill.doseDays
								};
								console.log('리퀘스트 아이디3 : ', req.body.requestId);
								console.log('리퀘스트 아이디4 : ', req.body.id);
								console.log('pilldata : ', pilldata);

								console.log('중간 확인');

								var query2 = 'INSERT INTO pill set ?';
								conn.query(query2, pilldata, function(err, result){

									console.log('쿼리 2 시작');
										if(err){

												callback(err);
												res.end('INSERT FAIL2');
										}
										else{

												console.log('INSERT SUCCESS2');
												console.log('pilldata 확인: ', pilldata);
												callback(null);
										}
								});//2번째 쿼리 종료
								console.log('로그4');
					}, function(err, result){

						if(err){
							console.log('ERR', err);
								res.end('INSERT ERR');
							}

						else{
							res.status(200);
							res.end('INSERT SUCCESS2');
						}
					})//async종료
					console.log('로그3');
					conn.release();
			});//1번째 쿼리 종료
					console.log('로그2');
		});
	}