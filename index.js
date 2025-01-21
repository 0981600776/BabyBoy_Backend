require('dotenv').config();
const express = require('express');
const cors = require('cors');

const categoriesRouter = require('./src/routes/category.route.js');
const connectDB = require('./src/config/connectDB.js');
const productRouter = require('./src/routes/product.route.js');

const port = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/v1/api/categories', categoriesRouter);
app.use('/v1/api/products', productRouter);


app.listen(port, async () => {
    await connectDB();
    console.log(`Server đang chạy trên cổng ${port}`);
})