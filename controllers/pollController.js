const PollModel = require('../models/PollModel');
const { createPollSchema } = require('../validators/pollSchema');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Anket Oluşturma
exports.createPoll = async (req, res, next) => {
  try {
    const { error, value } = createPollSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { question, options, durationMinutes } = value;
    const deadline = new Date(Date.now() + durationMinutes * 60000);

    const newPoll = await PollModel.createPollWithOptions(question, options, deadline);

    const timestamp = Date.now();
    const signature = crypto.createHmac('sha256', process.env.HMAC_SECRET)
                            .update(`${newPoll.id}:${timestamp}`)
                            .digest('hex');
    
    // Frontend linki (Örnek: http://localhost:5173/vote?id=...&ts=...&sig=...)
    const voteLink = `http://localhost:5173/vote?id=${newPoll.id}&ts=${timestamp}&sig=${signature}`;
    logger.info(`Anket oluşturuldu: ${newPoll.id}`);

    res.status(201).json({ success: true, pollId: newPoll.id, link: voteLink });
  } catch (err) {
    next(err);
  }
};

// YENİ: Anketi Getir (HMAC Doğrulamalı)
exports.getPoll = async (req, res, next) => {
  try {
    const { id, ts, sig } = req.query;

    if (!id || !ts || !sig) {
      return res.status(400).json({ error: 'Eksik parametreler.' });
    }

    // HMAC Doğrulama (Güvenlik)
    const expectedSig = crypto.createHmac('sha256', process.env.HMAC_SECRET)
                              .update(`${id}:${ts}`)
                              .digest('hex');
    
    if (sig !== expectedSig) {
      return res.status(403).json({ error: 'Geçersiz veya değiştirilmiş link!' });
    }

    // Süre kontrolü (Opsiyonel: Link 24 saat geçerli olsun vb.)
    // if (Date.now() - ts > 86400000) return res.status(403).json({ error: 'Link süresi dolmuş.' });

    const poll = await PollModel.getPollById(id);
    if (!poll) return res.status(404).json({ error: 'Anket bulunamadı.' });

    res.status(200).json(poll);
  } catch (err) {
    next(err);
  }
};

// YENİ: Oy Kullan
exports.vote = async (req, res, next) => {
  try {
    const { pollId, optionId } = req.body;
    // Basit IP alma (Proxy arkasındaysa x-forwarded-for gerekir)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await PollModel.castVote(pollId, optionId, ip);
    
    logger.info(`Oy kullanıldı. Poll: ${pollId}, Option: ${optionId}`);
    res.status(200).json({ success: true, message: 'Oy kaydedildi.' });
  } catch (err) {
    next(err);
  }
};