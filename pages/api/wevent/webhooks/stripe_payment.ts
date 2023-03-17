import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST' || req.body.type !== 'checkout.session.completed') {
    return res.status(500).json({ message: 'Error with request' });
  }

  const created = await createTicketNotionPage(req);
  const emailed = await sendTicketEmail(req);

  const status = created && emailed ? 200 : 500;
  const message = created && emailed ? 'Successful Payment Webhook' : 'Error with request';

  return res.status(status).json({ message });
};

async function createTicketNotionPage(req: NextApiRequest) {
  const { database_id = 'N/A' } = req.query;
  const { participant_ticketType: ticketType = 'N/A', participant_ticketCode: ticketCode = 'N/A' } = req.body.data?.object?.metadata || {};
  const { assignee_id: assigneeEmail = 'N/A' } = req.query;
  const { payment_intent: paymentId = 'N/A' } = req.body.data?.object || {};
  const { email: receiptEmail = 'N/A' } = req.body.data?.object?.customer_details || {};
  const { amount_total: amount = 'N/A' } = req.body.data?.object || {};

  try {
    await axios.post(
      `https://api.notion.com/v1/pages`,
      {
        parent: { database_id },
        properties: {
          paymentId: { title: [{ text: { content: paymentId } }] },
          receiptEmail: { rich_text: [{ text: { content: receiptEmail } }] },
          assigneeEmail: { rich_text: [{ text: { content: assigneeEmail } }] },
          ticketType: { rich_text: [{ text: { content: ticketType } }] },
          ticketCode: { rich_text: [{ text: { content: ticketCode } }] },
          amount: { rich_text: [{ text: { content: amount.toString() } }] },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Notion-Version': `${process.env.NOTION_VERSION}`,
          Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        },
      }
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function sendTicketEmail(req: NextApiRequest) {
  const { ticketType = 'N/A' } = req.query;
  const { id: paymentId = 'N/A', receipt_email: receiptEmail = 'N/A' } = req.body.data?.object || {};

  console.log(`logging: ${ticketType} ( ticketType )`,`logging: ${paymentId} ( paymentId )`,`logging: ${receiptEmail} ( receiptEmail )`);

  return true;
}
