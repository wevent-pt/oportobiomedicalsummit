import { NextApiRequest, NextApiResponse } from 'next';

const stripe = require('stripe').default(process.env.STRIPE_SECRET_KEY);

// import { stripe } from 'stripe';


const tickets = [
  { id: 'gen_adm', name: 'OBS', description: 'Standard admission ticket', image: 'https://thehcpac.org/wp-content/uploads/2016/11/redticket.png' },
  { id: 'vip_adm', name: 'VIP Admission', description: 'Includes access to VIP lounge', image: 'https://thehcpac.org/wp-content/uploads/2016/11/goldticket.png' },
  { id: 'std_adm', name: 'Student Admission', description: 'Discounted ticket for students', image: 'https://thehcpac.org/wp-content/uploads/2016/11/blueticket.png' }
];


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['POST', 'GET'].includes(req.method)) return res.status(405).setHeader('Allow', 'POST').end('Method Not Allowed');
 
  try {
    
// const stripe = await loadStripe(process.env.STRIPE_SECRET_KEY);
    const ticketType = req.query.ticket_type?.toString() || 'gen_adm';
    const ticketPrice = req.query.ticket_price || 1000;
    const participantEmail = req.query.participant_email || '';

    if (ticketPrice <= 0){//!!!and more security
      
    return res.status(200).json({ sessionUrl: "https://oportobiomedicalsummit.com/success?ticket_code=aaa&&email=aaa@gmail.com" });//!!!
    }
    // const ticketPrice = 10;
    const ticket = tickets.find(ticket => ticket.id === ticketType);
    if (!ticket) throw new Error('Invalid ticket type.');
    const ticketNumber = Math.random().toString(36).substr(2, 6);
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'EUR',
            unit_amount: ticketPrice,
            product_data: {
              name: `${ticket.name} Ticket-Code: ${ticketNumber}`,
              images: [ticket.image],
              metadata: { 
                ticketCode: ticketNumber,
                participantEmail: participantEmail
              }
            }
          },
          quantity: 1
        }
      ],
      allow_promotion_codes: false,
      metadata: {
        participant_name: req.query.name?.toString(),
        participant_email: req.query.email?.toString(),
        participant_ticketType: ticket.name,
        participant_ticketCode: ticketNumber,
        participantEmail: participantEmail
      },
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `https://oportobiomedicalsummit.com/api/handlestripe?success=true&ticket_code=${ticketNumber}`, //!!!
      cancel_url: `https://oportobiomedicalsummit.com/api/handlestripe?canceled=true`, //!!!
    });
    return res.status(200).json({ sessionUrl: session.url });
    // return Response.redirect(session.url, 303);
} catch (error) {
  console.error(error);
  return res.status(500).json({ error: 'An error occurred while processing the request.' });
}
}
