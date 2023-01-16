import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { USER_TABLE_ID} from './APIConstants';
import {config} from './axiosConfig';


function getUser(results, userEmail){

   const returnObj = {
      status: null,
      userInfo: {
         email: null,
         name: null,
         bilhete: null
      }
   }

   for(let i = 0 ; i < results.length ; i++){

      const emailProps = results[i].properties['email'];

      const email = emailProps[emailProps.type][0].text.content;

      if(email == userEmail){

         returnObj.status = true;

         const nomeProps= results[i].properties['name'];
         const bilheteProps =  results[i].properties['bilhete'];

         const name = nomeProps[nomeProps.type][0].text.content;
         const bilhete = bilheteProps[bilheteProps.type][0].text.content;

         returnObj.userInfo.email = userEmail;
         returnObj.userInfo.name = name;
         returnObj.userInfo.bilhete = bilhete;

         return returnObj;
         break;
      }
   }

   returnObj.status = false;
   returnObj.userInfo = null;

   return returnObj;
}


export default async function userExists(req: NextApiRequest, res: NextApiResponse){

	try{	
      const userData = req.query;
      const method = 'post';
      const url = 'https://api.notion.com/v1/databases/' + USER_TABLE_ID + '/query';
      config.method = method;
      config.url = url;
      config.headers['Content-type'] = 'application/json'; 
      config.data = {};
      const resAxios = await axios(config);
      const userResult = await getUser(resAxios.data.results, userData.email);
      res.status(200).send(userResult);
	}
	catch(err){


		// res.status(400).json({ text: err });	
      res.status(400).json(err);
	}
	
}