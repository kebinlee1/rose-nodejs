import axios from "axios";
import crypto from 'crypto';
import fs from 'fs'
import { readFile } from 'node:fs/promises'
import path from "path"
import { debug } from "../../settings/conf.js";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stage = "dev"

const urlsDev = {
  tradeRegister: "https://stg-spl.kcp.co.kr/std/tradeReg/register",
  requestPayment: "https://stg-spl.kcp.co.kr/gw/enc/v1/payment",
  cancelPayment: "https://stg-spl.kcp.co.kr/gw/mod/v1/cancel",
  returnUrl: "http://172.30.1.27:5050/kcp/order_mobile",
}

const urlsProd = {
  tradeRegister: "https://spl.kcp.co.kr/std/tradeReg/register",
  requestPayment: "https://spl.kcp.co.kr/gw/enc/v1/payment",
  cancelPayment: "https:/spl.kcp.co.kr/gw/mod/v1/cancel",
}

const axiosCall = async ({ url, method, body }) => {
  try {
    let res = await axios({
      method,
      url,
      data: body,
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.status !== 200) throw new Error(res.status + " - Response Error");
    return res.data;
  } catch (e) {
    return { err: { message: e.message } };
  }
}

export const kcpTradeRegister = ({ body }) => {
  const url = stage === "dev" ? urlsDev.tradeRegister : urlsProd.tradeRegister
  return axiosCall({ url, method: "POST", body });
};

export const kcpRequestPayment = ({ body }) => {
  const url = stage === "dev" ? urlsDev.requestPayment : urlsProd.requestPayment
  return axiosCall({ url, method: "POST", body });
};

export const kcpCancelPayment = ({ body }) => {
  const url = stage === "dev" ? urlsDev.cancelPayment : urlsProd.cancelPayment
  return axiosCall({ url, method: "POST", body });
};

export const CERT_INFO = '-----BEGIN CERTIFICATE-----MIIDgTCCAmmgAwIBAgIHBy4lYNG7ojANBgkqhkiG9w0BAQsFADBzMQswCQYDVQQGEwJLUjEOMAwGA1UECAwFU2VvdWwxEDAOBgNVBAcMB0d1cm8tZ3UxFTATBgNVBAoMDE5ITktDUCBDb3JwLjETMBEGA1UECwwKSVQgQ2VudGVyLjEWMBQGA1UEAwwNc3BsLmtjcC5jby5rcjAeFw0yMTA2MjkwMDM0MzdaFw0yNjA2MjgwMDM0MzdaMHAxCzAJBgNVBAYTAktSMQ4wDAYDVQQIDAVTZW91bDEQMA4GA1UEBwwHR3Vyby1ndTERMA8GA1UECgwITG9jYWxXZWIxETAPBgNVBAsMCERFVlBHV0VCMRkwFwYDVQQDDBAyMDIxMDYyOTEwMDAwMDI0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppkVQkU4SwNTYbIUaNDVhu2w1uvG4qip0U7h9n90cLfKymIRKDiebLhLIVFctuhTmgY7tkE7yQTNkD+jXHYufQ/qj06ukwf1BtqUVru9mqa7ysU298B6l9v0Fv8h3ztTYvfHEBmpB6AoZDBChMEua7Or/L3C2vYtU/6lWLjBT1xwXVLvNN/7XpQokuWq0rnjSRThcXrDpWMbqYYUt/CL7YHosfBazAXLoN5JvTd1O9C3FPxLxwcIAI9H8SbWIQKhap7JeA/IUP1Vk4K/o3Yiytl6Aqh3U1egHfEdWNqwpaiHPuM/jsDkVzuS9FV4RCdcBEsRPnAWHz10w8CX7e7zdwIDAQABox0wGzAOBgNVHQ8BAf8EBAMCB4AwCQYDVR0TBAIwADANBgkqhkiG9w0BAQsFAAOCAQEAg9lYy+dM/8Dnz4COc+XIjEwr4FeC9ExnWaaxH6GlWjJbB94O2L26arrjT2hGl9jUzwd+BdvTGdNCpEjOz3KEq8yJhcu5mFxMskLnHNo1lg5qtydIID6eSgew3vm6d7b3O6pYd+NHdHQsuMw5S5z1m+0TbBQkb6A9RKE1md5/Yw+NymDy+c4NaKsbxepw+HtSOnma/R7TErQ/8qVioIthEpwbqyjgIoGzgOdEFsF9mfkt/5k6rR0WX8xzcro5XSB3T+oecMS54j0+nHyoS96/llRLqFDBUfWn5Cay7pJNWXCnw4jIiBsTBa3q95RVRyMEcDgPwugMXPXGBwNoMOOpuQ==-----END CERTIFICATE-----';

// 서명데이터 생성 예제
export async function make_sign_data(data) {
  // 개인키 READ
  // "splPrikeyPKCS8.pem" 은 테스트용 개인키
  // "changeit" 은 테스트용 개인키비밀번호
  // var key_file = fs.readFileSync('C:\\...\\node_kcp_api_pay_sample\\certificate\\splPrikeyPKCS8.pem').toString();

  const filePath = path.resolve(__dirname, './certificate/splPrikeyPKCS8.pem')
  console.log('filePath', filePath)

  // var key_file = fs.readFileSync(filePath).toString();
  const key_file = await readFile(filePath, 'utf-8');
  const password = 'changeit';

  // 서명데이터생성
  return crypto.createSign('sha256').update(data).sign({
    format: 'pem',
    key: key_file,
    passphrase: password
  }, 'base64');
}

export const returnUrl = urlsDev.returnUrl

export const siteCd = "T0000"

export function getQueryString({ qs }) {
  return `?shopId=${qs.shopId}&orderId=${qs.orderId}`
}