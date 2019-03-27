const bcrypt = require('bcrypt');
const { query, conditionalUpdate } = require('./db');
const xss = require('xss');

async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);

  return result;
}

async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function findById(id) {
  if (!Number.isInteger(Number(id))) {
    return null;
  }

  const q = 'SELECT * FROM users WHERE id = $1';

  const result = await query(q, [id]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function findByEmail(email) {
  const q = 'SELECT * FROM users WHERE email = $1';
  const result = await query(q, [email]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function createUser(username, password, email) {
  const hashedPassword = await bcrypt.hash(password, 11);
  console.log(hashedPassword);
  const q = `
    INSERT INTO
      users (username, password, email)
    VALUES
      ($1, $2, $3)
    RETURNING *`;

  const result = await query(q, [xss(username), hashedPassword, xss(email)]);

  return result.rows[0];
}

async function updateUser(id, password, email) {
  if (!Number.isInteger(Number(id))) {
    return null;
  }

  const isset = f => typeof f === 'string' || typeof f === 'number';

  const fields = [
    isset(password) ? 'password' : null,
    isset(email) ? 'email' : null,
  ];

  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 11);
  }

  const values = [
    hashedPassword,
    isset(email) ? xss(email) : null,
  ];

  const result = await conditionalUpdate('users', id, fields, values);

  if (!result) {
    return null;
  }

  return result.rows[0];
}

async function updateAdmin(id, admin) {
  if (!Number.isInteger(Number(id))) {
    return null;
  }

  const q = `
    UPDATE users 
    SET admin = $1
    WHERE id = $2
    RETURNING *
  `;

  const result = await query(q, [admin, xss(id)]);

  return result.rows[0];
}

module.exports = {
  comparePasswords,
  findByUsername,
  findById,
  findByEmail,
  createUser,
  updateUser,
  updateAdmin,
};