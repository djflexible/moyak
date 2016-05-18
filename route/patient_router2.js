var pool = require('./dbConnection');//db연결
var urlencode = require('urlencode');
var querystring = require('querystring');
var async = require('async');	//디비 저장

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

//문의서 생성(직접 생성)
exports.addRequest = function(req, res){	//post 방식

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
