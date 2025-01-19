const Category = require("../models/category.model");
const handleDuplicateError = require("../utils/handleDuplicateError");

const get_all_category = async (req, res) => {
    try {
        const { search, isDeleted, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        };

        if (isDeleted === 'true') {
            query.isDeleted = true;
        } else if (isDeleted === 'false') {
            query.isDeleted = false;
        }

        const categories = await Category.find(query)
            .limit(limit)
            .skip(skip)
            .sort({ "createdAt": -1 });
        const totalCategories = await Category.countDocuments(query);
        const totalPage = Math.ceil(totalCategories / limit);
        res.status(200).json({
            success: true,
            message: "Lấy danh mục thành công",
            categories: categories,
            totalCategories: totalCategories,
            totalPage: totalPage,
            currentPage: page
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`)
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const create_category = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ"
            })
        }

        const category = new Category({ ...req.body });
        await category.save();
        res.status(201).json({
            success: true,
            message: "Tạo danh mục thành công",
            category: category
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        handleDuplicateError(error, res, "Tên danh mục đã tồn tại")
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const edit_category = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Yêu cầu mã danh mục"
            })
        }

        const { name, description } = req.body;
        if (!name && !description) {
            return res.status(400).json({
                success: false,
                message: "Không có dữ liệu để cập nhật"
            });
        }

        const updates = {};
        if (name) updates.name = name.trim();
        if (description) updates.description = description;

        const category = await Category.findByIdAndUpdate(_id, updates, { new: true });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục cần sửa"
            })
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật danh mục thành công",
            category: category
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        handleDuplicateError(error, res, "Tên danh mục đã tồn tại")
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const edit_delete_category = async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Yêu cầu mã danh mục cần xóa"
            })
        }

        const category = await Category.findById(_id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục"
            })
        }
        console.log(category)

        category.isDeleted = !category.isDeleted;

        await category.save();
        const message = category.isDeleted
            ? "Danh mục đã được đánh dấu là xóa mềm"
            : "Danh mục đã được khôi phục";

        res.status(200).json({
            success: true,
            message: message,
            category: category
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const delete_category = async (req, res) => {
    try {
        const { _id } = req.params;

        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Yêu cầu mã danh mục"
            })
        }

        const category = await Category.findByIdAndDelete(_id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục cần xóa"
            })
        }
        res.status(200).json({
            success: true,
            message: "Xóa vĩnh viễn danh mục thành công",
            category: category
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

module.exports = {
    get_all_category,
    create_category,
    edit_category,
    edit_delete_category,
    delete_category,
}