import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import {TOKEN, NOTION_VERSION, SCHEDULE_TABLE_ID} from './APIConstants';

const token = TOKEN;
const notion_version = NOTION_VERSION;
const schedule_table_id = SCHEDULE_TABLE_ID;


const config = {
    method: null,
    url: null,
    headers: { 
      'Notion-Version': notion_version, 
      'Authorization': 'Bearer ' + token,

    },
    data: null,
};


function parseSchedule(results){

   const returnObj = {
      status: null,
      schedule: [],
   }

   const scheduleArr = [];

   for(let i = 0 ; i < results.length ; i++){

      const scheduleItem = {
         Name: null,
         Description: null,
         Date:{
            start:null,
            end:null,
         },
         Speackers: null,
         Tags: null,
      }

      const resultProps = results[i].properties;

      for(const [key,value] of Object.entries(resultProps)){

         const type = value['type'];

         if(type == 'rich_text' || type == 'title' ){
            scheduleItem[key] = value[type][0].text.content;
         }
         else if(type == 'multi_select'){
            scheduleItem[key] = value[type][0].name; 
         }
         else if(type == 'date'){
            scheduleItem[key].start = value[type].start;
            scheduleItem[key].end = value[type].end; 
         }
         else if(type == 'relation'){
            scheduleItem[key] = 'not implemented';
         }
         
      }

      scheduleArr.push(scheduleItem);

      
   }

   returnObj.status = true;
   returnObj.schedule = scheduleArr;

   return returnObj;
}


export default async function getSchedule(req: NextApiRequest, res: NextApiResponse){

	try{	

      const method = 'post';
      const url = 'https://api.notion.com/v1/databases/' + schedule_table_id + '/query';
      config.method = method;
      config.url = url;
      config.headers['Content-type'] = 'application/json'; 
      config.data = {};
      const resAxios = await axios(config);

      const schedule = await parseSchedule(resAxios.data.results);

      res.status(200).send(schedule);
	}
	catch(err){
		// res.status(400).json({ text: err });	
      res.status(400).json(err);
	}
	
}