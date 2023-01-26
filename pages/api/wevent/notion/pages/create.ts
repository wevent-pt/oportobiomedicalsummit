import { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const notionApiUrl = 'https://api.notion.com/v1'
const notionApiKey = process.env.NOTION_TOKEN
const notionApiVersion = process.env.NOTION_VERSION
const notionApi = axios.create({
  baseURL: notionApiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Notion-Version': notionApiVersion,
    Authorization: `Bearer ${notionApiKey}`
  }
})

//EXAMPLE
// POST http://localhost:3000/api/wevent/notion/pages/create?page_id=d261e31732e14d8c91025fec3efba0d6
//creates page in db
// {
//   "parent": { "database_id": "f527d1fe92dd4936b745e4b5007ef8bf" },
//   "properties": {
//       "id": {
//           "title": [
//               {
//                   "text": {
//                       "content": "Tuscan"
//                   }
//               }
//           ]
//       }
//   }
// }

interface Property {
  property: any
  // parent: {
  //   database_id: string
  // },
  // icon: {
  //   emoji: string
  // },
  // cover: {
  //   external: {
  //     url: string
  //   }
  // },
  // properties: {
  //   Name: {
  //     title: [
  //       {
  //         text: {
  //           content: string
  //         }
  //       }
  //     ]
  //   }
  // }
}

const isValidProperty = (property: Property): boolean => {
  if (property) {
    console.log(property)
    // check if the property object contains only valid key and value
    // return true if the property object is valid, false otherwise
    return true // or false, depending on the validation logic
  } else return false
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      console.log("dgsxdg")
      const property: Property = req.body
      if (!isValidProperty(property)) {
        return res.status(400).json({ message: 'Invalid property' })
      }

      // use the property object to create a page
      // example:
      const { data } = await notionApi.post(`/pages`, property)
      res.status(200).json(data)
    } catch (err) {
      if (err.response) {
        return res
          .status(err.response.status)
          .json({ message: err.response.data.message })
      }
      return res.status(500).json({ message: 'Failed to create page' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
