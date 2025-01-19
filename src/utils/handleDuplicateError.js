const handleDuplicateError = (error, res, mes) => {
    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: mes || "Lỗi trùng lặp"
        });
    }
}

module.exports = handleDuplicateError;