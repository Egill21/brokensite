
const { 
  findById,
  updateUser,
  updateAdmin,
  } = require('../users');
const { query, paged } = require('../db');
const { validateUser, validateAdmin } = require('../validation');


// leyfum abstraction sem users.js gefur okkur að leka aðeins hérna
async function usersRoute(req, res) {
  const { offset = 0 } = req.query;
  const users = await paged('SELECT * FROM users', { offset });

  users.items.map((i) => {
    delete i.password; // eslint-disable-line
    return i;
  });

  return res.json(users);
}

async function userRoute(req, res) {
  const { id } = req.params;

  const user = await findById(id);

  if (user === null) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete user.password;

  return res.json(user);
}

async function meRoute(req, res) {
  const { id } = req.user;

  const user = await findById(id);

  if (user === null) {
    return res.status(404).json({ error: 'You not found' });
  }

  delete user.password;

  return res.json(user);
}

async function mePatchRoute(req, res) {
  const { id } = req.user;

  const user = await findById(id);

  if (user === null) {
    return res.status(404).json({ error: 'You not found' });
  }

  const { password, email } = req.body;

  const validationMessage = await validateUser({ password, email }, true);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }

  const result = await updateUser(id, password, email);

  if (!result) {
    return res.status(400).json({ error: 'Nothing to patch' });
  }

  delete result.password;
  return res.status(200).json(result);
}

async function updateAdminRoute(req, res) {
  const { id } = req.params;
  const { admin } = req.body;

  const user = await findById(id);

  if (user === null) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete user.password;

  const validationMessage = await validateAdmin(admin);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }

  const result = await updateAdmin(id, admin);

  return res.status(200).json(result);

}


module.exports = {
  usersRoute,
  userRoute,
  meRoute,
  mePatchRoute,
  updateAdminRoute,
};
