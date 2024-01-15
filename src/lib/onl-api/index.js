import axios from "axios";
import { debug, ec2Debug, apiEndpoint } from "../../settings/conf.js";

const apiserverUrl = ec2Debug ? apiEndpoint.dev : apiEndpoint.prod
const apiKey = apiEndpoint.apiKey

const axiosCall = async ({ method, path, body }) => {
  try {
    const baseUrl = apiserverUrl

    let res = await axios({
      method,
      url: baseUrl + path,
      data: body,
      headers: { 'x-taptag-key': apiKey }
    });

    if (res.status !== 200) throw new Error("Response Error");
    return res.data;
  } catch (e) {
    return { err: { message: e.message } };
  }
}

export const payDataGet = ({ shopId, orderId }) => {
  const path = `/payment/pay-record?shopId=${shopId}&orderId=${orderId}`;
  return axiosCall({ method: "GET", path });
};

export const payDataUpdate = ({ shopId, orderId, body }) => {
  const path = `/payment/pay-record?shopId=${shopId}&orderId=${orderId}`;
  return axiosCall({ method: "PUT", path, body });
};

export const payDataDel = ({ shopId, orderId }) => {
  if (!debug) return { err: { message: "INVALID REQUEST" } }
  const path = `/payment/pay-record?shopId=${shopId}&orderId=${orderId}`;
  return axiosCall({ method: "DELETE", path });
};

export const unionposProxy2 = async ({apiName, body, ver}) => {
  let path = `/pos/unionpos?apiName=${apiName}`;
  return await axiosCall({ method: "POST", path, body });
}