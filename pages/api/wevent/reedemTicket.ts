import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import {TICKET_CODES_ID} from './APIConstants';
import {config} from './axiosConfig';


function parseNotionResult(results:any, userCode:string ){
    let tableCode = 'Not valid';
    let codeState = 'Not valid';

    const returnObj = {
        status:false,
        message: '',
        results:null,
    }


    const updateFields = {
        properties:{}
    }
 
    for(let i = 0 ; i < results.length ; i++){
  
       const resultProps = results[i].properties;

    //    console.log(resultProps);
 
       for(const [key,value] of Object.entries(resultProps)){

            const type = value['type'];
            // console.log('key:',key);
            // console.log('value:',value);
            // console.log('type:', value['type']);
            
            if(key === 'Code'){

                tableCode = value[type][0].text.content;

                if(tableCode === userCode){
                    // console.log('codes match');
                    const stateValue = resultProps['State'];
                    codeState = stateValue[stateValue.type].name;
                    //update notion results 
                    results[i].properties.State[stateValue.type].name = 'Used';
                    results[i].properties.State[stateValue.type].color = 'red';

                    updateFields.properties[stateValue.id] = {
                        type: stateValue.type,
                        status:{
                            name: 'Used',
                            color: 'red',
                        }
                    }  
                    
                }
                else{
                    // console.log('codes dont match');
                }
            }
       }
 
    }
    



    if(tableCode != 'Not valid' && codeState === 'Not used'){

        returnObj.status = true;
        returnObj.message = 'Ticket can be redemed';
        returnObj.results = updateFields;
        return returnObj;
    }
    else if(tableCode != 'Not valid' && codeState === 'Used'){
        returnObj.message = 'Code already used';
        return returnObj;
    }
    else{
        returnObj.message = 'Invalid code';
        return returnObj;
    }
 
    
 }



//  async function updateTicketCodesTable(results:any){

//     const method = 'PATCH';
//     const url = 'https://api.notion.com/v1/databases/'+ TICKET_CODES_ID;
//     config.method = method;
//     config.url = url;
//     config.headers['Content-type'] = 'application/json'; 
//     config.data = results;
//     const result = await axios(config);
//     console.log('updatedCodeTable:', result);


// }


export default async function reedemTicket(req: NextApiRequest, res: NextApiResponse){
	

    try{
        
        //code provided by the user
        let userInputCode = '';

        if(typeof req.query.code === 'string'){

            userInputCode = req.query.code;

        }

        //Get ticket code table information
        const method = 'post';
        const url = 'https://api.notion.com/v1/databases/' + TICKET_CODES_ID + '/query';
        config.method = method;
        config.url = url;
        config.headers['Content-type'] = 'application/json'; 
        config.data = {};
        const resAxios = await axios(config);

        const result = parseNotionResult(resAxios.data.results, userInputCode);

        if(result.status === true){
            //valid code send ticket to user
            //Update notion table
            // updateTicketCodesTable(result.results);


        }
        else if(result.status === false){
            //The code inserted by the user is not valid

        }


        res.status(200).send(result);
      }
      catch(err){
          // res.status(400).json({ text: err });	
        res.status(400).json(err);
      }
	
}