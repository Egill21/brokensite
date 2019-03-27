const express = require('express');
const { requireAuth, requireAdminAuth } = require('../auth');

const router = express.Router();

const {
  usersRoute,
  userRoute,
  updateAdminRoute,
  meRoute,
  mePatchRoute
} = require('./users');

const {
  productsRoute,
  productRoute,
  productPatchRoute,
  productDeleteRoute,
  newProductRoute,
  categoriesRoute,
  categoriesPostRoute,
  categoryPatchRoute,
  categoryDeleteRoute
} = require('./products/products');

const {
  cartPostRoute,
  cartRoute,
  cartChange,
  cartItemDelete,
  ordersRoute,
  ordersPostRoute,
  orderRoute,
  cartLineRoute
} = require('./cart/cart');

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function indexRoute(req, res) {
  return res.json({
    users: {
      users: '/users',
      user: '/users/{id}',
      register: '/users/register',
      login: '/users/login',
      me: '/users/me'
    },
    products: {
      products: '/products',
      productsFiltered: '/products?category={category}',
      productsSearch: '/products?search={query}',
      product: '/products/{id}',
      categories: '/categories',
      category: '/categories/{id}'
    },
    cart: {
      cart: '/cart',
      line: '/cart/line/{id}',
      orders: '/orders',
      order: '/orders/{id}'
    }
  });
}

router.get('/', indexRoute);

router.get('/users', requireAdminAuth, catchErrors(usersRoute));
router.get('/users/me', requireAuth, catchErrors(meRoute));
router.patch('/users/me', requireAuth, catchErrors(mePatchRoute));
router.get('/users/:id', requireAdminAuth, catchErrors(userRoute));
router.patch('/users/:id', requireAdminAuth, catchErrors(updateAdminRoute));

router.get('/products', catchErrors(productsRoute));
router.post('/products', requireAdminAuth, catchErrors(newProductRoute));
router.get('/products/:id', catchErrors(productRoute));
router.patch('/products/:id', requireAdminAuth, catchErrors(productPatchRoute));
router.delete('/products/:id', requireAdminAuth, catchErrors(productDeleteRoute));
router.get('/categories', catchErrors(categoriesRoute));
router.post('/categories', requireAdminAuth, catchErrors(categoriesPostRoute));
router.patch('/categories/:id', requireAdminAuth, catchErrors(categoryPatchRoute));
router.delete('/categories/:id', requireAdminAuth, catchErrors(categoryDeleteRoute));

router.post('/cart', requireAuth, catchErrors(cartPostRoute));
router.get('/cart', requireAuth, catchErrors(cartRoute));
router.patch('/cart/line/:id', requireAuth, catchErrors(cartChange));
router.delete('/cart/line/:id', requireAuth, catchErrors(cartItemDelete));
router.get('/cart/line/:id', requireAuth, catchErrors(cartLineRoute));

router.get('/orders', requireAuth, catchErrors(ordersRoute));
router.post('/orders', requireAuth, catchErrors(ordersPostRoute));
router.get('/orders/:id', requireAuth, catchErrors(orderRoute));

module.exports = router;
