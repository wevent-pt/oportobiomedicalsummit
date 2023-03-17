import axios from 'axios'
const stripe = require('stripe').default(process.env.STRIPE_SECRET_KEY);

// const notionApiUrl = 'https://api.notion.com/v1'
const notionApiKey = 'secret_AyvYNwuha6i495DwFjWHZ7FMRh8XDcaCGKjgKwHYxgO'
const notionApiVersion = '2022-06-28'
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Notion-Version': notionApiVersion,
        Authorization: "Bearer " + notionApiKey
    }
}

const participantsDbId = 'e4e0faf7bad8443382aca6771c132fb5';
const ticketsDbId = '2e12347eea9c440986311875d7699781';
const ticketsAvailabilityDbId = '6a5d309dd43e413cb66868e9566abf69';
const couponsAvailabilityDbId = 'ae63f9cf9ccb43229fd4a9005917e0dc';
const studentNumbersAvailabilityDbId = 'b420771345e2448bb93da953e6d7305b';


class EventTicket {
    constructor({ ticketId, ticketBird, ticketType, participantType, ambassadorCode, couponCode, metadata, assigned, paymentAmount }) {
        Object.assign(this, { ticketId, ticketBird, ticketType, participantType, ambassadorCode, couponCode, metadata, assigned, paymentAmount });
    }
    async register(participantInfo) {
        if (!await (EventTicket.isTicketIdAvailable(this.ticketId))) throw new Error('Ticket already registered');

        const ticketPage = await NotionPageManager.createPage('Ticket', {
            'Name': { title: [{ text: { content: this.ticketId } }] },
            'Ticket Bird': { rich_text: [{ text: { content: this.ticketBird } }] },
            'Ticket Type': { rich_text: [{ text: { content: this.ticketType } }] },
            'Participant Type': { rich_text: [{ text: { content: this.participantType } }] },
            'Ambassador Code': { rich_text: [{ text: { content: this.ambassadorCode } }] },
            'Coupon Code': { rich_text: [{ text: { content: this.couponCode } }] },
            'Ticket Metadata': { rich_text: [{ text: { content: JSON.stringify(this.metadata) } }] },
            'Payment Amount': { rich_text: [{ text: { content: this.paymentAmount.toString() } }] },
            'Participant Info': { rich_text: [{ text: { content: JSON.stringify(participantInfo) } }] },
            'Assigned': { rich_text: [{ text: { content: 'No' } }] },
        });
        return ticketPage.id;

    }
    static async isTicketIdAvailable(ticketId) {
        if (!ticketId || typeof ticketId !== 'string' || ticketId.trim().length === 0) {
            return false;
        }
        const response = await NotionDbManager.queryDatabase(ticketsDbId, { filter: { property: 'Name', title: { equals: ticketId } } });
        return response.results.length === 0;
    }
    static async isTicketAvailable(ticketBird, ticketType, participantType) {
        if (!ticketBird || typeof ticketBird !== 'string' || ticketBird.trim().length === 0 || !ticketType || typeof ticketType !== 'string' || ticketType.trim().length === 0 || !participantType || typeof participantType !== 'string' || participantType.trim().length === 0) {
            return false;
        }
        const databaseQuery = {
            filter: {
                and: [
                    { property: 'Ticket Type', select: { equals: ticketType } },
                    { property: 'Participant Type', select: { equals: participantType } },
                    { property: 'Ticket Bird', select: { equals: ticketBird } }
                ]
            }
        };
        const response = await NotionDbManager.queryDatabase(ticketsAvailabilityDbId, databaseQuery);
        return response.results[0].properties["Still Available"].number > 0;
    }
    static async isCouponAvailable(couponCode) {
        if (!couponCode || typeof couponCode !== 'string' || couponCode.trim().length === 0) {
            return true;
        }

        const response = await NotionDbManager.queryDatabase(couponsAvailabilityDbId, {
            filter: {
                property: 'Name',
                title: {
                    equals: couponCode,
                },
            },
        });

        return response.results[0].properties['Still Available'].number > 0;
    }
    static async valueOfCoupon(couponCode) {
        if (!couponCode || typeof couponCode !== 'string' || couponCode.trim().length === 0) {
            return true;
        }

        const response = await NotionDbManager.queryDatabase(couponsAvailabilityDbId, {
            filter: {
                property: 'Name',
                title: {
                    equals: couponCode,
                },
            },
        });
        // console.log("qtyyyyy", response.results[0].properties['Coupon Percentage'].number)
        return response.results[0].properties['Coupon Percentage'].number;
    }
    static async isStudentNumberAvailable(participantType, studentNumber) {
        if (participantType === 'ICBAS Student' && (!studentNumber || typeof studentNumber !== 'string' || studentNumber.trim().length === 0)) {
            // console.log('Student number must be given');
            throw new Error('Student number must be given');
            // return false;
        } else if (participantType != 'ICBAS Student') {
            // console.log('Student number not necessary');
            return true;
        }

        const databaseQuery = {
            filter: {
                property: 'Name',
                title: {
                    equals: studentNumber || 'Not Recognized',
                }
            },
        };

        const studentNumbers = await NotionDbManager.queryDatabase(studentNumbersAvailabilityDbId, databaseQuery);

        if (!studentNumbers || (studentNumbers.results[0]?.properties["Still Available"]?.number <= 0) || !(studentNumbers.results[0]?.properties["Still Available"])) {
            console.log(`Student Number ${studentNumber} ticket not available`);
            throw Error(`Student Number ${studentNumber} ticket not available`);
            // return 0;
        }

        const availableStudentNumbers = studentNumbers.results[0].properties["Still Available"].number;
        console.log(`There are still ${availableStudentNumbers} available tickets for Student Number ${studentNumbers.results[0]?.properties["Name"]?.title[0]?.plain_text}`);

        return availableStudentNumbers;
    }
    async assign(ticketId) {
        const updateTicketPage = async(ticketId) => {
            const databaseQuery = {
                filter: {
                    // and: [
                    // { 
                    property: 'Name',
                    title: { equals: ticketId }
                    // },
                    // { property: 'Assigned', rich_text: { equals: 'No' } }
                    // ]
                }
            };
            const response = await NotionDbManager.queryDatabase(ticketsDbId, databaseQuery);
            if (response.results[0]) {
                // console.log("assigned ticket? ", response.results[0].properties["Assigned"].rich_text[0].plain_text)
                    // console.log("assigned?? ", response.results[0].id)

                //exists, now i want to update the page
                const body = {
                    "properties": {
                        "Assigned": {
                            "rich_text": [{ "text": { "content": "Yes" } }]
                        },
                    }
                }

                NotionPageManager.updatePage(response.results[0].id, body)
                return response.results[0];
            } else return false;
        }
        const updateTicketAvailabilityPage = async(ticketBird, ticketType, participantType) => {
            if (!ticketBird || typeof ticketBird !== 'string' || ticketBird.trim().length === 0 || !ticketType || typeof ticketType !== 'string' || ticketType.trim().length === 0 || !participantType || typeof participantType !== 'string' || participantType.trim().length === 0) {
                return false;
            }
            const databaseQuery = {
                filter: {
                    and: [
                        { property: 'Ticket Type', select: { equals: ticketType } },
                        { property: 'Participant Type', select: { equals: participantType } },
                        { property: 'Ticket Bird', select: { equals: ticketBird } }
                    ]
                }
            };
            const response = await NotionDbManager.queryDatabase(ticketsAvailabilityDbId, databaseQuery);
            
            if (response.results[0]) {
              let available =  response.results[0].properties["Still Available"].number;
              if(available <= 1 ) {available = 0} else {available = available -1;}
              const body = {
                  "properties": {
                      "Still Available": {
                          "number": (available)
                      },
                  }
              }

            console.log("updateTicketAvailabilityPage: ", ticketBird, ticketType, participantType, response.results[0].id, available)

              NotionPageManager.updatePage(response.results[0].id, body)
              return response.results[0];
          } else return false;
        }
        const updateCouponAvailabilityPage = async(couponCode) => {
          if (!couponCode || typeof couponCode !== 'string' || couponCode.trim().length === 0) {
              console.log("updateCouponAvailabilityPage: ", couponCode);
              return true;
          }

          const response = await NotionDbManager.queryDatabase(couponsAvailabilityDbId, {
              filter: {
                  property: 'Name',
                  title: {
                      equals: couponCode,
                  },
              },
          });

          // return response.results[0].properties['Still Available'].number > 0;
            if (response.results[0]) {
                let available =  response.results[0].properties["Still Available"].number;
                if(available <= 1 ) {available = 0} else {available = available -1;}
                const body = {
                    "properties": {
                        "Still Available": {
                            "number": (available)
                        },
                    }
                }

                console.log("updateCouponAvailabilityPage: ", couponCode, available);
                NotionPageManager.updatePage(response.results[0].id, body);
                return response.results[0];
            } else return false;
        }
        const updateStudentNumberAvailabilityPage = async(studentNumber) => {
          if (!studentNumber || studentNumber.trim().length === 0) {
              console.log("updateStudentNumberAvailabilityPage: ", studentNumber);
              return true;
          }

          const response = await NotionDbManager.queryDatabase(studentNumbersAvailabilityDbId, {
              filter: {
                  property: 'Name',
                  title: {
                      equals: studentNumber,
                  },
              },
          });

                 // return response.results[0].properties['Still Available'].number > 0;
            if (response.results[0]) {
                let available =  response.results[0].properties["Still Available"].number;
                if(available <= 1 ) {available = 0} else {available = available -1;}
                const body = {
                    "properties": {
                        "Still Available": {
                            "number": (available)
                        },
                    }
                }

                NotionPageManager.updatePage(response.results[0].id, body);
                console.log("updateStudentNumberAvailabilityPage: ", studentNumber, available);
         
                return response.results[0];
            } else return false;
        }
        const ticketPage = await updateTicketPage(ticketId)
        if (ticketPage) {

            updateTicketAvailabilityPage(
                ticketPage.properties['Ticket Bird'].rich_text[0].plain_text,
                ticketPage.properties['Ticket Type'].rich_text[0].plain_text,
                ticketPage.properties['Participant Type'].rich_text[0].plain_text
            )
            updateCouponAvailabilityPage(
                ticketPage.properties['Coupon Code'].rich_text[0].plain_text
            )
            updateStudentNumberAvailabilityPage(
                JSON.parse(ticketPage.properties['Ticket Metadata'].rich_text[0].plain_text).studentNumber)
        }
        return true;
    }
    async delete(ticketId) {
        const databaseQuery = {
            filter: {
                and: [{
                        property: 'Name',
                        title: { equals: ticketId }
                    },
                    { property: 'Assigned', rich_text: { equals: 'No' } }
                ]
            }
        };
        const response = await NotionDbManager.queryDatabase(ticketsDbId, databaseQuery);
        if (response.results[0]) {
            console.log("ticket? ", response.results)
            const body = { "archived": true }

            NotionPageManager.updatePage(response.results[0].id, body)
            return true;
        } else return response;
    }

}
class EventParticipant {
    constructor({ name, email, phone, assignedParticipant }) {
        Object.assign(this, { name, email, phone, assignedParticipant });
    }
    async register(ticket) {
        if (!await EventParticipant.isParticipantEmailAvailable(this.email)) {
          console.log('Participant already registered');
          return false;
        }
        const participantPage = await NotionPageManager.createPage('Participant', {
            Name: { title: [{ text: { content: this.name } }] },
            Email: { rich_text: [{ text: { content: this.email } }] },
            Phone: { rich_text: [{ text: { content: this.phone } }] },
            'Ticket Info': { rich_text: [{ text: { content: JSON.stringify(ticket) } }] },
            'Assigned': { rich_text: [{ text: { content: 'No' } }] }
        });
        return participantPage.id;
    }
    async assign(participantEmail) {
        const databaseQuery = {
            filter: {
                property: 'Email',
                rich_text: { equals: participantEmail }
            }
        };
        const response = await NotionDbManager.queryDatabase(participantsDbId, databaseQuery);
        if (await response.results[0]) {
            // console.log("assigned participant? ", response.results[0].properties["Assigned"]?.rich_text[0]?.plain_text)
            const body = {
                "properties": {
                    "Assigned": {
                        "rich_text": [{ "text": { "content": "Yes" } }]
                    },
                }
            }

            NotionPageManager.updatePage(response.results[0].id, body)
            return response.results[0].properties["Assigned"].text;
        } else return response;
    }
    async delete(participantEmail) {
        const databaseQuery = {
            filter: {
                and: [{
                        property: 'Email',
                        rich_text: { equals: participantEmail }
                    },
                    { property: 'Assigned', rich_text: { equals: 'No' } }
                ]
            }
        };
        const response = await NotionDbManager.queryDatabase(participantsDbId, databaseQuery);
        if (response.results[0]) {
            console.log("participant? ", response.results)
            const body = {
                "archived": true,
            }

            NotionPageManager.updatePage(response.results[0].id, body)
            return true;
        } else return response;
    }
    static async isParticipantEmailAvailable(email) {
        const participants = await NotionDbManager.queryDatabase(participantsDbId, { 
          filter: { and: [
            { property: 'Email', rich_text: { equals: email } }, 
            { property: 'Assigned', rich_text: { does_not_equal: 'Yes' } },
          ]
          }
        });
        return participants.results.length === 0;
    }
}
class NotionPageManager {
    static async createPage(pageType, properties) {
        const databaseId = pageType === 'Participant' ? participantsDbId : ticketsDbId;
        try {
            const response = await axios.post(
                'https://api.notion.com/v1/pages', { parent: { database_id: databaseId }, properties },
                headers
            );
            return response;
        } catch (error) {
            console.error(error);
            return error;
        }
    }
    static async updatePage(pageId, body) {

        try {
            const response = await axios.patch(
                `https://api.notion.com/v1/pages/${pageId}`,
                body,
                headers
            );
            return response;
        } catch (error) {
            console.error(error);
            return error;
        }
    }
    static async deletePage(pageId, body) {
        try {
            const response = await axios.patch(
                `https://api.notion.com/v1/pages/${pageId}`,
                body,
                headers
            );
            console.log("Page deleted");
            return response;
        } catch (error) {
            console.error(error);
            return error;
        }
    }
}
class NotionDbManager {
    static async queryDatabase(dbId, query) {
        try {
            const response = await axios.post(
                `https://api.notion.com/v1/databases/${dbId}/query`, query, headers
            );
            return response.data;
        } catch (err) {
            console.error(err);
            return err;
        }
    }
}
class Payment {
    constructor({ paymentAmount, ticket }) {
        Object.assign(this, { paymentAmount, ticket });
    }

    async processPayment(ticket, participant) {
        console.log(`Processing payment of ${ticket.paymentAmount} using Stripe...\n ${JSON.stringify(ticket)}`);
        if (ticket.paymentAmount <= 0) return { sessionUrl: `https://oportobiomedicalsummit.com/api/wevent/webhooks/submitTicketing?action=paymentSuccess&ticket_id=${ticket.ticketId}&participant_email=${participant.email}` };
        // const ticketNumber = Math.random().toString(36).substr(2, 6);
        try {
            const session = await stripe.checkout.sessions.create({
                line_items: [{
                    price_data: {
                        currency: 'EUR',
                        unit_amount: ticket.paymentAmount.toString(),
                        product_data: {
                            name: `${ticket.ticketBird} Ticket-Code: ${ticket.ticketId}`,
                            images: ['https://thehcpac.org/wp-content/uploads/2016/11/redticket.png'],
                            metadata: {
                                studentNumber: ticket.metadata.studentNumber || '',
                                academicYear: ticket.metadata.academicYear || '',
                                facultyUniversity: ticket.metadata.facultyUniversity || '',
                                yearOfStudies: ticket.metadata.yearOfStudies || '',
                                facultyUniversitySchool: ticket.metadata.facultyUniversitySchool || ''
                            }
                        }
                    },
                    quantity: 1
                }],
                allow_promotion_codes: false,
                metadata: {
                    studentNumber: ticket.metadata.studentNumber || '',
                    academicYear: ticket.metadata.academicYear || '',
                    facultyUniversity: ticket.metadata.facultyUniversity || '',
                    yearOfStudies: ticket.metadata.yearOfStudies || '',
                    facultyUniversitySchool: ticket.metadata.facultyUniversitySchool || ''
                },
                payment_method_types: ['card'],
                mode: 'payment',
                success_url: `https://oportobiomedicalsummit.com/api/wevent/webhooks/submitTicketing?action=paymentSuccess&ticket_id=${ticket.ticketId}&participant_email=${participant.email}`,
                cancel_url: `https://oportobiomedicalsummit.com/api/wevent/webhooks/submitTicketing?action=paymentInsuccess&ticket_id=${ticket.ticketId}&participant_email=${participant.email}`,
            });
            return { sessionUrl: session.url };
        } catch (error) {
            console.error(`Payment failed: ${error.message}`);
            throw error;
        }
    }
}
class Event {
    constructor({ name }) {
        this.name = name;
    }

    async registerParticipant(participant, ticket) {
        await participant.register(ticket);
    }

    async registerTicket(ticket, participant) {
        await ticket.register(participant);
    }

    async purchaseTicket({ ticketId, ticketBird, ticketType, participantType, ambassadorCode, couponCode, metadata, assigned, paymentAmount }, { name, email, phone, assignedParticipant }) {
        const ticket = new EventTicket({ ticketId, ticketBird, ticketType, participantType, ambassadorCode, couponCode, metadata, assigned, paymentAmount });
        const participant = new EventParticipant({ name, email, phone, assignedParticipant }, ticket)
        // console.log("ticket: ", ticket);
        const [ticketIdAvailable, ticketsAvailable, couponAvailable, studentNumberAvailable] = await Promise.all([
            EventTicket.isTicketIdAvailable(ticket.ticketId),
            EventTicket.isTicketAvailable(ticket.ticketBird, ticket.ticketType, ticket.participantType),
            EventTicket.isCouponAvailable(ticket.couponCode),
            EventTicket.isStudentNumberAvailable(ticket.participantType, ticket.metadata.studentNumber),
        ]);

        if (ticketsAvailable <= 0) throw new Error('No available tickets for the user selections');
        if (!ticketIdAvailable) throw new Error('TicketId taken');
        if (!couponAvailable) throw new Error('No available tickets for the coupon given');
        if (!studentNumberAvailable) throw new Error('No available tickets for the student number given');
        if (couponAvailable && couponCode) {
            ticket.paymentAmount = (paymentAmount - ((await EventTicket.valueOfCoupon(couponCode)) / 100 * paymentAmount)).toString();
        }
        const paymentIntentSuccessful = await new Payment({ ticket }).processPayment(ticket, participant);
        if (!paymentIntentSuccessful) throw new Error('Payment URL generation unsuccessful');
        
            // console.log("QQQQQQQQ", participant);
        const ticketCreationSuccessful = await ticket.register(participant);
        const participantCreationSuccessful = await participant.register(ticket);
        if (ticketCreationSuccessful, participantCreationSuccessful){
          console.log("success")
        }
        // if (! await ticketCreationSuccessful) throw new Error('Temporary Ticket registration unsuccessful');

        return paymentIntentSuccessful.sessionUrl;
    }

    async assignTicket(ticket) {
        ticket.assign(ticket.ticketId);
        console.log(`Assigning ${ticket.ticketId} ticket successfull`);
    }
    async assignParticipant(participant) {
        participant.assign(participant.email);
        console.log(`Assigning ${participant.email} participant successfull`);
    }
    async removeTicket(ticket) {
        ticket.delete(ticket.ticketId)
    }
    async removeParticipant(participant) {
        participant.delete(participant.email)
    }
}

export default async function handler(req, res) {
    const { method } = req;
    if (method !== 'POST' && method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    try {
        // let action;
        if (method === 'POST') {
            const { action, ...ticketData } = req.body;
            const event = new Event({ name: 'Sample Event' });
            const ticket = new EventTicket(ticketData);
            const participant = new EventParticipant(ticketData);

            switch (action) {
                case 'purchaseTicket':
                    // console.log(res)
                    return res.status(200).json({ sessionUrl: await event.purchaseTicket(ticket, participant) });

                case 'registerParticipant':
                    await event.registerParticipant(participant, ticket);
                    return res.status(200).json({ success: 'Participant registered with success' });

                case 'registerTicket':
                    await event.registerTicket(ticket, participant);
                    return res.status(200).json({ success: 'Ticket registered with success' });

                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }
        } else {
            const action = req.query.action;
            const ticketId = req.query.ticket_id;
            const participantEmail = req.query.participant_email;
            const event = new Event({ name: 'Sample Event' });
            const ticket = new EventTicket({ ticketId });
            const participant = new EventParticipant({ email: participantEmail }, ticket);
            switch (action) {
                case 'paymentSuccess':
                    console.log("Assigning ticket...", ticketId);
                    //update ticket page that contains ticketId and property Assigned equals No
                    event.assignTicket(ticket);
                    event.assignParticipant(participant);
                    //updates tickets, coupons, studentNumber availability
                    return res.status(200).json({ success: 'Ticket payment with success' });
                case ('paymentInsuccess'):
                    console.log("Removing ticket...", ticketId);
                    event.removeTicket(ticket);
                    console.log("Removing participant...", participantEmail);
                    event.removeParticipant(participant);
                    return res.status(200).json({ success: 'Ticket payment with insuccess' });
                default:
                    return res.status(200).json({ success: 'Ticket payment with success!!!' });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `${error.message}` });
    }
}