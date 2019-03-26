const { paged, query, conditionalUpdate } = require('../../db');
const xss = require('xss');

async function getProducts(offset, category, search) {
  const values = [];
  let q = `
          SELECT * FROM
          products
          ORDER BY created DESC
      `;

  if (category !== undefined && search !== undefined) {
    q = `
        SELECT * FROM
        products
        WHERE category = $1
        AND (title LIKE '%' || ($2) || '%'
        OR descr LIKE '%' || ($2) || '%')
        ORDER BY created DESC
      `;
    values.push(category);
    values.push(search);
  } else if (category !== undefined) {
    q = `
        SELECT * FROM
        products
        WHERE category = $1
        ORDER BY created DESC
      `;
    values.push(category);
  } else if (search !== undefined) {
    q = `
        SELECT * FROM
        products
        WHERE title LIKE '%' || ($1) || '%'
        OR descr LIKE '%' || ($1) || '%'
        ORDER BY created DESC
      `;
    values.push(search);
  }

  const products = await paged(q, { offset, values });
  return products;
}

async function getProductByTitle(title) {
  const q = `
        SELECT * FROM
        products
        WHERE title = $1
    `;
  const result = await query(q, [title]);
  return result.rows;
}

async function getProductById(id) {
  if (!Number.isInteger(Number(id))) {
    return null;
  }

  const q = `
    SELECT * FROM
    products
    WHERE id = $1
    `;
  const result = await query(q, [id]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

async function makeNewProduct(data) {
  const { title, price, descr, image, category } = data;

  const q = `
    INSERT INTO
    products (title, price, descr, img, category)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *
    `;

  const result = await query(q, [
    xss(title),
    xss(price),
    xss(descr),
    xss(image),
    xss(category)
  ]);

  return result.rows[0];
}

async function updateProduct(id, title, price, descr, image, category) {
  if (!Number.isInteger(Number(id))) {
    return null;
  }

  const isset = f => typeof f === 'string' || typeof f === 'number';

  const fields = [
    isset(title) ? 'title' : null,
    isset(price) ? 'price' : null,
    isset(descr) ? 'descr' : null,
    isset(image) ? 'img' : null,
    isset(category) ? 'category' : null
  ];

  const values = [
    isset(title) ? xss(title) : null,
    isset(price) ? xss(price) : null,
    isset(descr) ? xss(descr) : null,
    isset(image) ? xss(image) : null,
    isset(category) ? xss(category) : null
  ];

  const result = await conditionalUpdate('products', id, fields, values);

  if (!result) {
    return null;
  }

  return result.rows[0];
}

async function getCategories() {
  const q = 'SELECT * FROM categories';
  const categories = await query(q);
  return categories.rows;
}

async function getCategory(title) {
  const q = `
        SELECT * FROM
        categories
        WHERE title = $1
        `;
  const result = await query(q, [xss(title)]);
  return result.rows;
}

async function getCategoryById(id) {
  const q = `
        SELECT * FROM
        categories
        WHERE id = $1
    `;
  const result = await query(q, [id]);

  return result.rows;
}

async function newCategory(title) {
  const q = `
        INSERT INTO
        categories (title)
        VALUES ($1) RETURNING *
    `;

  const result = await query(q, [xss(title)]);

  return result.rows[0];
}

async function categoryInProducts(title) {
  const q = `
        SELECT * FROM
        products
        WHERE category = $1
    `;

  const result = await query(q, [title]);
  return result.rows;
}

async function updateCategory(id, title) {
  const fields = ['title'];
  const values = [title];
  const result = await conditionalUpdate('categories', id, fields, values);

  if (!result) {
    return null;
  }
  return result.rows[0];
}

module.exports = {
  getProducts,
  getProductByTitle,
  getProductById,
  makeNewProduct,
  updateProduct,
  getCategories,
  getCategory,
  getCategoryById,
  newCategory,
  categoryInProducts,
  updateCategory
};
