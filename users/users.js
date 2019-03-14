/** @module users */

const express = require('express');
const { get } = require('./usersUtils');

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

async function users(req, res) {
  const result = await get();
  return res.json(result.rows);
}

async function getUser(req, res) {
  const { id } = req.params;
  const result = await get(id);
  return res.json(result.rows);
}

router.get('/', users);

router.get('/:id', getUser);

module.exports = router;
