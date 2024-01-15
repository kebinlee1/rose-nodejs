import path from 'path';
import { networkInterfaces } from 'os';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getIP = function () {
  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  return results;
}

/**
 *
 * @param {Buffer | ByteArray} arr
 * @returns String
 */
export function numArray2hexStr(arr) {
  let str = "";
  arr.map(num => str += num.toString(16).toUpperCase().padStart(2, '0'));
  return str;
}

/**
 *
 * @param {String} hexStr
 * @returns ByteArray
 */
export function hexStr2NumArray(hexStr) {
  const hexArr = hexStr.match(/.{1,2}/g);
  return hexArr.map(item => parseInt(item, 16));
}

/**
 *
 * @param {*} length random Id의 길이, default 20
 *  알파벳 대문자, 소문자, 숫자, "=", "-", "_" 무작위 선택
 * @returns
 */
export const randomid = (length = 20) => {
  // const characters = "=ABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789-abcdefghijklmnopqrstuvwxyz";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const loc = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(loc);
  }
  return result;
};

export const random6No = (length = 6) => {
  const characters = "0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const loc = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(loc);
  }
  return result;
};

export const isJson = (str) => {
  try {
    var json = JSON.parse(str);
    return typeof json === "object";
  } catch (e) {
    return false;
  }
};

export function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms || 100)
  });
}

export function isEmpty(val) {
  if(val===undefined) return true
  if(val==="undefined") return true
  if(val==="") return true
  return false
}

export function getParam(val) {
  if (val == undefined || val == null || val == 'undefined') val = '';
  return val;
}
