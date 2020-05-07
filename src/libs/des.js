import cryptoJs from "crypto-js";

/**
 * @description des加密
 */
export const encryptDes = (message, key, iv) => {
  let keyHex = cryptoJs.enc.Utf8.parse(key)
  let ivHex = cryptoJs.enc.Utf8.parse(iv)
  let option = { iv: ivHex, mode: cryptoJs.mode.CBC, padding: cryptoJs.pad.Pkcs7 }
  let encrypted = cryptoJs.DES.encrypt(message, keyHex, option)
  return encrypted.ciphertext.toString()
}

/**
 * @description des解密
 */
export const decryptDes = (message, key, iv) => {
  let keyHex = cryptoJs.enc.Utf8.parse(key)
  let ivHex = cryptoJs.enc.Utf8.parse(iv)
  let decrypted = cryptoJs.DES.decrypt(
    {
      ciphertext: cryptoJs.enc.Hex.parse(message)
    },
    keyHex,
    {
      iv: ivHex,
      mode: cryptoJs.mode.CBC,
      padding: cryptoJs.pad.Pkcs7
    }
  )
  return decrypted.toString(cryptoJs.enc.Utf8)
}

//十六进制字符串转为base64
export const sha1_to_base64 = sha1 => {
  let digits="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64_rep = "";
  let bit_arr = 0;
  let bit_num = 0;
  let ascv = null;
  for(let n = 0; n < sha1.length; ++n) {
    if(sha1[n] >= 'A' && sha1[n] <= 'Z') {
      ascv = sha1.charCodeAt(n) - 55;
    } else if(sha1[n] >= 'a' && sha1[n] <= 'z') {
      ascv = sha1.charCodeAt(n) - 87;
    } else {
      ascv = sha1.charCodeAt(n) - 48;
    }
    bit_arr = (bit_arr << 4) | ascv;
    bit_num += 4;
    if(bit_num >= 6) {
      bit_num -= 6;
      base64_rep += digits[bit_arr >>> bit_num];
      bit_arr &= ~(-1 << bit_num);
    }
  }
  if(bit_num > 0) {
    bit_arr <<= 6 - bit_num;
    base64_rep += digits[bit_arr];
  }
  let padding = base64_rep.length % 4;
  if(padding > 0) {
    for(let n = 0; n < 4 - padding; ++n) {
      base64_rep += "=";
    }
  }
  return base64_rep;
}
