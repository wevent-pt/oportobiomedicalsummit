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
    'Notion-Version': notionApiVersion,
    Authorization: `Bearer ${notionApiKey}`
  }
})

interface PropertiesSchema {
  [propertyName: string]: {
    [propertyType: string]: {
      [propertyOptions: string]: any
    }
  }
}

interface Body {
  parent: string
  title: any[]
  properties: PropertiesSchema
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const body: Body = req.body
      const { data } = await notionApi.post('/databases', body)
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
