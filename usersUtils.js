const xss = require('xss');
const validator = require('validator');
const { query } = require('./db');

async function get(id) {
  if (id) {
    const q = `SELECT * FROM users WHERE id = ${id}`;
    const result = await query(q);
    return result;
  }
  const q = 'SELECT * FROM users';
  const result = await query(q);
  return result;
}

module.exports = {
  get
};
