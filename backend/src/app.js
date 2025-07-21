const express = require('express');
const cors = require('cors');
const spotifyRoutes = require('./routes/spotifyRoutes');
const postRoutes = require('./routes/postRoutes');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/spotify', spotifyRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => {
  res.send('backend works');
});

module.exports = app;