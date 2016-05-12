var pool = require('./dbConnection');//db연결
var urlencode = require('urlencode');
var querystring = require('querystring');


	//약 생성
	exports.addPill = function(req, res){	//past 방식
		console.log('약 생성1');

		var chunk = '';
		//데이터를 가져옵니다.
		req.on('data', function(pilldata){
		//데이터를 JSON으로 파싱합니다.
		chunk = JSON.parse(pilldata);
		});

		req.on('end',function(){
		//파싱된 데이터를 확인합니다.
		console.log("name : "+chunk.name + " , company : "+chunk.company+ " , doseAmount : "+chunk.doseAmount+ " , doseTimes : "+chunk.doseTimes+ " , doseDays : "+chunk.doseDays);
		});

		// 아래의 OK라는 내용이 안드로이드의 ReadBuffer를 통해
		// result String으로 바뀝니다.
		//res.write("OK");
		//res.end();

		pool.getConnection(function(err, conn){		//dbConnect
			console.log('로그1');
			var pilldata = {
						'name': chunk.name,
						'company' : chunk.company,
						'doseAmount' : chunk.doseAmount,
						'doseTimes' : chunk.doseTimes,
						'doseDays' : chunk.doseDays
					};
			console.log(pilldata);
			var query = 'INSERT INTO request SET ?';
			conn.query(query, pilldata, function(err, result){
					if(err){
							res.status(404).json({id:-1});
							res.end('INSERT FAIL');
					}
					else{
							//res.status(200).json({id:pilldata.id});
							console.log('INSERT SUCCESS');
					}
						conn.release();
			});
		});
	}

///////의약품 보기
	exports.showPill = function(req, res){

			var url = req.url;
			console.log('show url : '+url);

			var pillId = url.split('=')[1];	// =로 나눈 것의 2번째 것을 가져옴
			pillId = urlencode.decode(pillId);

			console.log('문의서 코드 : ' + pillId);

			pool.getConnection(function(err, conn){
					var sql = 'SELECT pillId, kor_name, company, dose_amount, dose_times, dose_days FROM pill WHERE pillId = ?';

					conn.query(sql, [pillId], function(err, rows){
						//TODO 에러처리
						var pilldata = rows[0];
						console.log('문의서 정보', pilldata);	//환자 정보

								if (pilldata == undefined) {
											//res.writeHead(404);
											res.status(404).json({pillId:-1});
									    //res.statusCode = 404;
									    res.end('SHOW FAIL');
										}
									else {
									    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
									    res.end(JSON.stringify(pilldata));
									    console.log('SHOW SUCCESS', rows);
									}

									conn.release();
									});
							});
					}
