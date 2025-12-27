const db = require('../config/db');

class PollModel {
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
}
module.exports = PollModel;