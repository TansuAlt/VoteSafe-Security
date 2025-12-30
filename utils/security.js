const crypto = require('crypto');
require('dotenv').config();

const SECRET = process.env.HMAC_SECRET;

// 1. Veriyi İmzala (HMAC Oluştur)
const signData = (data) => {
    return crypto
        .createHmac('sha256', SECRET)
        .update(data)
        .digest('hex');
};

// 2. İmzayı Doğrula (Timing Attack Korumalı)
const verifySignature = (originalData, providedSignature) => {
    const expectedSignature = signData(originalData);
    
    const source = Buffer.from(expectedSignature);
    const target = Buffer.from(providedSignature);

    if (source.length !== target.length) {
        return false;
    }

    // crypto.timingSafeEqual: İşlem süresine bakarak şifre çözmeyi engeller
    return crypto.timingSafeEqual(source, target);
};

module.exports = { signData, verifySignature };