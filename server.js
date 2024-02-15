require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const PORT = 6600;

app.use(express.raw());
app.use(express.json());


mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then((data) => {
  console.log('MongoDB Connected');
}).catch((err) => {
  console.log(err);
});

app.get('/', function (req, res) {
  res.send('hello world');
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/track', require('./src/routes/track'));

app.listen(PORT, () => {
  console.log(`Server Running on port: ${PORT}`);
});
