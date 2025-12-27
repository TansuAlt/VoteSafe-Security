const PollModel = require('../models/PollModel');
const { createPollSchema } = require('../validators/pollSchema');
const crypto = require('crypto');
const logger = require('../utils/logger');

exports.createPoll = async (req, res, next) => {
  try {
    const { error, value } = createPollSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { question, options, durationMinutes } = value;
    const deadline = new Date(Date.now() + durationMinutes * 60000);

    const newPoll = await PollModel.createPollWithOptions(question, options, deadline);

    // HMAC İmza (Scrum 2)
    const timestamp = Date.now();
    const signature = crypto.createHmac('sha256', process.env.HMAC_SECRET)
                            .update(`${newPoll.id}:${timestamp}`)
                            .digest('hex');
    
    const voteLink = `/vote?id=${newPoll.id}&ts=${timestamp}&sig=${signature}`;
    logger.info(`Anket oluşturuldu: ${newPoll.id}`);

    res.status(201).json({ success: true, pollId: newPoll.id, link: voteLink });
  } catch (err) {
    next(err);
  }
};