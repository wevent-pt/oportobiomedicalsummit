import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import {TICKET_CODES_ID} from './APIConstants';
import {config} from './axiosConfig';


function parseNotionResult(results:any, userCode:string ){
    let tableCode = 'Not valid';
    let codeState = 'Not valid';
 
    for(let i = 0 ; i < results.length ; i++){
  
       const resultProps = results[i].properties;
 
       for(const [key,value] of Object.entries(resultProps)){
 
            const type = value['type'];
            if(key === 'Code'){

                if(value[type][0].text.content === userCode){
                    tableCode = value[type][0].text.content;    
                }
                
                
            }
            else if(key === 'State'){
                codeState = value[type].name;
            }
       }
 
    }
    

    if(tableCode != 'Not valid' && codeState == 'Not used'){
        return true;
    }
    else{
        return false;
    }
 
    
 }


export default async function reedemTicket(req: NextApiRequest, res: NextApiResponse){
	

    try{
        
        //code provided by the user
        const userInputCode = req.query;

        const method = 'post';
        const url = 'https://api.notion.com/v1/databases/' + TICKET_CODES_ID + '/query';
        config.method = method;
        config.url = url;
        config.headers['Content-type'] = 'application/json'; 
        config.data = {};
        const resAxios = await axios(config);

        //@ts-ignore
        const result = parseNotionResult(resAxios.data.results, userInputCode);
        res.status(200).send(result);
      }
      catch(err){
          // res.status(400).json({ text: err });	
        res.status(400).json(err);
      }
	
}