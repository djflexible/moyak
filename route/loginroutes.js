// app/routes.js

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		//res.render('index.ejs'); // load the index.ejs file
	});

	app.get('/login', function(req, res) {
		console.log('로그인 안됨1');
	});

app.post('/login', function(req, res){
	console.log('로그인 유무');
	passport.authenticate('local-login', function(err, user, msg, statusCode){

		if ( ! user ) {
						 console.log('err 값 : ', err);
						 console.log('user 값 : ', user);
						 console.log('로그인 안됨2');
		         //res.status(404).json({id:-1});
		         res.status(404).end();
		         return;
		      }
		      // 세션에 기록
    req.logIn(user, function(err) {
       if ( err ) {
          res.status(404).json({msg:'Session Write Error'});
          return;
       }
       console.log('로그인 됨');
       res.json({id : user.id});//로그인 성공 반환값
	});
 })(req);
});

	app.get('/signup', function(req, res) {ㄴ`
	});

	app.post('/signup', function(req, res){
		passport.authenticate('local-signup', function(err, user, msg, statusCode){
			if ( ! user ) {
			         res.status(404).json({id:-1});
			         return;
			      }
			      // 세션에 기록
	    req.logIn(user, function(err) {
	       if ( err ) {
	       		console.log('req.body', req.body);
	          res.status(404).json({msg:'Session Write Error'});
	          return;
	       }
	     res.json({id : user.id});
			});
	 	})(req);
	});

	app.get('/profile', isLoggedIn, function(req, res) {
		console.log('로그인 확인 페이지');
	});

	app.get('/logout', function(req, res) {
		console.log('로그 아웃');
		req.logout();
		res.redirect('/');
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())	//만약 인증이 되면 로그인
		return next();
}
