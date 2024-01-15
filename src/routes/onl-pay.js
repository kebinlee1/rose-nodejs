import express from 'express';
// import path from 'path';
// import fetch from 'node-fetch';
// import crypto from 'crypto';
// import fs from 'fs'
import { debug, apiEndpoint } from '../settings/conf.js';
import { payDataGet, payDataUpdate, payDataDel } from '../lib/onl-api/index.js';
import {
  kcpTradeRegister,
  kcpRequestPayment,
  kcpCancelPayment,
  CERT_INFO,
  make_sign_data,
  returnUrl, siteCd,
  getQueryString
} from '../lib/kcp/index.js';
import { parseOrderData, sendOrder } from '../lib/pos/index.js';
import { isEmpty, getParam } from '../lib/utils.js';

console.log('debug', debug)
console.log('apiEndpoint', apiEndpoint)

const router = express.Router();

// 테스트용 인증서정보(직렬화)
// const KCP_CERT_INFO = '-----BEGIN CERTIFICATE-----MIIDgTCCAmmgAwIBAgIHBy4lYNG7ojANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yMTA2MjkwMDM0MzdaFw0yNjA2MjgwMDM0MzdaMHAxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTERMA8GA1UECgwITG9jYWxXZWIxETAPBgNVBAsMCERFVlBHV0VCMRkwFwYDVQQDDBAyMDIxMDYyOTEwMDAwMDI0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppkVQkU4SwNTYbIUaNDVhu2w1uvG4qip0U7h9n90cLfKymIRKDiebLhLIVFctuhTmgY7tkE7yQTNkD+jXHYufQ/qj06ukwf1BtqUVru9mqa7ysU298B6l9v0Fv8h3ztTYvfHEBmpB6AoZDBChMEua7Or/L3C2vYtU/6lWLjBT1xwXVLvNN/7XpQokuWq0rnjSRThcXrDpWMbqYYUt/CL7YHosfBazAXLoN5JvTd1O9C3FPxLxwcIAI9H8SbWIQKhap7JeA/IUP1Vk4K/o3Yiytl6Aqh3U1egHfEdWNqwpaiHPuM/jsDkVzuS9FV4RCdcBEsRPnAWHz10w8CX7e7zdwIDAQABox0wGzAOBgNVHQ8BAf8EBAMCB4AwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAQEAg9lYy+dM/8Dnz4COc+XIjEwr4FeC9ExnWaaxH6GlWjJbB94O2L26arrjT2hGl9jUzwd+BdvTGdNCpEjOz3KEq8yJhcu5mFxMskLnHNo1lg5qtydIID6eSgew3vm6d7b3O6pYd+NHdHQsuMw5S5z1m+0TbBQkb6A9RKE1md5/Yw+NymDy+c4NaKsbxepw+HtSOnma/R7TErQ/8qVioIthEpwbqyjgIoGzgOdEFsF9mfkt/5k6rR0WX8xzcro5XSB3T+oecMS54j0+nHyoS96/llRLqFDBUfWn5Cay7pJNWXCnw4jIiBsTBa3q95RVRyMEcDgPwugMXPXGBwNoMOOpuQ==-----END CERTIFICATE-----';
const KCP_CERT_INFO = CERT_INFO

const str = {
  invalidParam: "KEY PARAM NOT PROVIDED"
}

router.get('/kcp/trade_reg', async function (req, res) {
  try {

    /** @TODO 주문 앱 > payData.orderName 으로 저장할 것 */
    /** @TODO 주문 앱 > payData.orderAmt로 저장할 것 */

    const q = req.query

    if (isEmpty(q.shopId)) throw Error(str.invalidParam + " - shopId")
    if (isEmpty(q.orderId)) throw Error(str.invalidParam + " - orderId")

    let resp = await payDataGet({ shopId: q.shopId, orderId: q.orderId })
    if (resp.err) throw Error(resp.err.message)

    const d = resp.result.Item
    const orderIdUpperCase = d.orderId.toUpperCase()

    if (debug) console.log("payData from payRecord DB", d)

    const body = {
      payId: orderIdUpperCase,
      pgName: "KCP",
    }
    resp = await payDataUpdate({ shopId: q.shopId, orderId: q.orderId, body })
    if (resp.err) throw Error(resp.err.message)

    const parsed = parseOrderData({ posName: d.posName, orderData: d.orderData })
    if (parsed.err) throw Error(parsed.err.message)

    const qStr = `?shopId=${q.shopId}&orderId=${q.orderId}`

    const orderInfo = {
      payId: orderIdUpperCase,
      orderAmt: parsed.orderAmt,
      orderName: parsed.orderName,
      returnUrl: returnUrl + qStr,
      siteCd,
      param_opt_1: q.shopId || '',
      param_opt_2: q.orderId || '',
      param_opt_3: parsed.orderName || '',
    }

    res.render('kcp/trade_reg', { orderInfo });
  } catch (e) {
    if (debug) console.log(e)
    res.render('ERROR-404', { err: { message: e.message } });
  }
});

// 
// MOBILE 거래등록 API
// 
router.post('/kcp/kcp_api_trade_reg', async function (req, res) {
  try {
    if (debug) logReqBody(req.body)

    // 
    // 신용카드만 처리함
    // 
    const actionResult = "card"
    const payMethod = "CARD"
    const van_code = ""

    const post_data = { actionResult, van_code };

    // 거래등록 API REQ DATA
    const req_data = createReqData_kcpApiTradeReg(req, payMethod)
    let resp = await kcpTradeRegister({ body: JSON.stringify(req_data) })

    res.render('kcp/kcp_api_trade_reg', {
      req_data: req_data,
      res_data: resp,
      post_data: post_data
    });
  } catch (e) {
    res.render('ERROR-404', { err: { message: e.message } });
  }
});

// 주문페이지 이동 및 Ret_URL 처리(MOBILE)
router.post('/kcp/order_mobile', function (req, res) {
  try {
    if (debug) logReqBody(req.body)

    const res_cd = getParam(req.body.res_cd);
    let post_data = {}
    if (res_cd == '0000') {
      post_data = createPostData_orderMobile(req)
    } else {
      post_data = {
        res_cd: res_cd, // 응답 코드         
        res_msg: getParam(req.body.res_msg) // 응답 메세지
      };
    }

    res.render('kcp/order_mobile', {
      post_data: post_data
    });
  } catch (e) {
    res.render('ERROR-404', { err: { message: e.message } });
  }
});

// 결제요청 API (자동취소 로직 추가)
router.post('/kcp_api_pay', async function (req, res) {
  try {
    console.log("req.body")
    if (debug) logReqBody(req.body)

    const shopId = req.body.param_opt_1
    const orderId = req.body.param_opt_2
    // console.log(shopId, orderId, payId)

    let resPayData = await payDataGet({ shopId, orderId })
    if (resPayData.err) throw Error(resPayData.err.message)
    const payData = resPayData.result.Item

    console.log('payData', payData)

    // 결제 REQ DATA
    const req_data = createReqData_kcpApiPay(req)
    let resPayRequest = await kcpRequestPayment({ body: JSON.stringify(req_data) })

    console.log("resPayRequest", resPayRequest)

    let bSucc = "" // DB 작업 실패 또는 금액 불일치의 경우 "false" 로 세팅

    /** @TODO pay request Error 처리 추가할 것 */
    if (resPayRequest.res_cd !== "0000") bSucc = "false"
    // if (resPayRequest.res_cd === "S006") bSucc = "false" // 거래금액 불일치 code === S006
    // if(resPayRequest.res_cd==="S006") bSucc = "false" // DB 작업 실패 code????

    // 
    // 결제요청 실패 처리
    //
    if (bSucc === "false") return cancelPayment_kcpApiPay(req, res, resPayRequest)

    // 
    // 결제요청 성공 처리
    //

    /** @TODO oder with pay info */
    let resSendOrder = await sendOrder({ 
      posName: payData.posName, 
      ver: payData.ver, 
      orderData: payData.orderData,
      payInfo: resPayRequest
    })

    /** @TODO 에러시 orderpayCancel */
    if (resSendOrder.err) throw Error(resSendOrder.err.message)
    console.log("resSendOrder", resSendOrder)

    let resPayUpdate = await payDataUpdate({
      shopId, orderId, body: {
        payData: JSON.stringify(resPayRequest),
        payStatus: true,
        orderStatus: true
      }
    }) 
    /** 
     * @TODO payDataUpdate 에러는 스킵 > 직원에게 문의 메시지 
     *  payData, payStatus 데이터가 payRecord table에 존재하지 않음
     */
    if (resPayUpdate.err) throw Error(resPayUpdate.err.message)


    res.render('kcp_api_pay', {
      req_data: JSON.stringify(req_data),
      res_data: JSON.stringify(resPayRequest),
      data: resPayRequest,
      use_pay_method: getParam(req.body.use_pay_method),
      ordr_idxx: getParam(req.body.ordr_idxx),
      cash_yn: getParam(req.body.cash_yn),
      cash_tr_code: getParam(req.body.cash_tr_code),
      bSucc: bSucc
    });

  } catch (e) {
    res.render('ERROR-404', { err: { message: e.message } });
  }
});

function logReqBody(body) {
  const _body = { ...body }
  delete _body.enc_info
  delete _body.enc_data
  console.table(_body)
}

function createReqData_kcpApiTradeReg(req, payMethod) {
  return {
    site_cd: getParam(req.body.site_cd),
    kcp_cert_info: KCP_CERT_INFO,
    ordr_idxx: getParam(req.body.ordr_idxx),
    good_mny: getParam(req.body.good_mny),
    good_name: getParam(req.body.good_name),
    // pay_method: getParam(req.body.pay_method),
    pay_method: payMethod,
    Ret_URL: getParam(req.body.Ret_URL),
    escw_used: 'N',
    user_agent: '',
    param_opt_1: req.body.param_opt_1 || '',
    param_opt_2: req.body.param_opt_2 || '',
    param_opt_3: req.body.param_opt_3 || '',
  }
}

function createPostData_orderMobile(req) {
  const enc_info = getParam(req.body.enc_info);
  let post_data = {}

  // 
  // 1. order_mobile 첫번째 처리
  // enc_info 값이 없을 경우 POST DATA 처리 후 order_mobile 이동
  // 
  if (enc_info == '') {
    post_data = {
      approvalKey: getParam(req.body.approvalKey),
      traceNo: getParam(req.body.traceNo),
      PayUrl: getParam(req.body.PayUrl),
      pay_method: getParam(req.body.pay_method),
      actionResult: getParam(req.body.ActionResult),
      Ret_URL: getParam(req.body.Ret_URL),
      van_code: getParam(req.body.van_code),
      site_cd: getParam(req.body.site_cd),
      ordr_idxx: getParam(req.body.ordr_idxx),
      good_name: getParam(req.body.good_name),
      good_mny: getParam(req.body.good_mny)
    };
  }

  // 
  // 2. order_mobile 두 번째 처리
  // enc_info 값이 있을 경우 결제 진행(결제인증 후 Ret_URL처리)    
  // 
  else {
    const use_pay_method = getParam(req.body.use_pay_method);
    post_data = {
      req_tx: getParam(req.body.req_tx), // 요청 종류         
      res_cd: getParam(req.body.res_cd), // 응답 코드
      site_cd: getParam(req.body.site_cd), // 사이트코드       
      tran_cd: getParam(req.body.tran_cd), // 트랜잭션 코드     
      ordr_idxx: getParam(req.body.ordr_idxx), // 쇼핑몰 주문번호   
      good_name: getParam(req.body.good_name), // 상품명            
      good_mny: getParam(req.body.good_mny), // 결제 금액       
      buyr_name: getParam(req.body.buyr_name), // 주문자명          
      buyr_tel1: getParam(req.body.buyr_tel1), // 주문자 전화번호   
      buyr_tel2: getParam(req.body.buyr_tel2), // 주문자 핸드폰 번호
      buyr_mail: getParam(req.body.buyr_mail), // 주문자 E-mail 주소
      use_pay_method: getParam(req.body.use_pay_method), // 결제 방법          
      enc_info, // 암호화 정보       
      enc_data: getParam(req.body.enc_data), // 암호화 데이터     
      // param_opt_1: '', // 기타 파라메터 추가 부분
      // param_opt_2: '', // 기타 파라메터 추가 부분
      param_opt_1: req.query?.shopId || '',
      param_opt_2: req.query?.orderId || '',
      param_opt_3: '',  // 기타 파라메터 추가 부분
    };

    // 현금영수증 관련 데이터 처리(결제수단:가상계좌,계좌이체,포인트)
    if (use_pay_method == '010000000000' || use_pay_method == '001000000000' || use_pay_method == '000100000000') {
      post_data.cash_yn = getParam(req.body.cash_yn);

      // cash_yn(현금영수증발급여부) == 'Y' 인 경우
      if (getParam(req.body.cash_yn) == 'Y') {
        post_data.cash_tr_code = getParam(req.body.cash_tr_code);
      }
    }
  }

  return post_data
}

function createReqData_kcpApiPay(req) {
  return {
    tran_cd: getParam(req.body.tran_cd),
    site_cd: getParam(req.body.site_cd),
    kcp_cert_info: KCP_CERT_INFO,
    enc_data: getParam(req.body.enc_data),
    enc_info: getParam(req.body.enc_info),
    // ordr_mony: '1', // 결제요청금액   ** 1 원은 실제로 업체에서 결제하셔야 될 원 금액을 넣어주셔야 합니다. 결제금액 유효성 검증 **
    ordr_mony: req.body.good_mny
  };
}

async function cancelPayment_kcpApiPay(req, res, resPayRequest) {
  const site_cd = getParam(req.body.site_cd)

  /** @TODO 인즌서 검증 오류 문의 필요 - resPayRequest.tno undefined 임 */
  // const tno = resPayRequest.tno;
  const tno = getParam(resPayRequest.tno);
  const mod_type = 'STSC';

  const cancel_sign_data = site_cd + '^' + tno + '^' + mod_type;
  const kcp_sign_data = await make_sign_data(cancel_sign_data);

  const req_data_cancel = {
    site_cd,
    tno,
    kcp_cert_info: KCP_CERT_INFO,
    kcp_sign_data,
    mod_type,
    mod_desc: resPayRequest.res_msg
  };

  const respCancel = await kcpCancelPayment({ body: JSON.stringify(req_data_cancel) })
  res.render('kcp_api_pay', {
    req_data: JSON.stringify(req_data_cancel),
    res_data: JSON.stringify(respCancel),
    data: resPayRequest,
    bSucc: "false"
  });
}

export default router;
