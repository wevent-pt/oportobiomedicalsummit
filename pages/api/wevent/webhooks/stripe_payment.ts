import { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'

const extractInformation = (event: any) => {
  let userEmail = ''
  let eventId = ''
  let product = ''

  userEmail = event.data.object.receipt_email || 'test@exmaple.com'
  eventId = event.id || ''
  product = event.type || ''
  console.log(event.type)

  return { userEmail, eventId, product }
}
const createTicketPage = async (
  database_id: string,
  userEmail?: string,
  eventId?: string,
  product?: string
) => {
  try {
    const { data } = await axios.post(
      `/api/wevent/notion/pages/create`,
      {
        parent: {
          database_id: `${database_id}`
        },
        properties: {
          id: {
            title: [
              {
                text: {
                  content: `${eventId}`
                }
              }
            ]
          },
          userId: {
            rich_text: [
              {
                text: {
                  content: 'not assigned'
                }
              }
            ]
          },
          email: {
            rich_text: [
              {
                text: {
                  content: `${userEmail}`
                }
              }
            ]
          },
          product: {
            rich_text: [
              {
                text: {
                  content: `${product}`
                }
              }
            ]
          }
        }
      }
    )

    return { message: 'Page created successfully', data }
  } catch (err) {
    return { message: 'Failed to create page', error: err }
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { userEmail, eventId, product } = extractInformation(req.body)
    // console.log(userEmail, eventId, product)
    if (product === 'payment_intent,succeed') {
      const databaseId = req.query.database_id.toString()
      const pageResponse = await createTicketPage(
        databaseId,
        userEmail,
        eventId,
        product
      )

      res.status(200).json(pageResponse)
    } else {
      res.status(201).json({ message: 'Not a payment_intent_succeed event' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
