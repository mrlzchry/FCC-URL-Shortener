require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require("dns");
const urlParser = require('url');
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('fcc-mongodb-and-mongoose');
const urlList = db.collection('url_shortener');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

//use bodyparse to parse POST request
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  console.log(req.body.url)

  dns.lookup(urlParser.parse(originalUrl).hostname,  async (err, address) => {
  
  if (address === null) {
    res.json({
      error: 'invalid url'
    })
    
  }
  else {
    const urlNo = await urlList.countDocuments({});
    const urlDocument = {
      originalUrl,
      short_url: urlNo
    }
     const result = await urlList.insertOne(urlDocument);
    console.log(result);
 res.json({ 
   original_url: originalUrl, 
   short_url: urlNo })
  }
  })
});

app.get('/api/shorturl/:shorturl', async function(req, res) {
  const shortUrl = req.params.shorturl;
  const urlDocument = await urlList.findOne( 
    {short_url: parseInt(shortUrl)});
  res.redirect(urlDocument.originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
