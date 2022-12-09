import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import {TOKEN, NOTION_VERSION, USER_TABLE_ID} from './APIConstants';

const token = TOKEN;
const notion_version = NOTION_VERSION;
const user_table_id = USER_TABLE_ID;

const config = {
    method: null,
    url: null,
    headers: { 
      'Notion-Version': notion_version, 
      'Authorization': 'Bearer ' + token,

    },
    data: null,
  };

const trialData = {
   "parent":{
      "database_id": user_table_id
   },
   "properties":{
      "access-component-x":{
         "id":"BMnm",
         "type":"rich_text",
         "rich_text":[
            {
               "type":"text",
               "text":{
                  "content":"no",
                  "link":null
               },
               "annotations":{
                  "bold":false,
                  "italic":false,
                  "strikethrough":false,
                  "underline":false,
                  "code":false,
                  "color":"default"
               },
               "plain_text":"no",
               "href":null
            }
         ]
      },
      "name":{
         "id":"NTP%3E",
         "type":"rich_text",
         "rich_text":[
            {
               "type":"text",
               "text":{
                  "content":"none",
                  "link":null
               },
               "annotations":{
                  "bold":false,
                  "italic":false,
                  "strikethrough":false,
                  "underline":false,
                  "code":false,
                  "color":"default"
               },
               "plain_text":"none",
               "href":null
            }
         ]
      },
      "email":{
         "id":"title",
         "type":"title",
         "title":[
            {
               "type":"text",
               "text":{
                  "content":"none",
                  "link":null
               },
               "annotations":{
                  "bold":false,
                  "italic":false,
                  "strikethrough":false,
                  "underline":false,
                  "code":false,
                  "color":"default"
               },
               "plain_text":"none",
               "href":null
            }
         ]
      },
      "bilhete":{
         "id":"%5CXo%3A",
         "type":"rich_text",
         "rich_text":[
            {
               "type":"text",
               "text":{
                  "content":"none",
                  "link":null
               },
               "annotations":{
                  "bold":false,
                  "italic":false,
                  "strikethrough":false,
                  "underline":false,
                  "code":false,
                  "color":"default"
               },
               "plain_text":"none",
               "href":null
            }
         ]
      },
   },
}


async function joinUserData(userData: any){

    const {email, name, bilhete, } = userData;

    const auxTrialData = trialData;

    auxTrialData.properties.name['rich_text'][0].text.content = name;

    auxTrialData.properties.name['rich_text'][0]['plain_text'] = name;

    auxTrialData.properties.email['title'][0].text.content = email;

    auxTrialData.properties.email['title'][0]['plain_text'] = email;

    auxTrialData.properties.bilhete['rich_text'][0].text.content = bilhete;

    auxTrialData.properties.bilhete['rich_text'][0]['plain_text'] = bilhete;

    return auxTrialData;

}

export default async function addUser(req: NextApiRequest, res: NextApiResponse){

	try{	

      const userData = req.query;
      console.log('userData: ', userData);
      const method = 'post';
      const url = 'https://api.notion.com/v1/pages';
      config.method = method;
      config.url = url;
      config.headers['Content-type'] = 'application/json';
      config.data = await joinUserData(userData);
      const resAxios = await axios(config);
      res.status(200).send(resAxios);


	}
	catch(err){


		// res.status(400).json({ text: err });	
      res.status(400).json(err);
	}
	
}