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

///////응답서 리스트 보기, /responses?patientId=1
exports.showResponseList = function(req, res){

console.log('응답서 리스트 보기');
var url = req.url;
console.log('show url : '+url);

var patientId = url.split('=')[1];	// =로 나눈 것의 2번째 것을 가져옴
patientId = urlencode.decode(patientId);

console.log('응답리스트를 요구한 환자 : ' + patientId);

pool.getConnection(function(err, conn){
		var sql = 'SELECT * FROM response WHERE patientId = ?';
		//var sql2 = 'SELECT * FROM pill WHERE requestId = ?';

		conn.query(sql, [patientId], function(err, rows){
			//TODO 에러처리
			async.each(rows, function(response, callback){
				console.log('response.requestId : ', response.requestId);
				var sql2 = 'SELECT * FROM pill WHERE requestId = ?';

				conn.query(sql2, [response.requestId], function(err, rows){
					//console.log('약 정보', rows[0].name);
					response.pills = [];

					for(var i = 0 ; i < rows.length ; i++){
						var row = rows[i];
						console.log('각각의 row : ', row);
						var pillInfo =
										{name : row.name,
									}//약 개체 생성

						response.pills.push(pillInfo);
					}
					callback(null);
					})
				}, function(err){
							res.json(rows);
			})
			return;

			var responseData = rows[0];
			console.log('응답서 정보', responseData);	//환자 정보
					if (responseData == undefined) {
								//res.writeHead(404);
								res.status(404).json({patientId:-1});
						    //res.statusCode = 404;
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

/////응답서 보기 종료

//응답서 수정, isRead와 isReserved 처리 이 둘은 update로 구분
//app.route('/responses/:id')
exports.editResponse = function(req, res){

var url = req.url;
console.log('show url : '+url);

var id = url.split('/')[2];	// =로 나눈 것의 2번째 것을 가져옴
id = urlencode.decode(id);

console.log('수정할 응답서 id :', id);
console.log('req.body 값0: ',req.body);

var updateRead = parseInt(req.body.updateRead);
var isRead = parseInt(req.body.isRead);
var isReserved = parseInt(req.body.isReserved);

pool.getConnection(function(err, conn){
		var sql = 'UPDATE response SET isRead  = ? WHERE id = ?';
		var sql2 = 'UPDATE response SET isReserved  = ? WHERE id = ?';

		if (updateRead == 1) {
			isReserved = 0;
			var responseData = {
											'isRead' : isRead,
											'isReserved' : isReserved
										};

		conn.query(sql, [isRead, id], function(err, rows){
			console.log('읽음 유무 : ', responseData);	//환자 정보
					if(err) {
								console.log('err : ', err)
						    res.statusCode = 404;
						    res.end('EDIT FAIL');
												}
						else {
							res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
							console.log('JSON 값 : ',JSON.stringify(responseData));
							res.end(JSON.stringify(responseData));

							console.log('isReserved 값1: ', isReserved)
							//예약 수정
								}
						});////sql 종료
					}

				if (updateRead == 0) {
					isRead = 1;
					var responseData2 = {
										'isRead' : isRead,
										'isReserved' : isReserved
									};

		conn.query(sql2, [isReserved, id], function(err, rows){
			//var patient = rows[0];
			console.log('예약 확인 : ', responseData2);	//환자 정보
					if(err) {
								console.log('err : ', err)
						    res.statusCode = 404;
						    res.end('EDIT FAIL');
												}
						else {
							//res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
							console.log('JSON 값 : ',JSON.stringify(responseData2));
							res.end(JSON.stringify(responseData2));
							}
						});
					}
				conn.release();
				});//db연결 종료
			}




