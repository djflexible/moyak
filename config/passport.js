var LocalStrategy   = require('passport-local').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {

    //세션에 기록하기
    passport.serializeUser(function(user, done) {
        console.log('세션에 기록하기');
        console.log(' user.id 값 : ',  user.id);

        done(null, user.id);
    });

    //세션에서 사용자 정보 찾기
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM patient WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
            console.log('세션에서 사용자 정보 찾기');
        });
    });


//////////회원가입
passport.use('local-signup', new LocalStrategy({
        usernameField : 'phone',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, phone, password, done) {  //done을 res로 바꿈
        console.log('회원가입 확인');

        var gender = parseInt(req.body.gender);
        var name = req.body.name;
        var birthyear = parseInt(req.body.birthyear);
        var profilePicture = req.body.profilePicture;
        var token = req.body.token;

        //사용자 이름이 겹칠때
        connection.query("SELECT * FROM patient WHERE phone = ?",[phone], function(err, rows) {
            if (err)
                return done(err);
            if (rows.length) {
                console.log('사용자 이름 겹침');
                return done(null, false, req.flash('signupMessage', 'That phone is already taken.')); //past정보
            } else {
                //회원 생성
                var patientdata = {
                    phone: phone,
                    password: bcrypt.hashSync(password, null, null),  //hash알고리즘으로 암호화
                    gender : gender,
                    name : name,
                    birthyear : birthyear,
                    profilePicture : profilePicture,
                    token : token
                };

                var insertQuery = "INSERT INTO patient ( phone, password, gender, name, birthyear, profilePicture, token ) values (?,?,?,?,?,?,?)";

                connection.query(insertQuery,[patientdata.phone, patientdata.password, patientdata.gender, patientdata.name, patientdata.birthyear, patientdata.profilePicture, patientdata.token],function(err, rows) {
                    patientdata.id = rows.insertId;
                    console.log('회원가입의 req.body 값 : ', req.body);
                    console.log('회원 가입 완료');
                    return done(null, patientdata);
                });
            }
        });
    })
);

//유저 로그인
    passport.use('local-login', new LocalStrategy({
            usernameField : 'phone',
            passwordField : 'password',
            passReqToCallback : true
        }, function(req, phone, password, done) {
            connection.query("SELECT * FROM patient WHERE phone = ?",[phone], function(err, rows){
                console.log('로그인 준비중');
                console.log(req.body.phone);
                console.log(req.body.password);

                if (err)
                    return done(err);
                if (!rows.length) { //아이디 없을떄
                    console.log('유저를 찾을수 없음');
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }

                // 비밀번호 틀림
                if (!bcrypt.compareSync(password, rows[0].password)) {
                    console.log('비밀번호 틀림');
                    //res.status(401).json({msg:'Session Write Error'});

                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    }

              console.log('로그인 성공');
                 return done(null, rows[0]);
            });
        })
    );
};
