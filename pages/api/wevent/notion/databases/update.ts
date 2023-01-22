import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const notionApiUrl = 'https://api.notion.com/v1'
const notionApiKey = process.env.NOTION_TOKEN
const notionApiVersion = process.env.NOTION_VERSION


//EXAMPLE patch
// http://localhost:3000/api/wevent/notion/databases/update?database_id=f527d1fe92dd4936b745e4b5007ef8bf
// body
// {
//     "title": [
//         {
//             "text": {
//                 "content": "Today's grocery list"
//             }
//         }
//     ],
//     "description": [
//         {
//             "text": {
//                 "content": "A list of items to buy at the grocery store"
//             }
//         }
//     ],
//     "properties": {}
// }
interface PropertiesSchema {
  [propertyName: string]: {
    [propertyType: string]: {
      [propertyOptions: string]: any
    }
  }
}

interface Body {
  title?: any[]
  description?: any[]
  properties?: PropertiesSchema
}

const notionApi = axios.create({
  baseURL: notionApiUrl,
  headers: {
    'Notion-Version': notionApiVersion,
    Authorization: `Bearer ${notionApiKey}`
  }
})

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PATCH') {
    try {
      const databaseId = req.query.database_id
      if (!databaseId) {
        return res.status(400).json({ error: 'Missing database_id parameter' });
      }
      const body: Body = req.body
      const { data } = await notionApi.patch(`/databases/${databaseId}`, body)
      res.status(200).json(data)
    } catch (err) {
      if (err.response) {
        res
          .status(err.response.status)
          .json({ message: err.response.data.message })
      } else {
        res.status(400).json({ message: 'Invalid request' })
      }
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
