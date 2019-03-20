

const {

} = require('./productsUtils');

const { paged } = require('../../db');

async function productsRoute(req, res) {

    const { offset = 0 } = req.query;
    const q = `
        SELECT * FROM
        products
        ORDER BY created
    `;
    const products = await paged(q, { offset });
    
    return res.json(products);

}

module.exports = {
    productsRoute,
}