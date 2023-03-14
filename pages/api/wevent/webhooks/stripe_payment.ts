import { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST' || req.body.type !== 'checkout.session.completed')return res.status(500).json({ message: 'Error with request' })
  
  if (!(await createTicketNotionPage(req))) return res.status(501).json({ message: 'Error with ticket creation' })
  
  if (!(await sendTicketEmail(req))) return res.status(502).json({ message: 'Error sending ticket email' })

  return res.status(200).json({ message: 'Successful Payment Webhook' })
}

async function createTicketNotionPage(req: NextApiRequest) {
  const databaseId = await req.query.database_id ? req.query.database_id : 'N/A'
  const ticketType = await req.body.data?.object?.metadata?.participant_ticketType ? req.body.data?.object?.metadata?.participant_ticketType : 'N/A'
  const assigneeEmail = await  req.query.assignee_id ? req.query.assignee_id : 'N/A'
  const ticketCode = await req.body.data.object?.metadata?.participant_ticketCode ? req.body.data.object?.metadata?.participant_ticketCode : 'N/A'
  const paymentId = await req.body.data.object.payment_intent ? req.body.data.object.payment_intent : 'N/A'
  const receiptEmail = await req.body.data?.object?.customer_details?.email ? req.body.data?.object?.customer_details?.email : 'N/A'
  const amount = await req.body.data?.object?.amount_total ? req.body.data?.object?.amount_total : 'N/A'
  
  console.log(JSON.stringify(paymentId, ticketCode))
  try {
    await axios.post(
      `https://api.notion.com/v1/pages`,
      {
        parent: { database_id: databaseId },
        properties: {
          paymentId: { title: [{ text: { content: paymentId } }] },
          receiptEmail: { rich_text: [{ text: { content: receiptEmail } }] },
          assigneeEmail: { rich_text: [{ text: { content: assigneeEmail } }] },
          ticketType: { rich_text: [{ text: { content: ticketType } }] },
          ticketCode: { rich_text: [{ text: { content: ticketCode } }] },
          amount: { rich_text: [{ text: { content: amount.toString() } }] }
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
    console.log(err)
    return 0
  }
}

async function sendTicketEmail(req: NextApiRequest) {
  const ticketType = req.query.ticketType ? req.query.ticketType : 'N/A'
  const paymentId = req.body.data?.object?.id || 'N/A'
  const receiptEmail = req.body.data?.object?.receipt_email || 'N/A'
  console.log("logging:", ticketType, "( ticketType )");
  console.log("logging:", paymentId, "( paymentId )");
  console.log("logging:", receiptEmail, "( receiptEmail )");
  return 1
}
