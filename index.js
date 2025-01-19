const express = require('express');

const port = process.env.PORT || 8080;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello developer!');
})

app.listen(port, () => {
    console.log(`Server is running with port ${8080}`);
})