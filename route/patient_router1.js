var pool = require('./dbConnection');//db연결
var urlencode = require('urlencode');
var querystring = require('querystring');
var async = require('async');	//디비 저장

//새로운 환자 추가
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

exports.deletePatient = function(req, res){
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
