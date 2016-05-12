var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//기능이 들어 있는 장소
var moyak = require('./route/patient_router');
var moyak_img = require('./route/moyak_img');
var response = require('./route/response');
var chat = require('./route/chat');

var moyak_pill = require('./route/pill_router');
var morgan = require('morgan');
var app = express();
var port = process.env.PORT || 80;

var passport = require('passport');
var flash = require('connect-flash');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());// 요청의 전체를 json으로 가져옴

//정적 파일 처리
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/images'));
app.use(morgan('dev'));

app.route('/pharmacists/:id')
		.get(moyak.getPharmacistId);	//채팅 리스트 가져오기	get


app.get('/requests/near', moyak.showRequestNear);	//약사 입장에서 문의서 거리 계산
app.route('/patients/:id')
		.get(moyak.showPatientDetail)	//환자정보 보기, 완료
		.delete(moyak.deletePatient)	//환자 삭제, 완료,
		.put(moyak.editPatient);	//환자 정보 수정, 보류 update 문제

///////문의서
app.route('/requests')
		.post(moyak.addRequest);	//문의서 추가 post(직접 생성)

app.route('/requestsImg')
		.post(moyak_img.addRequestImg);	//문의서 추가 post(이미지로 생성)

//		/patients?:id/requsets?:request_id	 http://127.0.0.1:3003/patients?id=1&request_code=2
app.route('/requests')
		.get(moyak.showRequest);	//문의서 가져오기	그냥
////

//의약품 현재 안씀
/////////////
app.route('/pills')
		.post(moyak_pill.addPill);	//의약품 추가 post

app.route('/pills/:pillId')
		.get(moyak_pill.showPill);	//문의서 가져오기	get

///////
///////응답서 관련
app.route('/responses')
		.post(response.sendResponse);	//약사가 응답서 보내기


app.route('/responses?:patientId')
		.get(response.showResponseList);	//응답서 리스트 가져오기	get 환자


app.route('/responses/:id')
		.put(response.editResponse);	//응답서 수정

/////
///채팅 관련
app.route('/chats')
		.post(chat.addChat);	//채팅 메세지 보내기 post


app.route('/chats?:patientId')
		.get(chat.showChatList);	//채팅 리스트 가져오기	get

app.route('/chats/:id')	//chat?id=2
		.delete(chat.deleteChat);	//채팅 내용 지우기 delete

///////////////////////////////////////////////
//기존 모약 종료
// connect to our database
require('./config/passport')(passport); // pass passport for configuration

// set up our express application
//app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({secret: 'vidyapathaisalwaysrunning', resave: true, saveUninitialized: true } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes 위치 설정
require('./route/loginroutes.js')(app, passport); // load our routes and pass in our app and fully configured passport


// launch ======================================================================
app.listen(port);
console.log('MOYAK is serving at ' + port);
