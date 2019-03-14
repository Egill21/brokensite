const xss = require('xss');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { query } = require('../db');

/**
 * Athugar hvort strengur sé "tómur", þ.e.a.s. `null`, `undefined`.
 *
 * @param {string} s Strengur til að athuga
 * @returns {boolean} `true` ef `s` er "tómt", annars `false`
 */
function isEmpty(s) {
  return s == null && !s;
}

/**
 * Staðfestir að todo item sé gilt. Ef verið er að breyta item sem nú þegar er
 * til, þá er `patching` sent inn sem `true`.
 *
 * @param {TodoItem} todo Todo item til að staðfesta
 * @param {boolean} [patching=false]
 * @returns {array} Fylki af villum sem komu upp, tómt ef engin villa
 */
async function validate({ username, email, password } = {}, patching = false) {
  const errors = [];
  const isNameTaken = await findByUsername(username);
  const isEmailAvailable = await findByEmail(email);

  if (isNameTaken) {
    errors.push({
      title: 'username',
      message: 'Notendanafnið er núþegar til, veldu annað'
    });
  }

  if (!isEmailAvailable) {
    errors.push({
      title: 'email',
      message: 'Netfang er núþegar í notkun, veldu annað'
    });
  }

  //if (!isEmpty(username)) {
  if (
    typeof username !== 'string' ||
    username.length < 1 ||
    username.length > 64
  ) {
    errors.push({
      field: 'username',
      message: 'Notendanafn verður að vera strengur sem er 1 til 64 stafir'
    });
  }
  //}

  if (!patching || !isEmpty(email)) {
    if (!validator.isEmail(String(email))) {
      errors.push({
        field: 'email',
        message: 'Netfang verður að vera gilt'
      });
    }
  }
  return errors;
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
    return false;
  }
  return true;
}

async function comparePasswords(hash, password) {
  const result = await bcrypt.compare(hash, password);

  return result;
}

async function getUsers() {
  const q = 'SELECT * FROM users';
  const result = await query(q);
  return result.rows;
}

async function create(data) {
  const isVal = await validate(data);
  if (isVal.length !== 0) {
    return isVal;
  }
  const password = await bcrypt.hash(data.password, 11);
  const q =
    'INSERT INTO users(username, email, password) VALUES ($1, $2, $3) RETURNING *';
  const result = await query(q, [data.username, data.email, password]);

  return result.rows;
}

module.exports = {
  findById,
  findByUsername,
  create,
  getUsers,
  comparePasswords,
};
