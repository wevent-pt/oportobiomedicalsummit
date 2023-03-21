import axios from 'axios'
const stripe = require('stripe').default('sk_test_51L5MzLBg4lHvVejrb4zYLpMKZY9s2eK8DzwypbV0nCy92iAgsgfYMxeuZuAoGlaKRlK7Sgg9QGCJrs6IR5TThHXy00L4h63yxX');

// const notionApiKey = 'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P' //ticketing1: secret_zM86Gogu5oR0kgOzcallucSXyJf2wYxYpTpIsdfsR3v

const notionApiKeys = [
    'secret_B7EfjTkZLgH3UvsJ9YSTEWzQpk6hoYthOIKOo8o2bWR',
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P',
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P',
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P',
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P'
]
const notionApiVersion = '2022-06-28'
// const headers = {
//     headers: {
//         'Content-Type': 'application/json',
//         'Notion-Version': notionApiVersion,
//         Authorization: "Bearer " + notionApiKey,
//         'Access-Control-Allow-Origin': '*'
//     }
// }

const participantsDbId = 'eb98b71ccb4b4aa2a5407961eed26bea';
const ticketsDbId = '5dbaccb7c3484d9b8c12878b5aac92c7';
const ticketsAvailabilityDbId = 'eca8f685664a452583b448e81cdfe3ef';
const couponsAvailabilityDbId = '14f3f2f6d0fc488cb72d8bd7554a14fb';
const studentNumbersAvailabilityDbId = 'f3fdc42694ed4913a336cacfcf19d6a2';
const reservationsDbId = '443518c87bcc479d8805bddf1e84377a';
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1000;


class EventTicket {
    constructor({ ticketId, ticketBird, ticketType, participantType, ambassadorCode, couponCode, metadata, assigned, paymentAmount, paymentIntent }) {
        Object.assign(this, { ticketId, ticketBird, ticketType, participantType, ambassadorCode, couponCode, metadata, assigned, paymentAmount, paymentIntent });
    }
    async get() {
        try {
            if (!this.ticketId || !this.validInput(this.ticketId)) {
                throw new Error(`Invalid ticket id: ${this.ticketId}`);
            }
            const response = await NotionDbManager.query(ticketsDbId, { filter: { property: 'Name', title: { equals: this.ticketId } } });

            if (!response || !response.results || response.results.length === 0) {
                throw new Error(`No results found for 'Name' = ${this.ticketId}`);
            }

            return response.results[0];
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    async create(participant) {
        const ticketPage = await NotionPageManager.createPage('Ticket', {
            'Name': { title: [{ text: { content: this.ticketId } }] },
            'Ticket Bird': { rich_text: [{ text: { content: this.ticketBird } }] },
            'Ticket Type': { rich_text: [{ text: { content: this.ticketType } }] },
            'Participant Type': { rich_text: [{ text: { content: this.participantType } }] },
            'Ambassador Code': { rich_text: [{ text: { content: this.ambassadorCode || 'a' } }] },
            'Coupon Code': { rich_text: [{ text: { content: this.couponCode } }] },
            'Ticket Metadata': { rich_text: [{ text: { content: JSON.stringify(this.metadata) || 'a' } }] },
            'Payment Amount': { rich_text: [{ text: { content: this.paymentAmount.toString() } }] },
            'Participant Info': { rich_text: [{ text: { content: JSON.stringify(participant) } }] },
            'Assigned': { rich_text: [{ text: { content: this.assigned } }] },
            'Payment Intent': { rich_text: [{ text: { content: this.paymentIntent } }] },
        });

        return ticketPage.id;
    }
    async createReservation(participant) {
        const ticketPage = await NotionPageManager.createPage('Reservation', {
            'Name': { title: [{ text: { content: this.ticketId } }] },
            'Ticket Bird': { rich_text: [{ text: { content: this.ticketBird } }] },
            'Ticket Type': { rich_text: [{ text: { content: this.ticketType } }] },
            'Participant Type': { rich_text: [{ text: { content: this.participantType } }] },
            'Ambassador Code': { rich_text: [{ text: { content: this.ambassadorCode || 'a' } }] },
            'Coupon Code': { rich_text: [{ text: { content: this.couponCode } }] },
            'Ticket Metadata': { rich_text: [{ text: { content: JSON.stringify(this.metadata) || 'a' } }] },
            'Payment Amount': { rich_text: [{ text: { content: this.paymentAmount.toString() } }] },
            'Participant Info': { rich_text: [{ text: { content: JSON.stringify(participant) } }] },
            'Assigned': { rich_text: [{ text: { content: this.assigned } }] },
            'Payment Intent': { rich_text: [{ text: { content: this.paymentIntent } }] },
        });

        return ticketPage.id;
    }
    async deleteReservation() {
        const response = await NotionDbManager.query(reservationsDbId, {
            filter: { property: 'Name', title: { equals: this.ticketId } }
        });
        if (response.results[0]) {
            const body = { "archived": true }

            return await NotionPageManager.updatePage(response.results[0].id, body);
        } else return false;
    }
    async delete() {
        const response = await NotionDbManager.query(ticketsDbId, {
            filter: {
                and: [
                    { property: 'Name', title: { equals: this.ticketId } },
                    { property: 'Assigned', rich_text: { equals: 'No' } }
                ]
            }
        });
        if (response.results[0]) {
            const body = { "archived": true }

            return await NotionPageManager.updatePage(response.results[0].id, body);
        } else return false;
    }
    async checkAvailability() {
        const { ticketId, ticketBird, ticketType, participantType, couponCode, metadata } = this;
        if (!ticketId || !this.validInput(ticketId)) {
            throw new Error(`Invalid ticket id: ${ticketId}`);
        }

        if (![ticketBird, ticketType, participantType].every(prop => this.validInput(prop))) {
            throw new Error(`One or more required properties are invalid: ${ticketBird}, ${ticketType}, ${participantType}`);
        }

        const ticketExists = !(await NotionDbManager.query(ticketsDbId, { filter: { property: 'Name', title: { equals: ticketId } } })).results.length;
        if (!ticketExists) {
            throw new Error(`Ticket ${ticketId} does not exist`);
        }

        const availabilityResponse = await NotionDbManager.query(ticketsAvailabilityDbId, {
            filter: {
                and: [
                    { property: 'Ticket Type', select: { equals: ticketType } },
                    { property: 'Participant Type', select: { equals: participantType } },
                    { property: 'Ticket Bird', select: { equals: ticketBird } }
                ]
            }
        });
        const isTicketAvailable = availabilityResponse?.results?.[0]?.properties?.["Still Available"]?.number > 0;
        if (!isTicketAvailable) {
            throw new Error(`Ticket ${ticketType} ${ticketBird} for ${participantType} is not available`);
        }

        if (couponCode) {
            if (!this.validInput(couponCode)) {
                throw new Error(`Invalid coupon code: ${couponCode}`);
            }
            const couponResponse = await NotionDbManager.query(couponsAvailabilityDbId, {
                filter: { property: 'Name', title: { equals: couponCode } }
            });
            const isCouponAvailable = couponResponse?.results?.[0]?.properties?.['Still Available']?.number > 0;
            if (!isCouponAvailable) {
                throw new Error(`Coupon ${couponCode} is not available`);
            }
        }

        if (participantType === 'ICBAS Student') {
            if (!this.validInput(metadata.studentNumber)) {
                throw new Error(`Invalid student number: ${metadata.studentNumber}`);
            }
            const studentNumberResponse = await NotionDbManager.query(studentNumbersAvailabilityDbId, {
                filter: { property: 'Name', title: { equals: metadata.studentNumber } }
            });
            const isStudentNumberAvailable = studentNumberResponse?.results?.[0]?.properties?.['Still Available']?.number > 0;
            if (!isStudentNumberAvailable) {
                throw new Error(`Student number ${metadata.studentNumber} is not available`);
            }
        }
    }
    async pay(participant) {
        try {
            await this.checkAvailability();


            const valueOfCoupon = await this.valueOfCoupon();
            this.paymentAmount = ((100 - valueOfCoupon) / 100 * this.paymentAmount).toString();

            if(this.paymentAmount > 0){
                const session = await (new Payment({ ticket: this, participant })).getStripeSession();
                const [isTicketRegistrationSuccessful, isParticipantRegistrationSuccessful] = await Promise.all([
                    this.metadata = { payment_intent: session.payment_intent, ...this.metadata },
                    this.paymentIntent = session.payment_intent,
                    participant.paymentIntent = session.payment_intent,
                    this.createReservation(participant),
                    this.create(participant),
                    participant.create(this),
                ]);
                if (!(isTicketRegistrationSuccessful && isParticipantRegistrationSuccessful)) {
                    throw new Error('Ticket registration or participant registration failed.');
                }

                const ticketAvailabilityId = `${this.ticketBird} ${this.ticketType} ${this.participantType}`;

                if(this.validInput(this.couponCode)){
                    const updatedCouponAvailability = await this.updateAvailabilityPage(-1, couponsAvailabilityDbId, this.couponCode);
                    if( !updatedCouponAvailability){
                        console.log("error updating updatedCouponAvailability!!!")
            
                    }
                }
                if(this.validInput(this.metadata.studentNumber)){
                    const updatedStudentNumberAvailability = await this.updateAvailabilityPage(-1, studentNumbersAvailabilityDbId, this.metadata.studentNumber);
                    if( !updatedStudentNumberAvailability){
                        console.log("error updating updatedStudentNumberAvailability!!!")
            
                    }
                }
            
                if(this.validInput(ticketAvailabilityId)){
                    const updatedTicketAvailability = await this.updateAvailabilityPage(-1, ticketsAvailabilityDbId, ticketAvailabilityId);
                    if( !updatedTicketAvailability){
                        console.log("error updating updatedTicketAvailability!!!")
            
                    }
                }

                console.log(session.payment_intent)
                return session ? session.sessionUrl : false;
            }
            else{

                const [isTicketRegistrationSuccessful, isParticipantRegistrationSuccessful] = await Promise.all([
                    this.metadata = { payment_intent: 'coupon', ...this.metadata },
                    this.paymentIntent = 'coupon',
                    participant.paymentIntent = 'coupon',
                    this.createReservation(participant),
                    this.create(participant),
                    participant.create(this),
                ]);
                
                if (!(isTicketRegistrationSuccessful && isParticipantRegistrationSuccessful)) {
                    throw new Error('Ticket registration or participant registration failed.');
                }

                const ticketAvailabilityId = `${this.ticketBird} ${this.ticketType} ${this.participantType}`;

                if(this.validInput(this.couponCode)){
                    const updatedCouponAvailability = await this.updateAvailabilityPage(-1, couponsAvailabilityDbId, this.couponCode);
                    if( !updatedCouponAvailability){
                        console.log("error updating updatedCouponAvailability!!!")
            
                    }
                }
                if(this.validInput(this.metadata.studentNumber)){
                    const updatedStudentNumberAvailability = await this.updateAvailabilityPage(-1, studentNumbersAvailabilityDbId, this.metadata.studentNumber);
                    if( !updatedStudentNumberAvailability){
                        console.log("error updating updatedStudentNumberAvailability!!!")
            
                    }
                }
            
                if(this.validInput(ticketAvailabilityId)){
                    const updatedTicketAvailability = await this.updateAvailabilityPage(-1, ticketsAvailabilityDbId, ticketAvailabilityId);
                    if( !updatedTicketAvailability){
                        console.log("error updating updatedTicketAvailability!!!")
            
                    }
                }


                try {
                    // Check that ticket and participant objects exist
                    if (!this || !participant) {
                        throw new Error('Ticket or participant not found');
                    }
                    try {
                        const ticketAssignment = await this.assign();
                        const participantAssignment = await participant.assign();
                        if (!ticketAssignment || !participantAssignment) {
                            throw new Error(`Failed to ticketAssignment or participantAssignment: ${ticketAssignment || participantAssignment}`);
                        }
                        // const reservationDeletion = await ticket.deleteReservation();
                        await this.deleteReservation();
                        // return response.status(200).json({ success: 'Ticket payment with success' });
                        return `https://oportobiomedicalsummit.com/ticket-success`
                        } catch (error) {
                            console.error('Error handling Successful payment:', error);
                            return false
                        } 
                } catch (error) {
                    console.error('Error handling Successful payment:', error);
                    return false;
                } 
            }

            
            
            

        } catch (error) {
            console.error(error);
            throw new Error('Payment process failed.');
        }
    }

    validInput(input) {
        if (typeof input !== 'string' || !input.trim()) {
            return false;
        }
        return true;
    }

    async valueOfCoupon() {
        if (!this.validInput(this.couponCode)) {
            return false;
        }

        const response = await NotionDbManager.query(couponsAvailabilityDbId, {
            filter: { property: 'Name', title: { equals: this.couponCode } }
        });

        return response?.results?.[0]?.properties?.['Coupon Percentage']?.number || false;
    }

    async assign() {
        console.log("assingnin: ", this.ticketId);
        const response = await NotionDbManager.query(ticketsDbId, {
            filter: { property: 'Name', title: { equals: this.ticketId } }
        });
        if (!response.results?.[0]) {
            throw new Error(`Ticket with Id "${this.ticketId}" not found`);
        }
        const ticketPageId = response.results[0].id;
        const ticketPage = await NotionPageManager.updatePage(ticketPageId, {
            properties: {
                'Assigned': { rich_text: [{ text: { content: 'Yes' } }] },
            },
        });
        if (!ticketPage) {
            throw new Error(`ticketPage with Id "${this.ticketId}" not updated`);
        }


        return true;
    }

    async updateAvailabilityPage(qty, dbId, name) {
        const response = await NotionDbManager.query(dbId, {
            filter: {
                property: 'Name',
                title: { equals: name },
            },
        });
        if (!response.results?.[0]) {
            throw new Error(`Entry with name "${name}" not found in database with Id "${dbId}"`);
        }
        const pageId = response.results[0].id;
        const available = Math.max(0, response.results[0].properties['Still Available'].number + qty);

        return await NotionPageManager.updatePage(pageId, { properties: { 'Still Available': { number: available } } });
    }

}
class EventParticipant {
    constructor({ name, email, phone, assigned, paymentIntent }) {
        Object.assign(this, { name, email, phone, assigned, paymentIntent });
    }
    validInput(input) {
        if (typeof input !== 'string' || !input.trim()) {
            return false;
        }
        return true;
    }

    async get() {
        try {
            if (!this.email || !this.validInput(this.email)) {
                throw new Error(`Invalid participant email: ${this.email}`);
            }
            const response = await NotionDbManager.query(participantsDbId, { filter: { property: 'Email', title: { equals: this.email } } });

            if (!response || !response.results || response.results.length === 0) {
                throw new Error(`No results found for 'Email' = ${this.email}`);
            }
            return response.results[0];
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    async create(ticket) {
        if (!await this.isEmailAvailable()) {
            return true;
        }

        const participantPage = await NotionPageManager.createPage('Participant', {
            Name: { title: [{ text: { content: this.name } }] },
            Email: { rich_text: [{ text: { content: this.email } }] },
            Phone: { rich_text: [{ text: { content: this.phone } }] },
            'Ticket Info': { rich_text: [{ text: { content: JSON.stringify(ticket) } }] },
            'Assigned': { rich_text: [{ text: { content: this.assigned } }] },
            'Payment Intent': { rich_text: [{ text: { content: this.paymentIntent } }] },
        });
        return participantPage.id;
    }
    async assign() {
        console.log("assigning ",this.email);
        const databaseQuery = {
            filter: {
                property: 'Email',
                rich_text: { equals: this.email }
            }
        };
        const response = await NotionDbManager.query(participantsDbId, databaseQuery);
        if (await response.results[0]) {
            const body = {
                "properties": {
                    "Assigned": {
                        "rich_text": [{ "text": { "content": "Yes" } }]
                    },
                }
            }
        const participantPageId = response.results[0].id;
        const participantPage = await NotionPageManager.updatePage(participantPageId, body);

        if (!participantPage) {
            throw new Error(`participantPage with Id "${participantPageId}" not updated`);
        }
            return true;
        } else return false;
    }
    async delete() {
        const databaseQuery = {
            filter: {
                and: [
                    { property: 'Email', rich_text: { equals: this.email } },
                    { property: 'Assigned', rich_text: { equals: 'No' } }
                ]
            }
        };
        const response = await NotionDbManager.query(participantsDbId, databaseQuery);
        if (response?.results?.[0]) {
            const body = {
                "archived": true,
            }

            NotionPageManager.updatePage(response.results[0].id, body)
            return true;
        } else return false;
    }
    async isEmailAvailable() {
        const participants = await NotionDbManager.query(participantsDbId, {
            filter: {
                and: [
                    { property: 'Email', rich_text: { equals: this.email } },
                    { property: 'Assigned', rich_text: { does_not_equal: 'Yes' } },
                ]
            }
        });
        return participants.results.length === 0;
    }
}
class Payment {
    constructor({ ticket, participant }) {
        Object.assign(this, { ticket, participant });
    }

    
    async getStripeSession() {
        if (this.ticket.paymentAmount <= 0) return { sessionUrl: `https://oportobiomedicalsummit.com/api/wevent/webhooks/handleStripe?action=paymentSuccessful&ticketId=${this.ticket.ticketId}&email=${this.participant.email}` };
        this.ticket.paymentAmount = Math.floor(this.ticket.paymentAmount);
        try {
            const session = await stripe.checkout.sessions.create({
                line_items: [{
                    price_data: {
                        currency: 'EUR',
                        unit_amount: this.ticket.paymentAmount.toString(),
                        product_data: {
                            name: `[${this.ticket.ticketId}] ${this.ticket.ticketBird} ${this.ticket.ticketType} ${this.ticket.participantType}`,
                            images: ['https://thehcpac.org/wp-content/uploads/2016/11/redticket.png'],
                            metadata: {
                                studentNumber: this.ticket.metadata.studentNumber || '',
                                academicYear: this.ticket.metadata.academicYear || '',
                                facultyUniversity: this.ticket.metadata.facultyUniversity || '',
                                yearOfStudies: this.ticket.metadata.yearOfStudies || '',
                                facultyUniversitySchool: this.ticket.metadata.facultyUniversitySchool || ''
                            }
                        }
                    },
                    quantity: 1
                }],
                allow_promotion_codes: false,
                metadata: {
                    studentNumber: this.ticket.metadata.studentNumber || '',
                    academicYear: this.ticket.metadata.academicYear || '',
                    facultyUniversity: this.ticket.metadata.facultyUniversity || '',
                    yearOfStudies: this.ticket.metadata.yearOfStudies || '',
                    facultyUniversitySchool: this.ticket.metadata.facultyUniversitySchool || ''

                },
                payment_method_types: ['card'],
                mode: 'payment',
                success_url: `https://oportobiomedicalsummit.com/ticket-success`,
                cancel_url: `https://oportobiomedicalsummit.com/ticket-failure`,
                expires_at: Math.floor(Date.now() / 1000) + (3600 * 0.5), // Configured to expire after 2 hours

            });
            return { sessionUrl: session.url, ...session };
        } catch (error) {
            console.error(`Payment failed: ${error.message}`);
            throw error;
        }
    }
}
class NotionPageManager {
    static async createPage(pageType, properties) {
        let databaseId;
        if (pageType === "Participant") {
            databaseId = participantsDbId;
        } else if (pageType === "Ticket") {
            databaseId = ticketsDbId;
        } else if (pageType === "Reservation") {
            databaseId = reservationsDbId;
        }

        let apiKeyIndex = 0;
        let retries = 0;


        // eslint-disable-next-line no-constant-condition
        while (true) {
            const apiKey = notionApiKeys[apiKeyIndex];
            const headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'Notion-Version': notionApiVersion,
                    Authorization: 'Bearer ' + apiKey,
                    'Access-Control-Allow-Origin': '*',
                },
            };

            try {
                const response = await axios.post(
                    "https://api.notion.com/v1/pages", { parent: { database_id: databaseId }, properties },
                    headers, { timeout: 30000 } // add a timeout of 10 seconds
                );

                return response.data;
            } catch (err) {
                if (err.response && err.response.status === 429) {
                    // if rate limit exceeded, wait for reset
                    const resetTime = err.response.headers["x-rate-limit-reset"];
                    const delay = resetTime * 1000 - Date.now() + 1000; // add a 1 second buffer
                    console.warn(`Rate limit exceeded for Notion API. Waiting ${delay / 1000} seconds before retrying...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else if (retries >= MAX_RETRIES) {
                    if (apiKeyIndex === notionApiKeys.length - 1) {
                        console.error(`Failed to create Notion page in database ${databaseId} after ${MAX_RETRIES} attempts with all API keys. Error: ${err.message}`);
                        return null;
                    } else {
                        console.warn(`Failed to create Notion page in database ${databaseId} with API key ${apiKey}. Changing to next API key...`);
                        apiKeyIndex++;
                        retries = 0;
                    }
                } else {
                    const delay = Math.pow(2, retries) * RETRY_DELAY_MS;
                    console.warn(`Encountered temporary failure while creating Notion page in database ${databaseId} with API key ${apiKey}: ${err.message}. Retrying in ${delay / 1000} seconds...`);
                    retries++;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    }

    static async updatePage(pageId, body) {
        let apiKeyIndex = 0;
        let retries = 0;
        console.log("trying to update with: ", pageId, JSON.stringify(body));
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const apiKey = notionApiKeys[apiKeyIndex];
            const headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'Notion-Version': notionApiVersion,
                    Authorization: 'Bearer ' + apiKey,
                    'Access-Control-Allow-Origin': '*',
                },
            };

            try {
                const response = await axios.patch(
                    `https://api.notion.com/v1/pages/${pageId}`,
                    body,
                    headers, { timeout: 10000 } // add a timeout of 10 seconds
                );

                return response.data;
            } catch (err) {
                if (err.response && err.response.status === 429) {
                    // if rate limit exceeded, wait for reset
                    const resetTime = err.response.headers["x-rate-limit-reset"];
                    const delay = resetTime * 1000 - Date.now() + 1000; // add a 1 second buffer
                    console.warn(`Rate limit exceeded for Notion API. Waiting ${delay / 1000} seconds before retrying...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else if (retries >= MAX_RETRIES) {
                    if (apiKeyIndex === notionApiKeys.length - 1) {
                        console.error(`Failed to update Notion page ${pageId} after ${MAX_RETRIES} attempts with all API keys. Error: ${err.message}`);
                        return null;
                    } else {
                        console.warn(`Failed to update Notion page ${pageId} with API key ${apiKey}. Changing to next API key...`);
                        apiKeyIndex++;
                        retries = 0;
                    }
                } else {
                    const delay = Math.pow(2, retries) * RETRY_DELAY_MS;
                    console.warn(`Encountered temporary failure while updating Notion page ${pageId} with API key ${apiKey}: ${err.message}. Retrying in ${delay / 1000} seconds...`);
                    retries++;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    }
}

class NotionDbManager {
    static async query(dbId, query) {
        let apiKeyIndex = 0;
        let retries = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const apiKey = notionApiKeys[apiKeyIndex];
            const headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'Notion-Version': notionApiVersion,
                    Authorization: 'Bearer ' + apiKey,
                    'Access-Control-Allow-Origin': '*',
                },
            };

            try {
                const response = await axios.post(
                    `https://api.notion.com/v1/databases/${dbId}/query`,
                    query,
                    headers, { timeout: 10000 } // add a timeout of 10 seconds
                );

                return response.data;
            } catch (err) {
                if (err.response && err.response.status === 429) {
                    // if rate limit exceeded, wait for reset
                    const resetTime = err.response.headers['x-rate-limit-reset'];
                    const delay = resetTime * 1000 - Date.now() + 1000; // add 1 second buffer
                    console.warn(
                        `Rate limit exceeded for Notion API. Waiting ${delay / 1000} seconds before retrying...`
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                } else if (retries >= MAX_RETRIES) {
                    if (apiKeyIndex === notionApiKeys.length - 1) {
                        console.error(
                            `Failed to query Notion database ${dbId} after ${MAX_RETRIES} attempts with all API keys. Error: ${err.message}`
                        );
                        return null;
                    } else {
                        console.warn(
                            `Failed to query Notion database ${dbId} with API key ${apiKey}. Changing to next API key...`
                        );
                        apiKeyIndex++;
                        retries = 0;
                    }
                } else {
                    const delay = Math.pow(2, retries) * RETRY_DELAY_MS;
                    console.warn(
                        `Encountered temporary failure while querying Notion database ${dbId} with API key ${apiKey}: ${err.message}. Retrying in ${delay / 1000} seconds...`
                    );
                    retries++;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
    }
}



const ALLOWED_METHODS = ['POST', 'GET'];
const ACTIONS = ['purchaseTicket', 'registerParticipant', 'registerTicket', 'paymentSuccessful', 'paymentUnsuccessful'];

export default async function handler(request, response) {
    const { method } = request;

    if (!ALLOWED_METHODS.includes(method))
        return response.status(405).json({ error: 'Method not allowed' });
    return method === 'POST' ?
        handlePostRequest(request, response) :
        handleGetRequest(request, response);
}


async function handlePostRequest(request, response) {
    const { action, name, email, phone, assigned, ticketId, ticketBird, ticketType, participantType, ambassadorCode, couponCode, metadata, paymentAmount, paymentIntent } = request.body;
    const participantData = { name, email, phone, assigned, paymentIntent };
    const ticketData = { ticketId, ticketBird, ticketType, participantType, ambassadorCode, couponCode, metadata, assigned, paymentAmount, paymentIntent };
    const ticket = new EventTicket(ticketData);
    const participant = new EventParticipant(participantData);
    console.log(ticket)

    try {
        switch (action) {
            case 'purchaseTicket':
                return response.status(200).json({ sessionUrl: await ticket.pay(participant) });
            case 'registerParticipant':
                await participant.create(ticket);
                return response.status(200).json({ success: 'Participant registered with success' });
            case 'registerTicket':
                await ticket.create(participant);
                return response.status(200).json({ success: 'Ticket registered with success' });
            default:
                return response.status(400).json({ error: 'Invalid action!' });
        }
    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}


async function handleGetRequest(request, response) {
    const { action, ticketId } = request.query;

    if (!ACTIONS.includes(action)) {
        return response.status(400).json({ error: 'Invalid action!' });
    }

    const ticket = new EventTicket({ ticketId: ticketId });

    try {
        switch (action) {
            case 'paymentSuccessful':
                try {
                    const email = request.query.email;
                    const participant = new EventParticipant({ email: email });
                    // Check that ticket and participant objects exist
                    if (!ticket || !participant) {
                        throw new Error('Ticket or participant not found');
                    }
                    try {
                        const ticketAssignment = await ticket.assign();
                        const participantAssignment = await participant.assign();
                        if (!ticketAssignment || !participantAssignment) {
                            throw new Error(`Failed to ticketAssignment or participantAssignment: ${ticketAssignment || participantAssignment}`);
                        }
                        // const reservationDeletion = await ticket.deleteReservation();
                        await ticket.deleteReservation();
                        return response.status(200).json({ success: 'Ticket payment with success' });
                        } catch (error) {
                            console.error('Error handling Successful payment:', error);
                            return response.status(500).json({ error: error.message });
                        } finally {
                            // Always send a response back to the client, even if an error occurred
                            response.end();
                        }
                } catch (error) {
                    console.error('Error handling Successful payment:', error);
                    return response.status(500).json({ error: error.message });
                } finally {
                    // Always send a response back to the client, even if an error occurred
                    response.end();
                }

            // Handle payment failure for a ticket
            case 'paymentUnsuccessful':
                try {
                    const responseMessage = await handlePaymentUnsuccess(ticket);
                    return response.status(200).json({ message: responseMessage });
                } catch (error) {
                    console.error('Error handling unsuccessful payment:', error);
                    return response.status(500).json({ error: error.message });
                } finally {
                    // Always send a response back to the client, even if an error occurred
                    response.end();
                }
        }
    } catch (error) {
        return response.status(500).json({ error: error.message });
    } finally {
        // Always send a response back to the client, even if an error occurred
        response.end();
    }
}

async function handlePaymentUnsuccess(ticket) {
try {
    const [ticketPage] = await Promise.allSettled([
        ticket.get(),
        // participant.get(),
    ]);

    if (!ticketPage) {
        console.error(`Failed to get ticket or participant page`);
        return { message: "Failed to get ticket or participant page." };
    }

    const ticketResult = ticketPage.value;
    // const participantResult = participantPage.value;
    // console.log("ticket: ",JSON.stringify(ticketResult));
    // console.log("partic: ", JSON.stringify(participantResult));
    
    const ticketMetadata = JSON.parse(ticketResult.properties["Ticket Metadata"].rich_text[0].plain_text);
    const ticketAvailabilityId = `${ticketResult.properties["Ticket Bird"].rich_text[0].plain_text} ${ticketResult.properties["Ticket Type"].rich_text[0].plain_text} ${ticketResult.properties["Participant Type"].rich_text[0].plain_text}`;
    const couponAvailabilityId = ticketResult.properties["Coupon Code"].rich_text[0].plain_text;
    const studentNumberAvailabilityId = ticketMetadata.studentNumber;

    if(ticket.validInput(couponAvailabilityId)){
        const updatedCouponAvailability = await ticket.updateAvailabilityPage(1, couponsAvailabilityDbId, couponAvailabilityId);
        if( !updatedCouponAvailability){
            console.log("error updating updatedCouponAvailability!!!")

        }
    }
    if(ticket.validInput(studentNumberAvailabilityId)){
        const updatedStudentNumberAvailability = await ticket.updateAvailabilityPage(1, studentNumbersAvailabilityDbId, studentNumberAvailabilityId);
        if( !updatedStudentNumberAvailability){
            console.log("error updating updatedStudentNumberAvailability!!!")

        }
    }

    if(ticket.validInput(ticketAvailabilityId)){
        const updatedTicketAvailability = await ticket.updateAvailabilityPage(1, ticketsAvailabilityDbId, ticketAvailabilityId);
        if( !updatedTicketAvailability){
            console.log("error updating updatedTicketAvailability!!!")

        }
    }
    // await ticket.delete();
    // await participant.delete();
    await ticket.deleteReservation();
    
    console.log("Ticket payment with unsuccessful payment was successfully handled.");
    return { message: "Ticket payment with unsuccessful payment was successfully handled." };
} catch (error) {
    console.error(`Error in handlePaymentUnsuccess: ${error}`);
    return { message: "Error in handlePaymentUnsuccess." };
} //finally {
//     // Always send a response back to the client, even if an error occurred
//     response.end();
// }
}