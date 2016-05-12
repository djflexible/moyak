var pool = require('./dbConnection');//db연결
var urlencode = require('urlencode');
var querystring = require('querystring');
var async = require('async');	//디비 저장



//새 환자 추가
exports.addPatient = function(req, res){	//past 방식
	//console.log(req.body);
	//moyak에서 post는 새로운 환자 정보 추가
	var phone = req.body.phone;
	var password = req.body.password;
	var gender = parseInt(req.body.gender);
	var name = req.body.name;
	var birthyear = parseInt(req.body.birthyear);
	var profilePicture = req.body.profilePicture;

	pool.getConnection(function(err, conn){		//dbConnect

		var patient = {
					'phone': phone,
					'password' : password,
					'gender' : gender,
					'name' : name,
					'birthyear' : birthyear,
					'profilePicture' : profilePicture
				};
				//console.log('환자정보', patient);	//환자 정보
////

		var query = 'INSERT INTO patient SET ?';

		console.log('환자정보', patient);	//환자 정보
		conn.query(query, patient, function(err, result){

				if(err){
						res.writeHead(404);
						//res.statusCode = 404;
						res.end('INSERT FAIL');
				}
				else{
						res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
						//res.end(JSON.stringify(patient));
						console.log('INSERT SUCCESS', result);
				}
					conn.release();
		});
	});
}
//환자 추가 종료


//환자 정보 상세 보기 /patients/:id 	get방식
exports.showPatientDetail = function(req, res){
		//var id = req.params.id; //params이 아니라 query

		var url = req.url;
		console.log('환자 정보 상세 보기 show url : '+url);

		var id = url.split('/')[2];	// =로 나눈 것의 2번째 것을 가져옴
		id = urlencode.decode(id);

		console.log('id : '+id);

		console.log('상세 환자 정보 보기');
		console.log('환자id:' + id);

		pool.getConnection(function(err, conn){
				var sql = 'SELECT phone, gender, name, birthyear, profilePicture FROM patient WHERE id = ?';
//d
				conn.query(sql, [id], function(err, rows){
					//TODO 에러처리
					var patient = rows[0];
					console.log('환자정보', patient);	//환자 정보

							if (patient == undefined) {
										//res.writeHead(404);
								    //res.statusCode = 404;
								    res.end('SHOW FAIL');
									}
								else {
								    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
								    res.end(JSON.stringify(patient));
								    console.log('SHOW SUCCESS', rows);
								}

								conn.release();
								});
						});
				}

//////
/////

exports.deletePatient = function(req, res){	//에러코드 해결안됨
	//var id = parseInt(req.params.id);

	var url = req.url;
	console.log('show url : '+url);

	var id = url.split('/')[2];	// =로 나눈 것의 2번째 것을 가져옴
	id = urlencode.decode(id);

	console.log('삭제할 환자 아이디 : ', id);

	pool.getConnection(function(err, conn){
			var sql = 'DELETE FROM patient WHERE id = ?';

			conn.query(sql, [id], function(err, rows){

					if (err) {
						res.writeHead(404);
						res.end('DELETE FAIL');
					}

						else {
				    res.statusCode = 200;
				    res.end('DELETE SUCCESS');
					}
							conn.release();
							});
					});
			}

//환자 정보 수정함
exports.editPatient = function(req, res){

		var url = req.url;
		console.log('show url : '+url);

		var id = url.split('/')[2];	// =로 나눈 것의 2번째 것을 가져옴
		id = urlencode.decode(id);

		console.log('수정할 환자 id :', id);


			//var phone = req.body.phone;
			//var password = req.body.password;
			var gender = parseInt(req.body.gender);
			var name = req.body.name;
			var birthyear = parseInt(req.body.birthyear);
			var profilePicture = req.body.profilePicture;

			console.log('req.body : ',req.body);


			pool.getConnection(function(err, conn){
					var sql = 'UPDATE patient SET gender = ?, name = ?, birthyear = ?, profilePicture = ?  WHERE id = ?';

					var patientData = {
													//'phone': phone,
													//'password' : password,
													'gender' : gender,
													'name' : name,
													'birthyear' : birthyear,
													'profilePicture' : profilePicture
												};
					conn.query(sql, [gender, name, birthyear, profilePicture, id], function(err, rows){
						//TODO 에러처리

						//var patient = rows[0];
						console.log('수정할 환자정보', patientData);	//환자 정보
								if(err) {
											console.log('err : ', err)
									    res.statusCode = 404;
									    res.end('EDIT FAIL');
															}
									else {

										res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
										res.end(JSON.stringify(patientData));
									}

									conn.release();
									});
							});
	}
///////////////////////
//////////////////////
///////////해결 완료


	//문의서 생성(직접 생성)
	exports.addRequest = function(req, res){	//post 방식


/////////////////////////////////////////////////

		var patientId = req.body.patientId;
		var replace = req.body.replace;
		var quick = req.body.quick;
		var distance = req.body.distance;
		var format = req.body.format;
		var latitude = req.body.latitude;
		var longitude = req.body.longitude;


		console.log('리퀘스트에서 환자 아이디 출력 : ', patientId);

		pool.getConnection(function(err, conn){		//dbConnect

			console.log('로그1');

			var requestdata = {
						'patientId': patientId,
						'replace' : replace,
						'quick' : quick,
						'distance' : distance,
						'format' : format,
						'latitude' : latitude,
						'longitude' : longitude
					};

			var query = 'INSERT INTO request SET ?';

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
					console.log('requestId 값 : ', result.insertId);

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

//문의서 생성(이미지로 생성)

///////문의서 보기
	exports.showRequest = function(req, res){

			var url = req.url;
			console.log('show url : '+url);

			//var id = url.split('=')[1];	// =로 나눈 것의 2번째 것을 가져옴
			var id = req.params.id;

			console.log('문의서 코드 : ' + id);

			pool.getConnection(function(err, conn){
					var sql = 'SELECT * FROM request WHERE id = ?';

					conn.query(sql, [id], function(err, rows){
						//TODO 에러처리
						var requestdata = rows[0];
						console.log('문의서 정보', requestdata);	//환자 정보

								if (requestdata == undefined) {
											//res.writeHead(404);
											res.status(404).json({id:-1});
									    //res.statusCode = 404;
									    res.end('SHOW FAIL');
										}
									else {
									    //res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
									    res.json(requestdata);
									    console.log('SHOW SUCCESS', rows);
									}

									conn.release();
									});
							});
					}

exports.showRequestNear = function(req, res){

		var id = req.query.id;//약사 id

		console.log('showRequestNear 값 : ' + id);

		pool.getConnection(function(err, conn) {
				var sql = 'SELECT latitude, longitude FROM pharmacist WHERE id = ?';
				conn.query(sql, [id], function(err, rows){
					//TODO 에러처리
					if ( err ) {
						console.log('sql 실패', err);
						res.sendStatus(500);
						return;
					}

					console.log('sql 성공');
					console.log('rows 값1 : ', rows);

					var latitude = rows[0].latitude;
					var longitude = rows[0].longitude;

					var sql2 = 'SELECT request.id, patientId, patient.name, distance, (6371 * acos(cos(radians(37.585451)) * cos(radians(Latitude)) * cos(radians(Longitude) - radians(126.955528)) + sin(radians(37.585451)) * sin(radians(Latitude )))) AS far, case distance when 0 then 0.3 when 1 then 0.5 when 2 then 1 else 0 end as realDistance from request, patient where request.patientId = patient.id having far < realDistance * 1000';
					conn.query(sql2, [latitude, longitude, latitude], function(err, rows){

								if ( err ) {
											console.log('sql2 실패', err);
											res.sendStatus(500);
											return;
										}

						console.log('sql2 성공');
						console.log('rows 값2: ', rows);
						res.status(200);
						return;
						//res.end('INSERT SUCCESS2');
						})
					conn.release();
				});
			});
	  }
/////문의서 보기 종료

//환자 정보 상세 보기 /patients/:id 	get방식
exports.getPharmacistId = function(req, res){
		//var id = req.params.id; //params이 아니라 query

		var url = req.url;
		console.log('약사 정보 상세 보기 show url : '+url);

		var id = url.split('/')[2];	// /로 나눈 것의 2번째 것을 가져옴
		id = urlencode.decode(id);

		console.log('id : '+id);

		console.log('상세 약사 정보 보기');
		console.log('약사id:' + id);

		pool.getConnection(function(err, conn){
				var sql = 'SELECT id, name, pharmacyName, coverPicture, profilePicture, description, phone, address  FROM pharmacist WHERE id = ?';

				conn.query(sql, [id], function(err, rows){
					//TODO 에러처리
					var pharmacist = rows[0];
					console.log('약사 정보', pharmacist);	//환자 정보

							if (pharmacist == undefined) {
										//res.writeHead(404);
								    //res.statusCode = 404;
								    res.end('SHOW FAIL');
									}
								else {
								    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
								    res.end(JSON.stringify(pharmacist));
								    console.log('SHOW SUCCESS', rows);
								}
								conn.release();
								});
						});
				}