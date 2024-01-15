import { isJson } from "../utils.js"
import { debug } from "../../settings/conf.js";

const pos = {
  "UNIONPOS": { parseOrderData: parseOrderDataUnionpos, }
}

const posList = Object.keys(pos)


export function parseOrderData({ posName, ...rest }) {
  if (!posList.includes(posName)) return { err: { message: "INVALID POSNAME" } };
  return pos[posName].parseOrderData({ ...rest })
}

function parseOrderDataUnionpos({ orderData }) {
  try {
    if (!isJson(orderData)) throw Error("INVALID DATA TYPE")
    const d = JSON.parse(orderData)
    if(debug) console.log('orderData', d)

    // let totalAmt = 0;
    // d.OrderData.map(o => {
    //   totalAmt += parseInt(o.Qty) * (o.Price)
    //   return null
    // })
        
    return { totalAmt: d.orderAmt, orderAmt: d.orderAmt, orderName: d.orderName }
  } catch (e) {
    return { err: { message: e.message } }
  }
}