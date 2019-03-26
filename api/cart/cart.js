const {
  addToCart,
  getCart,
  changeAmount,
  deleteCartItem,
  getOrders,
  makeOrder,
  getCartLine
} = require('./cartUtils');
const { getProductById } = require('../products/productsUtils');
const {
  validateCartPost,
  validateCartPatch,
  validateId
} = require('../../validation');

async function cartRoute(req, res) {
  const { id } = req.user;
  const cart = await getCart(id);
  return res.json(cart);
}

async function cartPostRoute(req, res) {
  const { productId, amount } = req.body;
  const { id } = req.user;

  const validationMessage = await validateCartPost(productId, amount);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }

  const items = await addToCart(id, productId, amount);
  const product = await getProductById(productId);
  items.product = product;
  return res.json(items);
}

async function cartLineRoute(req, res) {
  const userid = req.user.id;
  const { id } = req.params;

  const validationMessage = await validateId(id);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }
  const result = await getCartLine(userid, id);
  console.log(result);
  if (result.error) {
    return res.status(404).json({ errors: result.error });
  }
  return res.json(result);
}

async function cartChange(req, res) {
  const userid = req.user.id;
  const { id } = req.params;
  const { amount } = req.body;

  const validationMessage = await validateCartPatch(amount);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }
  const items = await changeAmount(userid, id, amount);
  if (items.error) {
    return res.status(404).json(items);
  }
  return res.status(200).json(items);
}

async function cartItemDelete(req, res) {
  const userid = req.user.id;
  const { id } = req.params;
  const validationMessage = await validateId(id);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }
  const result = await deleteCartItem(userid, id);

  if (result.error) {
    return res.status(404).json(result);
  }
  return res.status(200).json(result);
}

async function ordersRoute(req, res) {
  const { id, admin } = req.user;
  const { offset = 0 } = req.query;

  const orders = await getOrders(id, admin, offset);
  return res.json(orders);
}

async function ordersPostRoute(req, res) {
  const { id } = req.user;
  const { order } = req.body;

  const changeToOrder = order === true ? '1' : '0';

  if (changeToOrder !== '1') {
    return res.status(400).json({
      error: {
        field: 'order',
        message: `To create order, order must be equal to 'true'`,
      }
    });
  }

  const result = await makeOrder(changeToOrder, id);

  if (!result) {
    const message = 'You dont have anything in your cart';
    return res.status(404).json({ error: message });
  }
  return res.json(result);
}

module.exports = {
  cartRoute,
  cartPostRoute,
  cartChange,
  cartItemDelete,
  ordersRoute,
  ordersPostRoute,
  cartLineRoute
};
