const users = require('./users');
const validator = require('validator');
const {
  getProductByTitle,
  getProductById,
  getCategory
} = require('./api/products/productsUtils');

const isEmpty = s => s != null && !s;

async function validateUser({ username, password, email }, patch = false) {
  const validationMessages = [];

  // can't patch username
  if (!patch) {
    const m =
      'Username is required, must be at least three letters and no more than 32 characters';
    if (
      typeof username !== 'string' ||
      username.length < 3 ||
      username.length > 32
    ) {
      validationMessages.push({ field: 'username', message: m });
    }

    const user = await users.findByUsername(username);

    if (user) {
      validationMessages.push({
        field: 'username',
        message: 'Username is already registered'
      });
    }
  }

  if (!patch || password || isEmpty(password)) {
    if (typeof password !== 'string' || password.length < 6) {
      validationMessages.push({
        field: 'password',
        message: 'Password must be at least six letters'
      });
    }
  }

  if (!patch || email || isEmpty(email)) {
    if (typeof email !== 'string' || !validator.isEmail(String(email))) {
      validationMessages.push({
        field: 'email',
        message: 'Email is not valid.'
      });
    }
  }

  const userEmail = await users.findByEmail(email);

  if (userEmail) {
    validationMessages.push({
      field: 'email',
      message: 'Email is already registered'
    });
  }

  return validationMessages;
}

async function validateAdmin(admin) {
  const validationMessage = [];
  if (typeof admin !== 'boolean') {
    validationMessage.push({
      field: 'admin',
      message: 'admin must be a boolean value'
    });
  }
  return validationMessage;
}

async function validateProduct(
  { title, price, descr, category },
  patch = false
) {
  const validationMessages = [];

  const m =
    'Title is required, must be at least one letter and no more than 128 characters';
  if (!patch || title || isEmpty(title)) {
    if (typeof title !== 'string' || title.length < 1 || title.length > 128) {
      validationMessages.push({ field: 'title', message: m });
    }
    const product = await getProductByTitle(title);
    if (product.length !== 0) {
      validationMessages.push({
        field: 'title',
        message: 'Title already exists'
      });
    }
  }

  if (!patch || price || isEmpty(price)) {
    if (
      typeof price !== 'string' ||
      price.length < 1 ||
      !validator.matches(String(price), /^\d+(.\d{1,2})?$/)
    ) {
      validationMessages.push({
        field: 'price',
        message: 'Price must be a valid currency amount'
      });
    }
  }

  if (!patch || descr || isEmpty(descr)) {
    if (typeof descr !== 'string' || descr.length <= 0 || descr.length > 1500) {
      validationMessages.push({
        field: 'descr',
        message: 'Description must be a string of minimum 1 and maximum 1500.'
      });
    }
  }

  if (!patch || category || isEmpty(category)) {
    if (
      typeof category !== 'string' ||
      category.length <= 0 ||
      category.length > 128
    ) {
      validationMessages.push({
        field: 'category',
        message: 'Category must be a string of minimum 1 and maximum 128.'
      });
    }
  }

  if (!patch) {
    const cat = await getCategory(category);
    if (cat.length === 0) {
      validationMessages.push({
        field: 'category',
        message: 'Category does not exist'
      });
    }
  }
  return validationMessages;
}

async function validateCategory(title) {
  const validationMessage = [];

  if (title || isEmpty(title)) {
    if (typeof title !== 'string' || title.length < 1 || title.length > 128) {
      validationMessage.push({
        field: 'category',
        message:
          'Category must be a string of length at least 1 and maximum 128.'
      });
    }
  }
  return validationMessage;
}

async function validateCartPost(productId, amount) {
  const validationMessages = [];

  if (productId || isEmpty(productId) || typeof productId !== 'number') {
    if (typeof productId !== 'number') {
      validationMessages.push({
        field: 'productid',
        message: 'Product must be a number'
      });
    } else {
      const product = await getProductById(productId);
      if (!product) {
        validationMessages.push({
          field: 'productid',
          message: 'Product does not exist'
        });
      }
    }
  }
  if (isEmpty(amount) || typeof amount !== 'number' || amount < 1) {
    validationMessages.push({
      field: 'amount',
      message: 'Amount is required and has to be a number greater than 0'
    });
  }

  return validationMessages;
}

module.exports = {
  validateUser,
  validateAdmin,
  validateProduct,
  validateCategory,
  validateCartPost
};
