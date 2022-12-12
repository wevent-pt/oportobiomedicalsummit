import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import {TOKEN, NOTION_VERSION, NAV_TABLE_ID} from './APIConstants';

const token = TOKEN;
const notion_version = NOTION_VERSION;
const nav_table_id = NAV_TABLE_ID;


const config = {
    method: null,
    url: null,
    headers: { 
      'Notion-Version': notion_version, 
      'Authorization': 'Bearer ' + token,

    },
    data: null,
};


function parseNav(results:any){

   const returnObj = {
      status: null,
      navArr: [],
   }

   const navArr = Array(results.length).fill('');

   for(let i = 0 ; i < results.length ; i++){

      const navEl = {
         name: null,
         subArr: null,
         href: null,
         class: null,
         type: null,
         order:null,
      };

      const subNavArr = [];

      const resultProps = results[i].properties;

      for(const [key,value] of Object.entries(resultProps)){

         let subMenuItems = null;
         let subMenuHref = null;
         const subMenuProps = resultProps['subMenu'];
         let overRide = false;

         if(key == 'Name'){
            navEl.name =  value['title'][0].text.content;
         }
         else if(key == 'href'){

            if(subMenuProps['rich_text'][0].text.content == 'false'){
               navEl.href =  value['rich_text'][0].text.content;     
            }
             
         }
         else if(key == 'subMenuItems'){

            if(subMenuProps['rich_text'][0].text.content == 'true'){
               subMenuItems = value['multi_select'];

               for(let i = 0 ; i < subMenuItems.length; i++){

                  const subNavEl = {
                      name: null,
                      href: null,
                      class: null,
                      type: 'li',
                      order:null,
                  };

                  if(subNavArr.length == 0 || overRide){
                     overRide = true;
                     subNavEl.name = subMenuItems[i].name;
                     subNavArr.push(subNavEl);
                  }
                  else{
                     subNavArr[i].name = subMenuItems[i].name;
                  }
                  
               }
            }
                 
         }
         else if(key == 'subMenuItems_hrefs_ordered'){

            if(subMenuProps['rich_text'][0].text.content == 'true'){

               subMenuHref = value['multi_select'];

               for(let i = 0 ; i < subMenuHref.length; i++){

                  const subNavEl = {
                      name: null,
                      href: null,
                      class: null,
                      type: 'li',
                      order:null,
                  };
                   
                  if(subNavArr.length == 0 || overRide){
                     overRide = true;
                     subNavEl.href = subMenuHref[i].name;
                     subNavArr.push(subNavEl);

                  }
                  else{
                     subNavArr[i].href = subMenuHref[i].name;
                  }
               }

            }
            
         }
         else if(key == 'order'){

            const order: any = value;
            navEl.order = order.number-1;
            // navEl.order = value.number -1;
         }
         else if(key == 'type'){
            navEl.type = value['rich_text'][0].text.content;  
         }

         
      }

      if(subNavArr.length != 0){
         navEl.subArr = [];
         navEl.subArr = subNavArr;   
      }
      navArr[navEl.order] = navEl;

   }

   returnObj.status = true;
   returnObj.navArr = navArr;

   return returnObj
}


export default async function getNav(req: NextApiRequest, res: NextApiResponse){

	try{	

      const method = 'post';
      const url = 'https://api.notion.com/v1/databases/' + nav_table_id + '/query';
      config.method = method;
      config.url = url;
      config.headers['Content-type'] = 'application/json'; 
      config.data = {};
      const resAxios = await axios(config);
      const navArr = await parseNav(resAxios.data.results);

      res.status(200).send(navArr);
	}
	catch(err){
		// res.status(400).json({ text: err });	
      res.status(400).json(err);
	}
}