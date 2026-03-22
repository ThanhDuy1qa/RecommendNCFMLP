const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Không còn stats ở đây nữa
router.get('/suggest', productController.getSearchSuggestions);
router.get('/categories', productController.getCategories);
router.get('/:asin', productController.getProductByAsin);
router.get('/', productController.getProducts);

module.exports = router;