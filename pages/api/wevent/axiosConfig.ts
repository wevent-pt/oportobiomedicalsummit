import axios from 'axios';
import {TOKEN, NOTION_VERSION} from './APIConstants';

export const config = {
    method: null,
    url: null,
    headers: { 
      'Notion-Version': NOTION_VERSION, 
      'Authorization': 'Bearer ' + TOKEN,

    },
    data: null,
};