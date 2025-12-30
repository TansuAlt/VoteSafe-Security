const db = require('../config/db');

class PollModel {
  // Anket Oluşturma (Eski kodun aynısı)
  static async createPollWithOptions(question, options, deadline) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      const pollRes = await client.query(
        'INSERT INTO polls (question, deadline) VALUES ($1, $2) RETURNING id',
        [question, deadline]
      );
      const pollId = pollRes.rows[0].id;

      for (const opt of options) {
        await client.query(
          'INSERT INTO options (poll_id, option_text) VALUES ($1, $2)',
          [pollId, opt]
        );
      }
      await client.query('COMMIT');
      return { id: pollId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // YENİ: Anketi ve Seçenekleri Getir
  static async getPollById(pollId) {
    const pollRes = await db.query('SELECT * FROM polls WHERE id = $1', [pollId]);
    if (pollRes.rows.length === 0) return null;

    const optionsRes = await db.query('SELECT * FROM options WHERE poll_id = $1', [pollId]);
    
    return {
      ...pollRes.rows[0],
      options: optionsRes.rows
    };
  }

  // YENİ: Oy Kullan
  static async castVote(pollId, optionId, ipAddress) {
    await db.query(
      'INSERT INTO votes (poll_id, option_id, ip_address) VALUES ($1, $2, $3)',
      [pollId, optionId, ipAddress]
    );
  }
}

module.exports = PollModel;