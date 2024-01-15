import express from 'express';
// import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';
import fs from 'fs'


const warnings = `
===============================================================
  routes/index.js is a sample use only,
  Please use routes/onl-py.js for production.
===============================================================
`
console.log(warnings)


const router = express.Router();

// 테스트용 인증서정보(직렬화)
const KCP_CERT_INFO = '-----BEGIN CERTIFICATE-----MIIDgTCCAmmgAwIBAgIHBy4lYNG7ojANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yMTA2MjkwMDM0MzdaFw0yNjA2MjgwMDM0MzdaMHAxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTERMA8GA1UECgwITG9jYWxXZWIxETAPBgNVBAsMCERFVlBHV0VCMRkwFwYDVQQDDBAyMDIxMDYyOTEwMDAwMDI0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppkVQkU4SwNTYbIUaNDVhu2w1uvG4qip0U7h9n90cLfKymIRKDiebLhLIVFctuhTmgY7tkE7yQTNkD+jXHYufQ/qj06ukwf1BtqUVru9mqa7ysU298B6l9v0Fv8h3ztTYvfHEBmpB6AoZDBChMEua7Or/L3C2vYtU/6lWLjBT1xwXVLvNN/7XpQokuWq0rnjSRThcXrDpWMbqYYUt/CL7YHosfBazAXLoN5JvTd1O9C3FPxLxwcIAI9H8SbWIQKhap7JeA/IUP1Vk4K/o3Yiytl6Aqh3U1egHfEdWNqwpaiHPuM/jsDkVzuS9FV4RCdcBEsRPnAWHz10w8CX7e7zdwIDAQABox0wGzAOBgNVHQ8BAf8EBAMCB4AwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAQEAg9lYy+dM/8Dnz4COc+XIjEwr4FeC9ExnWaaxH6GlWjJbB94O2L26arrjT2hGl9jUzwd+BdvTGdNCpEjOz3KEq8yJhcu5mFxMskLnHNo1lg5qtydIID6eSgew3vm6d7b3O6pYd+NHdHQsuMw5S5z1m+0TbBQkb6A9RKE1md5/Yw+NymDy+c4NaKsbxepw+HtSOnma/R7TErQ/8qVioIthEpwbqyjgIoGzgOdEFsF9mfkt/5k6rR0WX8xzcro5XSB3T+oecMS54j0+nHyoS96/llRLqFDBUfWn5Cay7pJNWXCnw4jIiBsTBa3q95RVRyMEcDgPwugMXPXGBwNoMOOpuQ==-----END CERTIFICATE-----';

// INDEX PAGE
router.get('/', function (req, res) {
  res.render('index', {
    title: '가맹점 결제 샘플 페이지'
  });
});

// ORDER PAGE(PC)
router.get('/sample/order', function (req, res) {
  res.render('sample/order');
});

// MOBILE 거래등록 PAGE
router.get('/mobile_sample/trade_reg', function (req, res) {
  res.render('mobile_sample/trade_reg');
});

// MOBILE 거래등록 API
router.post('/mobile_sample/kcp_api_trade_reg', function (req, res) {

  console.log("req.body", req.body)


  // 거래등록처리 POST DATA
  var actionResult = f_get_parm(req.body.ActionResult); // pay_method에 매칭되는 값 (인증창 호출 시 필요)
  var van_code = f_get_parm(req.body.van_code); // (포인트,상품권 인증창 호출 시 필요)

  var post_data = {
    actionResult: actionResult,
    van_code: van_code
  };

  // 거래등록 API REQ DATA
  var req_data = {
    site_cd: f_get_parm(req.body.site_cd),
    kcp_cert_info: KCP_CERT_INFO,
    ordr_idxx: f_get_parm(req.body.ordr_idxx),
    good_mny: f_get_parm(req.body.good_mny),
    good_name: f_get_parm(req.body.good_name),
    pay_method: f_get_parm(req.body.pay_method),
    Ret_URL: f_get_parm(req.body.Ret_URL),
    escw_used: 'N',
    user_agent: ''
  };

  // 거래등록 API URL
  // 개발 : https://stg-spl.kcp.co.kr/std/tradeReg/register
  // 운영 : https://spl.kcp.co.kr/std/tradeReg/register
  fetch("https://stg-spl.kcp.co.kr/std/tradeReg/register", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req_data),
  })
    // 거래등록 API RES
    .then(response => {
      return response.json();
    })
    .then(data => {

      // console.log('\n\n')
      // console.log('req_data trade_reg', req_data)
      // console.log('res_data trade_reg', data)
      // console.log('post_data trade_reg', post_data)

      res.render('mobile_sample/kcp_api_trade_reg', {
        req_data: req_data,
        res_data: data,
        post_data: post_data
      });
    });
});

// 주문페이지 이동 및 Ret_URL 처리(MOBILE)
router.post('/mobile_sample/order_mobile', function (req, res) {

  console.log("req.body", req.body)

  var res_cd = f_get_parm(req.body.res_cd);
  let post_data = {}
  if (res_cd == '0000') {
    var enc_info = f_get_parm(req.body.enc_info);
    // enc_info 값이 없을 경우 POST DATA 처리 후 order_mobile 이동
    if (enc_info == '') {
      post_data = {
        approvalKey: f_get_parm(req.body.approvalKey),
        traceNo: f_get_parm(req.body.traceNo),
        PayUrl: f_get_parm(req.body.PayUrl),
        pay_method: f_get_parm(req.body.pay_method),
        actionResult: f_get_parm(req.body.ActionResult),
        Ret_URL: f_get_parm(req.body.Ret_URL),
        van_code: f_get_parm(req.body.van_code),
        site_cd: f_get_parm(req.body.site_cd),
        ordr_idxx: f_get_parm(req.body.ordr_idxx),
        good_name: f_get_parm(req.body.good_name),
        good_mny: f_get_parm(req.body.good_mny)
      };
      // enc_info 값이 있을 경우 결제 진행(결제인증 후 Ret_URL처리)
    } else {
      var use_pay_method = f_get_parm(req.body.use_pay_method);
      post_data = {
        req_tx: f_get_parm(req.body.req_tx), // 요청 종류         
        res_cd: f_get_parm(req.body.res_cd), // 응답 코드
        site_cd: f_get_parm(req.body.site_cd), // 사이트코드       
        tran_cd: f_get_parm(req.body.tran_cd), // 트랜잭션 코드     
        ordr_idxx: f_get_parm(req.body.ordr_idxx), // 쇼핑몰 주문번호   
        good_name: f_get_parm(req.body.good_name), // 상품명            
        good_mny: f_get_parm(req.body.good_mny), // 결제 금액       
        buyr_name: f_get_parm(req.body.buyr_name), // 주문자명          
        buyr_tel1: f_get_parm(req.body.buyr_tel1), // 주문자 전화번호   
        buyr_tel2: f_get_parm(req.body.buyr_tel2), // 주문자 핸드폰 번호
        buyr_mail: f_get_parm(req.body.buyr_mail), // 주문자 E-mail 주소
        use_pay_method: f_get_parm(req.body.use_pay_method), // 결제 방법          
        enc_info: enc_info, // 암호화 정보       
        enc_data: f_get_parm(req.body.enc_data), // 암호화 데이터     
        param_opt_1: '', // 기타 파라메터 추가 부분
        param_opt_2: '', // 기타 파라메터 추가 부분
        param_opt_3: ''  // 기타 파라메터 추가 부분
      };


      // console.log('\n\n')
      // console.log('post_data at order_mobile'a)


      // 현금영수증 관련 데이터 처리(결제수단:가상계좌,계좌이체,포인트)
      if (use_pay_method == '010000000000' || use_pay_method == '001000000000' || use_pay_method == '000100000000') {
        post_data.cash_yn = f_get_parm(req.body.cash_yn);
        // cash_yn(현금영수증발급여부) == 'Y' 인 경우
        if (f_get_parm(req.body.cash_yn) == 'Y') {
          post_data.cash_tr_code = f_get_parm(req.body.cash_tr_code);
        }
      }
    }

  } else {
    post_data = {
      res_cd: res_cd, // 응답 코드         
      res_msg: f_get_parm(req.body.res_msg) // 응답 메세지
    };
  }
  res.render('mobile_sample/order_mobile', {
    post_data: post_data
  });

});

// 결제요청 API (자동취소 로직 추가)
router.post('/kcp_api_pay', function (req, res) {
  var site_cd = f_get_parm(req.body.site_cd);

  console.log('\n\nkcp_api_pay')

  // 결제 REQ DATA
  var req_data = {
    tran_cd: f_get_parm(req.body.tran_cd),
    site_cd: site_cd,
    kcp_cert_info: KCP_CERT_INFO,
    enc_data: f_get_parm(req.body.enc_data),
    enc_info: f_get_parm(req.body.enc_info),
    ordr_mony: '1' // 결제요청금액   ** 1 원은 실제로 업체에서 결제하셔야 될 원 금액을 넣어주셔야 합니다. 결제금액 유효성 검증 **
  };

  // 결제 API URL
  // 개발 : https://stg-spl.kcp.co.kr/gw/enc/v1/payment
  // 운영 : https://spl.kcp.co.kr/gw/enc/v1/payment
  fetch("https://stg-spl.kcp.co.kr/gw/enc/v1/payment", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req_data),
  })
    // 결제 API RES
    .then(response => {
      return response.json();
    })
    .then(data => {

      console.log('data', data)
      /*
      ==========================================================================
          승인 결과 DB 처리 실패시 : 자동취소
      --------------------------------------------------------------------------
          승인 결과를 DB 작업 하는 과정에서 정상적으로 승인된 건에 대해
      DB 작업을 실패하여 DB update 가 완료되지 않은 경우, 자동으로
          승인 취소 요청을 하는 프로세스가 구성되어 있습니다.

      DB 작업이 실패 한 경우, bSucc 라는 변수(String)의 값을 "false"
          로 설정해 주시기 바랍니다. (DB 작업 성공의 경우에는 "false" 이외의
          값을 설정하시면 됩니다.)
      --------------------------------------------------------------------------
      */
      var bSucc = ''; // DB 작업 실패 또는 금액 불일치의 경우 "false" 로 세팅
      // bSucc='false'인 경우 자동취소로직 진행
      if (bSucc == 'false') {
        req_data = '';
        // 취소 REQ DATA
        var tno = data.tno;
        var mod_type = 'STSC';
        var cancel_sign_data = site_cd + '^' + tno + '^' + mod_type;
        var kcp_sign_data = make_sign_data(cancel_sign_data);

        req_data = {
          site_cd: site_cd,
          tno: tno,
          kcp_cert_info: KCP_CERT_INFO,
          kcp_sign_data: kcp_sign_data,
          mod_type: mod_type,
          mod_desc: '가맹점 DB 처리 실패(자동취소)'
        };
        // 취소 API URL
        // 개발 : https://stg-spl.kcp.co.kr/gw/mod/v1/cancel
        // 운영 : https:/spl.kcp.co.kr/gw/mod/v1/cancel
        fetch("https://stg-spl.kcp.co.kr/gw/mod/v1/cancel", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req_data),
        })
          // 취소 API RES
          .then(response => {
            return response.json();
          })
          // RES JSON DATA Parsing
          .then(data => {
            res.render('kcp_api_pay', {
              req_data: JSON.stringify(req_data),
              res_data: JSON.stringify(data),
              data: data,
              bSucc: bSucc
            });
          })
        // bSucc='false'가 아닌경우 자동취소로직 생략 후 결제결과처리
      } else {
        res.render('kcp_api_pay', {
          req_data: JSON.stringify(req_data),
          res_data: JSON.stringify(data),
          data: data,
          use_pay_method: f_get_parm(req.body.use_pay_method),
          ordr_idxx: f_get_parm(req.body.ordr_idxx),
          cash_yn: f_get_parm(req.body.cash_yn),
          cash_tr_code: f_get_parm(req.body.cash_tr_code),
          bSucc: bSucc
        });
      }
    });
});

// null 값 처리
function f_get_parm(val) {
  if (val == null) val = '';
  return val;
}

// 서명데이터 생성 예제
function make_sign_data(data) {
  // 개인키 READ
  // "splPrikeyPKCS8.pem" 은 테스트용 개인키
  // "changeit" 은 테스트용 개인키비밀번호
  var key_file = fs.readFileSync('C:\\...\\node_kcp_api_pay_sample\\certificate\\splPrikeyPKCS8.pem').toString();
  var password = 'changeit';
  // 서명데이터생성
  return crypto.createSign('sha256').update(data).sign({
    format: 'pem',
    key: key_file,
    passphrase: password
  }, 'base64');
}

export default router;
