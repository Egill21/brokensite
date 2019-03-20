const users = require('./users');
const validator = require('validator');

const isEmpty = s => s != null && !s;

async function validateUser({ username, password, email }, patch = false) {
  const validationMessages = [];

  // can't patch username
  if (!patch) {
    const m = 'Username is required, must be at least three letters and no more than 32 characters';
    if (typeof username !== 'string' || username.length < 3 || username.length > 32) {
      validationMessages.push({ field: 'username', message: m });
    }

    const user = await users.findByUsername(username);

    if (user) {
      validationMessages.push({
        field: 'username',
        message: 'Username is already registered',
      });
    }
  }

  if (!patch || password || isEmpty(password)) {
    if (typeof password !== 'string' || password.length < 6) {
      validationMessages.push({
        field: 'password',
        message: 'Password must be at least six letters',
      });
    }
  }

  if (!patch || email || isEmpty(email)) {
    if (typeof email !== 'string' || !validator.isEmail(String(email))) {
      validationMessages.push({
        field: 'email',
        message: 'Email is not valid.',
      });
    }
  }

  return validationMessages;
}

async function validateAdmin(admin) {
  const validationMessage = [];
  if (typeof admin !== 'boolean') {
    validationMessage.push({
      field: 'admin',
      message: 'admin must be a boolean value',
    });
  }
  return validationMessage;
}


module.exports = {
  validateUser,
  validateAdmin,
};