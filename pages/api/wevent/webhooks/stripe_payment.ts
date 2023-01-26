import { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST' || req.body.type !== 'payment_intent.succeeded')
    return res.status(500).json({ message: 'Error with request' })
  if (!(await createTicketNotionPage(req)))
    return res.status(501).json({ message: 'Error with ticket creation' })
  if (!(await sendTicketEmail(req)))
    return res.status(502).json({ message: 'Error with ticket email' })

  return res
    .status(200)
    .json({ message: 'Ticket creation and email sent successfully' })
}

async function createTicketNotionPage(req: NextApiRequest) {
  const databaseId = req.query.database_id ? req.query.database_id : 'N/A'
  const ticketType = req.query.ticketType ? req.query.ticketType : 'N/A'
  const assigneeId = req.query.assignee_id ? req.query.assignee_id : 'N/A'
  const paymentId = req.body.data?.object?.id || 'N/A'
  const receiptEmail = req.body.data?.object?.receipt_email || 'N/A'

  try {
    await axios.post(
      `https://api.notion.com/v1/pages`,
      {
        parent: { database_id: databaseId },
        properties: {
          paymentId: { title: [{ text: { content: paymentId } }] },
          receiptEmail: { rich_text: [{ text: { content: receiptEmail } }] },
          assigneeId: { rich_text: [{ text: { content: assigneeId } }] },
          ticketType: { rich_text: [{ text: { content: ticketType } }] }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Notion-Version': `${process.env.NOTION_VERSION}`,
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`
        }
      }
    )
    return 1
  } catch (err) {
    return 0
  }
}

async function sendTicketEmail(req: NextApiRequest) {
  const ticketType = req.query.ticketType ? req.query.ticketType : 'N/A'
  const paymentId = req.body.data?.object?.id || 'N/A'
  const receiptEmail = req.body.data?.object?.receipt_email || 'N/A'

  return 1
}
