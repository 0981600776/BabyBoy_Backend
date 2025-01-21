const express = require('express');
const multer = require('multer');
const { get_all_product, create_product, edit_product, get_product_by_category, detail_product, related_product, delete_product, product_statistics } = require('../controllers/product.controller');
const { storage } = require('../config/cloudinary');

const upload = multer({ 
    storage,
    limits: { fieldSize: 2 * 1024 * 1024},
});

const router = express.Router();

router.get('/', get_all_product);
router.get('/productByCategory/:_id', get_product_by_category);
router.get('/related/:_id', related_product);
router.get('/detail/:_id', detail_product);
router.post('/create', upload.single('image'), create_product);
router.patch('/edit/:_id', upload.single('image'), edit_product);
router.delete('/:_id', delete_product);
router.get('/statistics', product_statistics);

module.exports = router;