import { NextApiRequest } from 'next'

import axios from 'axios'

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(500).json({ message: 'Error with request' });
  const action = req.query.action;

  if (action === 'create') {
    if (!(await createUserNotionPage(req))) return res.status(501).json({ message: 'Error with user creation' });
  } else if (action === 'update') {
    if (!(await updateUserNotionPage(req))) return res.status(502).json({ message: 'Error with user update' });
  } else if (action === 'delete') {
    if (!(await deleteUserNotionPage(req))) return res.status(503).json({ message: 'Error with user deletion' });
  } else return res.status(500).json({ message: 'Error with action' });
  
  return res.status(200).json({ message: 'Payment Webhook successful' });
}

async function createUserNotionPage(req: NextApiRequest) {
  const databaseId = req.query.database_id ? req.query.database_id : 'N/A'
  const email = req.query.email ? req.query.email : 'N/A'
  const name = req.query.name ? req.query.name : 'N/A'
  const ticketId = req.query.ticket_id ? req.query.ticket_id : 'N/A'

  try {
    await axios.post(
      `https://api.notion.com/v1/pages`,
      {
        parent: { database_id: databaseId },
        properties: {
          email: { title: [{ text: { content: email } }] },
          name: { rich_text: [{ text: { content: name } }] },
          ticketId: { rich_text: [{ text: { content: ticketId } }] }
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

async function updateUserNotionPage(req: NextApiRequest) {
  const pageId = req.query.page_id ? req.query.page_id : 'N/A'
  const properties = req.body.properties
  try {
    await axios.patch(
      `https://api.notion.com/v1/pages/${pageId}/properties`,
      properties,
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

async function deleteUserNotionPage(req: NextApiRequest) {
  const pageId = req.query.page_id
  try {
    await axios.delete(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Notion-Version': `${process.env.NOTION_VERSION}`,
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`
      }
    })
    return 1
  } catch (err) {
    return 0
  }
}
