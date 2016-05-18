var pool = require('./dbConnection');//db연결
var urlencode = require('urlencode');
var querystring = require('querystring');
var async = require('async');	//디비 저장

//문의서 생성(이미지로 생성)
///////문의서 보기
	exports.showRequest = function(req, res){

			var url = req.url;
			console.log('show url : '+url);
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
//근처 약국 찾기
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