import { unionposProxy2 } from "../onl-api/index.js";
import { isJson } from "../utils.js"
import { debug } from "../../settings/conf.js";

const pos = {
  "UNIONPOS": { sendOrder: sendOrderUnionpos, }
}

const posList = Object.keys(pos)


export function sendOrder({ posName, ...rest }) {
  if (!posList.includes(posName)) return { err: { message: "INVALID POSNAME" } };
  return pos[posName].sendOrder({ ...rest })
}

async function sendOrderUnionpos({ orderData, ver, payInfo }) {
  try {
    if (!isJson(orderData)) throw Error("INVALID ORDERDATA")
    const oData = JSON.parse(orderData)

    const newOrderData = addPayInfoToOrderData(oData, payInfo)

    console.log("orderData", oData)
    
    const res = await unionposProxy2({
      apiName: 'orderPay',
      body: {...newOrderData },
      ver
    });

    if (res.err) throw Error(res.err.message)
    if (res.result?.CODE?.includes("E"))
      throw Error(`${res.result.CODE} - ${res.result.MSG}`)

    return res
  } catch (e) {
    return { err: { message: e.message } }
  }
}

function addPayInfoToOrderData(orderData, payInfo) {
  const paymentArray = [
    {
      "PayType": "CARD",                      //카드 : CARD 또는 빈값
      "TerminalID": "",                       //터미널아이디 / 단말기번호
      "PermitNo": payInfo.app_no,             // 승인번호
      "TranDate": payInfo.van_apptime,        // 승인 일시 (yyyyMMddhhmmss)
      "TotalAmt": payInfo.amount,             // 결제금액
      "VAT": payInfo.res_vat_mny,        // 부가세 
      "Buyer": payInfo.acuq_name,          // 매입사/발급사   (ex, 비씨카드)
      "Issuer": payInfo.card_name,          // 공급사/카드사   (ex, 우리카드) 
      "Installment": "00",                    // 할부개월수 (00, 01, 02 ...) 일시불(00) -> payInfo.noinf, payInfo.quota 참고
      "MerchantID": "",                       // 카드사 가맹점 번호
      "CardNo": payInfo.card_no,            // 마스킹된 카드번호
      "Msg": payInfo.res_msg,            // 메시지
      "VanSel": payInfo.van_cd,
    }

  ]
  return {
    ...orderData,
    "PaymentArray": paymentArray
  }
}