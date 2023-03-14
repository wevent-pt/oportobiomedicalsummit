// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// import type { NextApiRequest, NextApiResponse } from 'next';

// interface StripeTicket {
//   id: string;
//   name: string;
//   price: number;
// }

// class Promotion {
//   name: string;
//   discountAmount: number;
//   discountType: 'percentage' | 'fixed';

//   constructor(name: string, discountAmount: number, discountType: 'percentage' | 'fixed') {
//     this.name = name;
//     this.discountAmount = discountAmount;
//     this.discountType = discountType;
//   }

//   calculateDiscount(amount: number): number {
//     if (this.discountType === 'percentage') {
//       return amount * (this.discountAmount / 100);
//     } else if (this.discountType === 'fixed') {
//       return this.discountAmount;
//     } else {
//       throw new Error('Invalid discount type.');
//     }
//   }
// }


// const tickets = [
//   new StripeTicket('General Admission', 100, 'Standard admission ticket', 'https://thehcpac.org/wp-content/uploads/2016/11/redticket.png', 'gen_adm'),
//   new StripeTicket('VIP Admission', 200, 'Includes access to VIP lounge', 'https://thehcpac.org/wp-content/uploads/2016/11/goldticket.png', 'vip_adm'),
//   new StripeTicket('Student Admission', 50, 'Discounted ticket for students', 'https://thehcpac.org/wp-content/uploads/2016/11/blueticket.png', 'std_adm')
// ];

// const promotions = [
//   new Promotion('SPRINGSALE', 20, 'percentage'),
//   new Promotion('SUMMERSALE', 50, 'fixed')
// ];

// export default async function handler(req, res) {
//   if (req.method === 'POST' || req.method === 'GET') {
//     try {
//       const ticket = tickets.find(ticket => ticket.name === req.query.ticket_type);
//       if (!ticket) {
//         throw new Error('Invalid ticket type.');
//       }

//       const promotion = promotions.find(promotion => promotion.name === req.query.promo_code);
//       const discount = promotion ? promotion.calculateDiscount(ticket.price) : 0;

//       const randomId = function(length = 6) {
//         return (Math.random()*Date.now() ).toString(36).substring(2, length+2);
//       };
//       const ticketNumber = randomId(7).slice(0,6)
//       const session = await stripe.checkout.sessions.create({
//         line_items: [
//           {
//             amount: (ticket.price - discount) * 100, // convert to cents
//             currency: 'EUR',
//             quantity: 1,
//             description: `${ticket.description}, ${ticket.name} ticket`,
//             name: `Ticket code: ${ticketNumber}`,
//             images: [
//               ticket.image
//             ],
//           }
//         ],
  
//         allow_promotion_codes: true,
//         metadata: {
//           participant_name: req.query.name,
//           participant_email: req.query.email,
//           participant_ticketType: ticket.name,
//           participant_ticketCode: ticketNumber
//         },
//         tax_id_collection: {
//           enabled: true
//         },
//         mode: 'payment',
//         success_url: `http://localhost:3000/api/handlwstripe?success=true`, //!!!
//         cancel_url: `http://localhost:3000/api/handlwstripe?canceled=true` //!!!
//       });
//       res.redirect(303, session.url);
//     } catch (err) {
//       res.status(err.statusCode || 500).json(err.message);
//     }
//   } else {
//     res.setHeader('Allow', 'POST');
//     res.status(405).end('Method Not Allowed');
//   }
// }







import { NextApiRequest, NextApiResponse } from 'next';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
interface StripeTicket {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

class Promotion {
  constructor(public name: string, public discountAmount: number, public discountType: 'percentage' | 'fixed') {}

  calculateDiscount(amount: number): number {
    return this.discountType === 'percentage' ? amount * (this.discountAmount / 100) : this.discountAmount;
  }
}

const tickets: StripeTicket[] = [
  { id: 'gen_adm', name: 'General Admission', price: 100, description: 'Standard admission ticket', image: 'https://thehcpac.org/wp-content/uploads/2016/11/redticket.png' },
  { id: 'vip_adm', name: 'VIP Admission', price: 200, description: 'Includes access to VIP lounge', image: 'https://thehcpac.org/wp-content/uploads/2016/11/goldticket.png' },
  { id: 'std_adm', name: 'Student Admission', price: 50, description: 'Discounted ticket for students', image: 'https://thehcpac.org/wp-content/uploads/2016/11/blueticket.png' }
];

const promotions: Promotion[] = [
  new Promotion('SPRINGSALE', 20, 'percentage'),
  new Promotion('SUMMERSALE', 50, 'fixed')
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['POST', 'GET'].includes(req.method)) return res.status(405).setHeader('Allow', 'POST').end('Method Not Allowed');
  if (['GET'].includes(req.method)){
  try {
    const ticketType = req.query.ticket_type?.toString() || '';
    const promoCode = req.query.promo_code?.toString() || '';
    const ticket = tickets.find(ticket => ticket.name === ticketType);
    if (!ticket) throw new Error('Invalid ticket type.');
    const promotion = promotions.find(promotion => promotion.name === promoCode);
    const discount = promotion ? promotion.calculateDiscount(ticket.price) : 0;
    const ticketNumber = Math.random().toString(36).substr(2, 6);
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'EUR',
            unit_amount: (ticket.price - discount) * 100,
            product_data: {
              name: `${ticket.description}, ${ticket.name} ticket`,
              images: [ticket.image],
              metadata: { ticketCode: ticketNumber }
            }
          },
          quantity: 1
        }
      ],
      allow_promotion_codes: true,
      metadata: {
        participant_name: req.query.name?.toString(),
        participant_email: req.query.email?.toString(),
        participant_ticketType: ticket.name,
        participant_ticketCode: ticketNumber
      },
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `http://localhost:3000/success`,
      cancel_url: `http://localhost:3000/cancel`
    });
    return res.redirect(303, session.url);
  } catch (error) {
    // Handle error
  }}
  else if(['POST'].includes(req.method)){
    try {
      const ticketType = req.query.ticket_type?.toString() || 'gen_adm';
      const ticketPrice = 10;
      const ticket = tickets.find(ticket => ticket.id === ticketType);
      if (!ticket) throw new Error('Invalid ticket type.');
      const ticketNumber = Math.random().toString(36).substr(2, 6);
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'EUR',
              unit_amount: 1000,
              product_data: {
                name: `${ticket.description}, ${ticket.name} ticket`,
                images: [ticket.image],
                metadata: { ticketCode: ticketNumber }
              }
            },
            quantity: 1
          }
        ],
        allow_promotion_codes: true,
        metadata: {
          participant_name: req.query.name?.toString(),
          participant_email: req.query.email?.toString(),
          participant_ticketType: ticket.name,
          participant_ticketCode: ticketNumber
        },
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `http://localhost:3000/success`,
        cancel_url: `http://localhost:3000/cancel`
      });
      return res.status(200).json({ sessionUrl: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while processing the request.' });
  }}
}
