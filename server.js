require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.use(express.json());

const userRoutes = require('./routes/user');
const newsRoutes = require('./routes/news');

app.get('/', ( _req, res) => {
  res.send('Welcome to my API');
});

app.use('/user', userRoutes);
app.use('/news', newsRoutes);



app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});