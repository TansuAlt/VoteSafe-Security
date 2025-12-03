const { verifySignature } = require('../utils/security');

const validateToken = (req, res, next) => {
    // URL'den parametreleri al: ?id=5&ts=1715...&sig=abc...
    const { id, ts, sig } = req.query;

    if (!id || !ts || !sig) {
        return res.status(400).json({ error: 'Eksik parametre. Link geçersiz.' });
    }

    // İmzayı kontrol etmek için veriyi tekrar birleştir
    const dataToCheck = `${id}:${ts}`;

    // Helper fonksiyonumuzu kullanarak kontrol et
    const isValid = verifySignature(dataToCheck, sig);

    if (!isValid) {
        // Güvenlik Uyarısı
        return res.status(403).json({ error: 'Erişim reddedildi: Link manipüle edilmiş!' });
    }

    // Opsiyonel: Link süresi dolmuş mu kontrolü (Örn: 30 dk)
    const linkAge = Date.now() - parseInt(ts);
    if (linkAge > 30 * 60 * 1000) { 
        return res.status(403).json({ error: 'Linkin süresi dolmuş.' });
    }

    // Her şey temiz, geçebilir
    next();
};

module.exports = validateToken;