import { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'
// import { request } from 'http'

const headers = {
  headers: {
    'Content-Type': 'application/json',
    'Notion-Version': `${process.env.NOTION_VERSION}`,
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST' || !req.query.action)
    return res.status(500).json({ message: 'Error with request' })
  const action = req.query.action

  if (action === 'create') {
    if (await createTicketNotionPage(req))
      return res.status(200).json({ message: 'Ticket created' })
  } else if (action === 'update') {
    if (await updateTicketNotionPage(req))
      return res.status(200).json({ message: 'Ticket updated' })
  } else if (action === 'delete') {
    if (await deleteTicketNotionPage(req))
      return res.status(200).json({ message: 'Ticket deleted' })
  } else if (action === 'validate') {
    if (await validateTicketNotionPage(req)) {
      return res.status(200).json({ message: 'Ticket is valid!' })
    }
  } else {
    return res
      .status(500)
      .json({ message: `Error with action ${req.query?.action}` })
  }
  return res.status(200).json({ message: 'Notion Ticket Webhook successful' })
}
async function validateTicketNotionPage(req: NextApiRequest) {
  const ticketCode = req.query.ticket_code
  const userEmail = req.query.email
  // const ticketPaymentId = 'pi_3MWVjJBg4lHvVejr1zB2nzaB'
  // const checkoutIdfromNotion = 'cs_test_b1g8Zz9Yy2mpBhIBgHSXWcbQrMQmMXOFhiLhYwsU38wrIlCFpiYdgNpQjb'
  // const stripe = require('stripe')('sk_test_51L5MzLBg4lHvVejrb4zYLpMKZY9s2eK8DzwypbV0nCy92iAgsgfYMxeuZuAoGlaKRlK7Sgg9QGCJrs6IR5TThHXy00L4h63yxX');
  // Search charges by metadata
  // const pi = await stripe.paymentIntents.retrieve(`${ticketPaymentId}`);
  // console.log(`payment status: ${JSON.stringify(pi.status)}`)
  if (ticketCode) {
    console.log(`validating ticket with code no: ${ticketCode}...`)
    const isValidCode = await queryTicketNotionDatabase(req)
    console.log('ticket validation result: ', await isValidCode)

    console.log(`\nvalidating user with email: ${userEmail}...`)
    const isValidUser = await queryUserNotionDatabase(req)
    console.log('user validation result: ', await isValidUser)

    console.log(`regist of ticket with receipt no: ${ticketCode}...`)
    if (!isValidUser) {
      createUserNotionPage(req)
    }
  }

  return 1
  // }
  // return 0
}
async function queryUserNotionDatabase(req: NextApiRequest) {
  // let resultb = ''

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
        {
          headers: {
            'Content-Type': 'application/json',
            'Notion-Version': `${process.env.NOTION_VERSION}`,
            Authorization: `Bearer ${process.env.NOTION_TOKEN}`
          }
        }
      )
      .then((response) => {
        let userNotionEmail = ''
        // const ticketCode = response.data.results[0].properties.ticketCode.rich_text[0].plain_text
        // const ticketType = response.data.results[0].properties.ticketType.rich_text[0].plain_text
        // const
        userNotionEmail =
          response.data.results[0].properties.email.title[0].text.content
          const ticket = response.data?.results[0]?.properties?.ticket?.rich_text[0]?.plain_text
          const name = response.data?.results[0]?.properties?.name?.rich_text[0]?.plain_text
          
          // console.log(`${JSON.stringify(ticket)}`)

        console.log(`
        email: ${userNotionEmail}
        name: ${name}
        ticket: ${ticket}
      `)
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
        {
          headers: {
            'Content-Type': 'application/json',
            'Notion-Version': `${process.env.NOTION_VERSION}`,
            Authorization: `Bearer ${process.env.NOTION_TOKEN}`
          }
        }
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

  console.log(req);
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
