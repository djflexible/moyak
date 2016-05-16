# [개발환경 및 활용방식]
Moyak 관련 문서 : https://drive.google.com/file/d/0B-zsSFbS0nlhZUdCV2FSV3cwNms/view?usp=sharing

OS : Window 8 - 개발부분, Amazon Linux AMI - 서버 구동 부분

IDE : Sublime Text 3 

Programing Language : Javascript

Database : MySQL 5.6.2, HeidiSQL - 관리 툴

Server Infra : 
Node.js 4.1.2, express 4.0 - 경량의 웹 프레임워크 목적, JSON - 데이터 송/수신으로 안드로이드 기기와 RESTFul 방식으로 통신, multipart - 이미지를 입/출력하기 위한 방식 

AWS Cloud Computing :
EC2 - 가상서버 생성, Security Group - 방화벽 설정, Elastic IP : 고정 IP 할당, S3 : 파일 입출력을 위한 저장 공간, RDS - MySQL과 연동하기 위함, ELB - 서버 부하 예방 목적  

Test Tool : Google Postman - 클라이언트 테스트

Public API : 공공 데이터 포털 사이트의 서울시 약국 위치 데이터

+++++++

config 폴더 : 인증 기능 구현

route 폴더 : 서비스 기능 구현

serve.js : 서버 동작

