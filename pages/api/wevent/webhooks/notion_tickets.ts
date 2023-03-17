import { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'

const headers = {
  headers: {
    'Content-Type': 'application/json',
    'Notion-Version': `${process.env.NOTION_VERSION}`,
    Authorization: `Bearer secret_NPPoN4SzvDWlRNEZkyj6vyHQytm1XpQ3oPdD4MSQDvP`
  }
}
type TicketNotionPageFunction = (req: NextApiRequest) => Promise<any>;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST' || !req.query.action)
    return res.status(500).json({ message: 'Error with request' })

  const action = Array.isArray(req.query.action)
    ? req.query.action.join('')
    : req.query.action
    const actions: { [key: string]: TicketNotionPageFunction } = {
      create: createTicketNotionPage,
      update: updateTicketNotionPage,
      delete: deleteTicketNotionPage,
      validate: validateTicketNotionPage
    };
  const handleAction = actions[action]

  if (handleAction) {
    if (await handleAction(req))
      return res.status(200).json({ message: `Ticket ${action}d` })
  } else {
    return res
      .status(500)
      .json({ message: `Error with action ${req.query?.action}` })
  }

  return res.status(200).json({ message: 'Notion Ticket Webhook successful' })
}
async function validateTicketNotionPage(req: NextApiRequest) {
  const { ticket_code, email } = req.query
  if (!ticket_code) return 1

  const [isValidCode, isValidUser] = await Promise.all([
    queryTicketNotionDatabase(req),
    queryUserNotionDatabase(req)
  ])
  console.log(
    `\nvalidating ticket with code no: ${ticket_code}...\nticket validation result: ${isValidCode}`
  )
  console.log(
    `\nvalidating user with email: ${email}...\nuser validation result: ${isValidUser}`
  )

  if (!isValidUser) createUserNotionPage(req)

  console.log(`regist of ticket with receipt no: ${ticket_code}...`)

  return 1
}
async function queryUserNotionDatabase(req: NextApiRequest) {
  let result = 0
  const userDbId = '9bb6c9aa543b45768541587fe0e40f3b'
  try {
    await axios
      .post(
        `https://api.notion.com/v1/databases/${userDbId}/query`,
        {
          filter: {
            property: 'email',
            title: {
              contains: `${req.query.email}`
            }
          }
        },
        headers
      )
      .then((response) => {
        let userNotionEmail = ''
        userNotionEmail =
          response.data.results[0].properties.email.title[0].text.content
        const ticket =
          response.data?.results[0]?.properties?.ticket?.rich_text[0]
            ?.plain_text
        const name =
          response.data?.results[0]?.properties?.name?.rich_text[0]?.plain_text

        console.log(`email: ${userNotionEmail} name: ${name} ticket: ${ticket}`)
        if (userNotionEmail === req.query.email) {
          result = 1
          return 1
        }
        return 0
      })
    return result
  } catch (err) {
    console.log(err)
    return 0
  }
}
async function queryTicketNotionDatabase(req: NextApiRequest) {
  let result = ''
  try {
    await axios
      .post(
        `https://api.notion.com/v1/databases/${req.query.database_id}/query`,
        {
          filter: {
            property: 'ticketCode',
            rich_text: {
              contains: `${req.query.ticket_code}`
            }
          }
        },
        headers
      )
      .then((response) => {
        const paymentId =
          response.data.results[0].properties.paymentId.title[0].text.content
        const notionAssignee =
          response.data.results[0].properties.assigneeEmail.rich_text[0]
            .plain_text
        const ticketCode =
          response.data.results[0].properties.ticketCode.rich_text[0].plain_text
        const ticketType =
          response.data.results[0].properties.ticketType.rich_text[0].plain_text

        console.log(`
          paymentId: ${paymentId}
          ticketCode: ${ticketCode}
          assigneeEmail: ${notionAssignee}
          ticketType: ${ticketType}
        `)
        if (notionAssignee === 'N/A') {
          result = 'valid'
        } else {
          result = 'invalid'
        }

        return result
      })
    return result
  } catch (err) {
    console.log(err)
    return 0
  }
}
async function createUserNotionPage(req: NextApiRequest) {
  if (req) {
    console.log('1')
  }
  // const databaseId = await req.query.database_id ? req.query.database_id : 'N/A'
  // const email = await req.body.data?.object?.metadata?.participant_ticketType ? req.body.data?.object?.metadata?.participant_ticketType : 'N/A'
  // const ticketId = await req.body.data.object?.metadata?.participant_ticketCode ? req.body.data.object?.metadata?.participant_ticketCode : 'N/A'
  // const paymentId = await req.body.data.object.payment_intent ? req.body.data.object.payment_intent : 'N/A'
  // const receiptEmail = await req.body.data?.object?.customer_details?.email ? req.body.data?.object?.customer_details?.email : 'N/A'
  // const amount = await req.body.data?.object?.amount_total ? req.body.data?.object?.amount_total : 'N/A'
  // console.log(JSON.stringify(paymentId, ticketCode))
  // try {
  //   await axios.post(
  //     `https://api.notion.com/v1/pages`,
  //     {
  //       parent: { database_id: databaseId },
  //       properties: {
  //         paymentId: { title: [{ text: { content: paymentId } }] },
  //         receiptEmail: { rich_text: [{ text: { content: receiptEmail } }] },
  //         assigneeEmail: { rich_text: [{ text: { content: assigneeEmail } }] },
  //         ticketType: { rich_text: [{ text: { content: ticketType } }] },
  //         ticketCode: { rich_text: [{ text: { content: ticketCode } }] },
  //         amount: { rich_text: [{ text: { content: amount.toString() } }] }
  //       }
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Notion-Version': `${process.env.NOTION_VERSION}`,
  //         Authorization: `Bearer ${process.env.NOTION_TOKEN}`
  //       }
  //     }
  //   )
  //   return 1
  // } catch (err) {
  //   console.log(err)
  //   return 0
  // }
}
async function createTicketNotionPage(req: NextApiRequest) {
  const databaseId = (await req.query.database_id)
    ? req.query.database_id
    : 'N/A'
  const ticketType = (await req.body.data?.object?.metadata
    ?.participant_ticketType)
    ? req.body.data?.object?.metadata?.participant_ticketType
    : 'N/A'
  const assigneeEmail = (await req.query.assignee_id)
    ? req.query.assignee_id
    : 'N/A'
  const ticketCode = (await req.body.data.object?.metadata
    ?.participant_ticketCode)
    ? req.body.data.object?.metadata?.participant_ticketCode
    : 'N/A'
  const paymentId = (await req.body.data.object.payment_intent)
    ? req.body.data.object.payment_intent
    : 'N/A'
  const receiptEmail = (await req.body.data?.object?.customer_details?.email)
    ? req.body.data?.object?.customer_details?.email
    : 'N/A'
  const amount = (await req.body.data?.object?.amount_total)
    ? req.body.data?.object?.amount_total
    : 'N/A'

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
      headers
    )
    return 1
  } catch (err) {
    console.log(err)
    return 0
  }
}
async function updateTicketNotionPage(req: NextApiRequest) {
  const pageId = req.query.page_id ? req.query.page_id : '' //get pageId that is the ticket code on the query, and then use that pageID

  const body = { properties: {} }

  const paymentId = req.query.payment_id ? req.query.payment_id : ''
  const assigneeEmail = req.query.assignee_email ? req.query.assignee_email : ''
  const receiptEmail = req.query.receipt_email ? req.query.receipt_email : ''
  const ticketType = req.query.ticket_type ? req.query.ticket_type : ''
  const ticketCode = req.query.ticket_code ? req.query.ticket_code : ''
  const amount = req.query.amount_total ? req.query.amount_total : ''
  if (paymentId) {
    body.properties = {
      ...body.properties,
      paymentId: { title: [{ text: { content: paymentId } }] }
    }
  }
  if (assigneeEmail) {
    body.properties = {
      ...body.properties,
      assigneeEmail: {
        rich_text: [{ text: { content: assigneeEmail } }]
      }
    }
  }
  if (ticketType) {
    body.properties = {
      ...body.properties,
      ticketType: { rich_text: [{ text: { content: ticketType } }] }
    }
  }

  if (receiptEmail) {
    body.properties = {
      ...body.properties,
      receiptEmail: { rich_text: [{ text: { content: receiptEmail } }] }
    }
  }
  if (ticketCode) {
    body.properties = {
      ...body.properties,
      ticketCode: { rich_text: [{ text: { content: ticketCode } }] }
    }
  }
  if (amount) {
    body.properties = {
      ...body.properties,
      amount: { rich_text: [{ text: { content: amount } }] }
    }
  }
  // console.log(body)
  try {
    await axios.patch(
      `https://api.notion.com/v1/pages/${pageId}`,
      body,
      headers
    )
    return 1
  } catch (err) {
    return 0
  }
}
async function deleteTicketNotionPage(req: NextApiRequest) {
  const pageId = req.query.page_id ? req.query.page_id : 'N/A'
  try {
    await axios.delete(`https://api.notion.com/v1/pages/${pageId}`, headers)
    return 1
  } catch (err) {
    return 0
  }
}
