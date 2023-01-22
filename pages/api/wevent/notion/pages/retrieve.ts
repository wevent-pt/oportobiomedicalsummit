import { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const notionApiUrl = 'https://api.notion.com/v1'
const notionApiKey = process.env.NOTION_TOKEN
const notionApiVersion = process.env.NOTION_VERSION
//example:
// http://localhost:3000/api/wevent/notion/pages/retrieve?page_id=d261e31732e14d8c91025fec3efba0d6&filter={"property":"color","color":"red"}&sorts={"property":"created_time","direction":"descending"}
// EXAMPLE get
// http://localhost:3000/api/wevent/notion/pages/retrieve?page_id=d261e31732e14d8c91025fec3efba0d6
const notionApi = axios.create({
  baseURL: notionApiUrl,
  headers: {
    'Notion-Version': notionApiVersion,
    Authorization: `Bearer ${notionApiKey}`
  }
})
interface Filter {
    property: any,
    // define the shape of the filter object
    // example:
    // {
    //   "property": "Landmark",
    //   "rich_text": {
    //     "contains": "Bridge"
    //   }
    // }
  }
  
  interface Sorts {
    property: any,
    // define the shape of the sorts object
    // example:
    // {
    //   "property": "Name",
    //   "direction": "ascending"
    // }
  }
  
  const isValidFilter = (filter: Filter | undefined): boolean => {
    if (!filter) {
      return true
    }
    // check if the filter object contains only valid property/timestamp and direction values
    // return true if the filter object is valid, false otherwise
    return true // or false, depending on the validation logic
  }
  
  const isValidSorts = (sorts: Sorts | undefined): boolean => {
    if (!sorts) {
      return true
    }
    // check if the sorts object contains only valid property/timestamp and direction values
    // return true if the sorts object is valid, false otherwise
    return true // or false, depending on the validation logic
  }
  

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { page_id } = req.query
    try {
        let filter: Filter | undefined
        let sorts: Sorts | undefined
        if (req.query.filter) {
          // if the filter is passed as an array in the query string, join it back into a single string
          if (Array.isArray(req.query.filter)) {
            filter = JSON.parse(req.query.filter.join(''))
          } else {
            filter = JSON.parse(req.query.filter)
          }
          if (!isValidFilter(filter)) {
            return res.status(400).json({ message: 'Invalid filter' })
          }
        }
        if (req.query.sorts) {
          // if the sorts is passed as an array in the query string, join it back into a single string
          if (Array.isArray(req.query.sorts)) {
            sorts = JSON.parse(req.query.sorts.join(''))
          } else {
            sorts = JSON.parse(req.query.sorts)
          }
          if (!isValidSorts(sorts)) {
            return res.status(400).json({ message: 'Invalid sorts' })
          }
        }
  
        // use the filter and sorts objects in your page query
        // example:
        // const { data } = await notionApi.get(`/pages/${page_id}`, {
        //    params: { filter, sorts }
        // });
        const { data } = await notionApi.get(`/pages/${page_id}`)
        res.status(200).json(data)
      } catch (err) {
        if (err.response) {
          res
            .status(err.response.status)
            .json({ message: err.response.data.message })
        } else {
          res.status(400).json({ message: 'Invalid filter or sorts' })
        }
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' })
    }
  }