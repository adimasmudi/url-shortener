require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const dns = require('dns')
const URL = require('url').URL


app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(
  'mongodb+srv://freecodecamp_mongo:wYJYEfQY3rlKMLYu@cluster0.hoyf0.mongodb.net/freecodecamp_mongo?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
  )

let urlSchema = new mongoose.Schema({
  original_url : String,
  short_url : Number
})

let URLModel = mongoose.model('URLModel',urlSchema)
const based_url = 'localhost:3000'

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  const bodyUrl = req.body.url
  const urlObject = new URL(bodyUrl)
  dns.lookup(urlObject.hostname,(error, address)=>{
    if(!address){
      res.json({error : "Invalid URL"})
    }else{
      let id = Math.floor(Math.random() * 100000)
      let the_url = new URLModel(
        {
          original_url : bodyUrl,
          short_url : id
        }
        ) 
      the_url.save((err, data)=>{
        if(err) return console.log(err)
        res.json({
          original_url : data.original_url,
          short_url : data.short_url
        })
      })
    }
    
  })
})

app.get('/:id', (req, res)=>{
  const id = req.params.id
  dns.lookup(based_url+'/'+id.hostname, (err, address)=>{
    if(!address){
      res.json({error : "Invalid URL"})
    }else{
      URLModel.findOne({short_url : id}, (err, data)=>{
        res.redirect(301, data.original_url)
      })
    }
  })
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
