// const axios = require('axios');
import axios from 'axios';
import express from 'express'
// const express =  require('express');

const app = express();
app.use(express.json({ limit: 100000 }));
const config= {
  method: 'post',
  url: 'https://notion-cloudflare-worker.pedrogq.workers.dev/v1/databases/8fd27dafa3c947a1a15fd16c5936e63b/query',
  headers: { 
    'Notion-Version': '2022-06-28', 
    'Authorization': 'Bearer secret_L9Vj4blk7LWEN5ds7Wiyb2YfSF0K8ZI0p30uqYAtJgv'
  }
};



async function callNotionApi(path){

  config.url = 'https://notion-cloudflare-worker.pedrogq.workers.dev/v1/' + path;
	const res = await axios(config);

	// console.log(JSON.stringify(res.data));

	const data = res.data;
	return (data);
}

app.get('/api', async (req, res) => {
	
	const resNotion = await callNotionApi('databases/8a37c9686d234a84923f0390dde78017/query');
	res.send(resNotion);	
});

app.get('/api/html/:sala', async (req, res) => {
	
	const resNotion = await callNotionApi('databases/8a37c9686d234a84923f0390dde78017/query');
  const data:any = resNotion.results.find(x => x.properties.slug.title[0].plain_text === req.params.sala);
  // data.properties.html.rich_text[0].text.content
  const data1 = data.properties.html
	// console.log(data1)
  let data2 = ''
  for (let index = 0; index < data1.rich_text.length; index++) {
    // const element = array[index];
    data2 = data2 + data1.rich_text[index].plain_text
    // console.log(index);    
  }
  // console.log(data2)
  // console.log(data)
  // console.log("dataaaaaaaa", data)
  //res.send(data2)	
  res.json(data2)	
});


module.exports = app;
