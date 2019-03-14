/** @module api */

const express = require('express');
const users = require('./users/users');
const products = require('./products');
const cart = require('./cart');

const router = express.Router();

/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.use('/users', users);
router.use('/products', products);
router.use('/cart', cart);

router.get('/', (req, res) => {
  res.json({
    site: 'main site'
  });
});

module.exports = router;
