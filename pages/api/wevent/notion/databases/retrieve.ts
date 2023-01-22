import { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const notionApiUrl = 'https://api.notion.com/v1'
const notionApiKey = process.env.NOTION_TOKEN
const notionApiVersion = '2022-06-28'
const notionApi = axios.create({
  baseURL: notionApiUrl,
  headers: {
    'Notion-Version': notionApiVersion,
    Authorization: `Bearer ${notionApiKey}`
  }
})

interface Properties {
  [property: string]: any
}

interface RequestBody {
  properties?: Properties
  archived?: boolean
  icon?: any
  cover?: any
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PATCH') {
    try {
      const { page_id } = req.query
      const body: RequestBody = req.body
      const { data } = await notionApi.patch(`/pages/${page_id}`, body)
      res.status(200).json(data)
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          return res.status(404).json({ message: 'Page not found' })
        } else if (err.response.status === 400) {
          return res.status(400).json({ message: 'Invalid request' })
        } else if (err.response.status === 429) {
          return res.status(429).json({ message: 'Too many requests' })
        }
      }
      return res.status(500).json({ message: 'An error occurred' })
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}
