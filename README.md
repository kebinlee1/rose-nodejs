## 프로젝트 개요

1. 프로젝트 목표: 음식점의 디지털 메뉴판을 제공한다.

1. 회원 등록 및 로그인 웹 페이지 제공
    - 서버에 회원 정보 저장

1. 음식점 주인이 로그인 하여 메뉴를 작성할 수 있는 기능을 제공
    
1. 메뉴 작성 웹 페이지 제공 
    - 메뉴 생성 | 삭제 | 수정
    - 서버에서 메뉴 정보 데이터베이스 생성

1. 손님은 테이블에 QR코드를 핸드폰으로 스캔하여 디지털 메뉴판을 띄운다.
    - 메뉴판에 접속할 수 있도록 QR코드 생성하여 프린트
    - 손님이 볼수 있는 메뉴페이지 제공

### 프로젝트 수행 후 얻을 수 있는 지식들

- HTML, CSS, JavaScript를 Web의 기초를 이해하고 코딩할 수 있다.

- 서버와 Front-end 개념을 이해하고 코딩할 수 있다.

- Database 동작 원리를 이해하고 사용할 수 있다.

- Web 기술의 기본을 이해하고 응용할 수 있다.

- 클라우드 서비스를 이해하고 사용할 수 있다.

## Milestone

### Step 1: Local PC 로직 구현

- web server: node.js, express app

- front-end: node.js ejs

- database: JSON file


### Step 2: Local PC API server + React

- api Server: node.js, express

- front-end app: react

- database: JSON file

### Step 3: 정식 데이터베이스 사용 및 Public 배포

- database 종류: DynamoDB | mongoDB | mySql

- AWS에 배포: AWS 회원 등록 > 1년 무료 사용 가능

- api Server location: AWS EC2

- Database: AWS DynamoDB 추천

- React: AWS Amplify 추천

<div style="page-break-after: always;"></div>

## 참고 자료

### Database

> JSON format example

[Stores Database]
```js
[
  {
    userId: "",           // 로그인 id, alphabet, number 8 ~ 20 자
    pw: "",               // 로그인 PW  alphabet, number 8 ~ 20 자
    shopId: "",           // random Hex String  length = 20
    shopName: "",         // 가게 이름 max 100
    shopDescription: "",  // 가게 설명 max 256
    userType: "",             // admin, shop, user
  },
  ...
]
```

[Menus Database]
```js
[
  {
    shopId: "",     // 가게 색인용 Primary Key 가게 정보의 shopId와 동일
    itemCode: "",   // 메뉴 색인용 Secondary Key String, length = 4, 예) 0001 - Number String
    itemName: "",   // String 예) 짜장면
    price: "",      // Number
    
  },
  ...
]
```
