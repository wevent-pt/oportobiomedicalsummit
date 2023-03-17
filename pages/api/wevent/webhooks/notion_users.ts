        import { NextApiRequest, NextApiResponse } from 'next'

        import axios from 'axios'

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
            if (!(await createUserNotionPage(req)))
              return res.status(501).json({ message: 'Error with user creation' })
          } else if (action === 'update') {
            if (!(await updateUserNotionPage(req)))
              return res.status(502).json({ message: 'Error with user update' })
          } else if (action === 'delete') {
            if (!(await deleteUserNotionPage(req)))
              return res.status(503).json({ message: 'Error with user deletion' })
          } else return res.status(500).json({ message: 'Error with action' })

          return res.status(200).json({ message: 'Notion User Webhook successful' })
        }

        async function createUserNotionPage(req: NextApiRequest) {
          const body = {
            parent: { database_id: req.query.database_id ? req.query.database_id : 'N/A' },
            properties: {
              email: { title: [{ text: { content: req.query.email ? req.query.email : 'N/A' } }] },
              name: { rich_text: [{ text: { content: req.query.name ? req.query.name : 'N/A' } }]} ,
              ticketId: { rich_text: [{text: { content: req.query.ticket_id ? req.query.ticket_id : 'N/A' } }] }
            }
          }

          try {
            await axios.post(`https://api.notion.com/v1/pages`, body, headers)
            return 1
          } catch (err) {
            return 0
          }
        }

        async function updateUserNotionPage(req: NextApiRequest) {
          const email = req.query.email ? req.query.email : ''
          const pageId = req.query.page_id ? req.query.page_id : ''

          const name = req.query.name ? req.query.name : ''
          const ticketId = req.query.ticket_id ? req.query.ticket_id : ''

          const body = { properties: {} }

          if (name) {
            body.properties = {
              ...body.properties,
              name: { rich_text: [{ text: { content: name } }] }
            }
          }
          if (ticketId) {
            body.properties = {
              ...body.properties,
              ticketId: { rich_text: [{ text: { content: ticketId } }] }
            }
          }
          if (email) {
            body.properties = {
              ...body.properties,
              email: { title: [{ text: { content: email } }] }
            }
          }
          // console.log(body.properties)

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

        async function deleteUserNotionPage(req: NextApiRequest) {
          const pageId = req.query?.page_id ? req.query?.page_id : 'N/A'
          try {
            await axios.delete(`https://api.notion.com/v1/pages/${pageId}`, headers)
            return 1
          } catch (err) {
            return 0
          }
        }
