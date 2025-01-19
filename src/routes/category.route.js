const express = require('express');

const { get_all_category, create_category, edit_category, delete_category, edit_delete_category } = require('../controllers/category.controller');

const router = express.Router();

router.get('/', get_all_category);
router.post('/create', create_category);
router.patch('/edit/:_id', edit_category);
router.patch('/isStatusDelete/:_id', edit_delete_category);
router.delete('/:_id', delete_category);
const ok = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Ok"
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

module.exports = router;
