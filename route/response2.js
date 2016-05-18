var pool = require('./dbConnection');//db연결
var urlencode = require('urlencode');
var querystring = require('querystring');
var async = require('async');	//디비 저장

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