const { cloudinary } = require("../config/cloudinary");
const Product = require("../models/product.model");
const Review = require("../models/review.model");

const get_all_product = async (req, res) => {
    try {
        const {
            search,
            brand,
            page = 1,
            limit = 10,
            sortField = 'createdAt',
            sortOrder = -1
        } = req.query;
        const skip = (page - 1) * limit;
        let query = {};
        if (search) {
            query = {
                ...query,
                $or: [
                    {name: {$regex: search, $options: 'i'}},
                    {brand: {$regex: search, $options: 'i'}}
                ]
            }
        }
        if (brand) query.brand = brand;
        const products = await Product.find(query)
            .limit(limit)
            .skip(skip)
            .sort({[sortField]: sortOrder});
        const totalProduct = await Product.countDocuments(query);
        const totalPage = Math.ceil(totalProduct / limit);

        res.status(200).json({
            success: true,
            message: "Danh sách sản phẩm",
            products: products,
            totalProduct: totalProduct,
            totalPage: totalPage,
            currPage: page
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const get_product_by_category = async (req, res) => {
    try {
        const { _id } = req.params;
        const products = await Product.find({category_id: _id});
        if (products.length === 0) {
            return res.status(200).json({
                success: false,
                message: "Không có sản phẩm nào trong danh mục này"
            })
        }

        res.status(200).json({
            success: true,
            message: "Danh sách sản phẩm trong danh mục",
            products: products
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const related_product = async (req, res) => {
    try {
        const { _id } = req.params;
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            })
        }

        const titleRegex = new RegExp(
            product.name.split(' ').filter((word) => word.length > 0).join('|'),
            'i'
        )
        const related_product = await Product.find({
            _id: {$ne: _id},
            name: {$regex: titleRegex}
        }).limit(5);

        res.status(200).json({
            success: true,
            message: "Sản phẩm liên quan",
            related_product: related_product
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const detail_product = async (req, res) => {
    try {
        const { _id } = req.params;
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            })
        }
        const reviews = await Review.find({product_id: _id});
        const totalStar = reviews.reduce((total, item) => total + item.rating, 0);
        const star = reviews.length > 0 ? ( totalStar / reviews.length ).toFixed(2) : 0;
        
        res.status(200).json({
            success: true,
            message: "Chi tiết sản phẩm",
            product: product,
            reviews: reviews,
            star: star
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const create_product = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Yêu cầu tải ảnh sản phẩm lên"
            });
        }
        const imageUrl = req.file.path;
        const { name, price, quantity, category_id } = req.body;
        if (!name || !price || !quantity || !category_id) {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ hoặc bị để trống"
            });
        }

        const product = new Product({imageUrl,...req.body});
        await product.save();
        res.status(201).json({
            success: true,
            message: "Tạo sản phẩm thành công",
            product: product
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const edit_product = async (req, res) => {
    try {
        const { _id } = req.params;
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Sản phẩm không tồn tại"
            })
        }

        let newImg = product.imageUrl;
        if (req.file) {
            newImg = req.file.path;
        }

        const dateUpdate = {...req.body, imageUrl: newImg};

        const newProduct = await Product.findByIdAndUpdate(
            _id,
            dateUpdate,
            {new: true}
        )

        res.status(200).json({
            success: true,
            message: "Cập nhật sản phẩm thành công",
            newProduct: newProduct
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const delete_product = async (req, res) => {
    try {
        const { _id } = req.params;
        const product = await Product.findByIdAndDelete(_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            })
        }
        res.status(200).json({
            success: true,
            message: "Xóa sản phẩm thành công",
            product: product
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

const product_statistics = async (req, res) => {
    try {
        const totalProduct = await Product.countDocuments();

        const bestSellers = await Product.find({}).sort({sold: -1}).limit(5);
        const leastSellers = await Product.find({}).sort({sold: 1}).limit(5);
        const outOfStock = await Product.find({ quantity: 0});
        res.status(200).json({
            success: true,
            message: "Thống kê sản phẩm",
            totalProduct: totalProduct,
            bestSellers:bestSellers,
            leastSellers: leastSellers,
            outOfStock: outOfStock
        })
    } catch (error) {
        console.log(`Lỗi: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ"
        })
    }
}

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

module.exports = {
    get_all_product,
    get_product_by_category,
    related_product,
    detail_product,
    create_product,
    edit_product,
    delete_product,
    product_statistics
}