import axios from 'axios';

const stripe = require('stripe').default('sk_test_51L5MzLBg4lHvVejrb4zYLpMKZY9s2eK8DzwypbV0nCy92iAgsgfYMxeuZuAoGlaKRlK7Sgg9QGCJrs6IR5TThHXy00L4h63yxX');
const notionApiKey = 'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P' //ticketing1: secret_zM86Gogu5oR0kgOzcallucSXyJf2wYxYpTpIsdfsR3v
const notionApiKeys = [
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P',
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P',
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P',
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P',
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P'
]
const notionApiVersion = '2022-06-28'
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Notion-Version': notionApiVersion,
        Authorization: "Bearer " + notionApiKey,
        'Access-Control-Allow-Origin': '*'
    }
}
const WEBHOOK_URL = 'https://oportobiomedicalsummit.com/api/wevent/webhooks/submitTicketingTests';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000;

const participantsDbId = 'eb98b71ccb4b4aa2a5407961eed26bea';
const ticketsDbId = '5dbaccb7c3484d9b8c12878b5aac92c7';

function validInput(input) {
    if (typeof input !== 'string' || !input.trim()) {
        return false;
    }
    return true;
}
class NotionDbManager {
    static async query(dbId, query) {
        let retries = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                const response = await axios.post(
                    `https://api.notion.com/v1/databases/${dbId}/query`,
                    query,
                    headers
                );
                return response.data;
            } catch (err) {
                if (retries >= MAX_RETRIES) {
                    console.error(
                        `Failed to query Notion database ${dbId} after ${MAX_RETRIES} attempts: ${err.message}`
                    );
                    return null;
                }

                console.warn(
                    `Encountered temporary failure while querying Notion database ${dbId}: ${err.message}`
                );
                retries++;
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }
    }
}


async function get(db, filteringProperty, filteringMatch, type) {
    try {
        if (!filteringProperty || !validInput(filteringProperty)) {
            throw new Error(`Invalid filtering property: ${filteringProperty}`);
        }

        if (!filteringMatch || !validInput(filteringMatch)) {
            throw new Error(`Invalid filtering match: ${filteringMatch}`);
        }

        const response = await NotionDbManager.query(db, { filter: { property: filteringProperty, title: { equals: filteringMatch } } });

        if (!response || !response.results || response.results.length === 0) {
            throw new Error(`No results found for ${filteringProperty} = ${filteringMatch} on ${type}`);
        }

        return response.results[0];
    } catch (error) {
        // console.error(error);
        return false;
    }
}

async function handleUnsuccess(paymentIntent) {
    try {
        // Retrieve the relevant product and participant details from the database
        const ticketDetails = await get(ticketsDbId, 'Payment Intent', paymentIntent);
        const participantDetails = await get(participantsDbId, 'Payment Intent', paymentIntent);

        // Extract the ticket ID and email from the retrieved data
        const ticketId = ticketDetails?.properties?.['Name']?.title?.[0]?.text?.content;
        const email = participantDetails?.properties?.['Email']?.rich_text?.[0]?.text?.content;

        // Throw an error if either the ticket ID or email is missing
        if (!ticketId || !email) {
            throw new Error('Missing required data: ticketId or email');
        }

        // Attempt to submit the relevant information to the webhook using Axios
        let response = null;
        let retries = 0;

        while (response === null && retries < MAX_RETRIES) {
            try {
                response = await axios.get(`${WEBHOOK_URL}?action=paymentUnsuccessful&ticketId=${ticketId}&email=${email}`);
                return response; // Return the response from the webhook
            } catch (error) {
                // console.error(error);
                retries++;
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }

        console.error(`Failed to submit data to webhook after ${MAX_RETRIES} attempts for handleUnsuccess`);
        return false;
    } catch (error) {
        // Handle any errors that occur while retrieving the data
        // console.error(error);
        return false;
    }
}
async function handleSuccess(paymentIntent) {
    try {
        // Retrieve the relevant product and participant details from the database
        const ticketDetails = await get(ticketsDbId, 'Payment Intent', paymentIntent, 'ticketDb');
        const participantDetails = await get(participantsDbId, 'Payment Intent', paymentIntent, 'participantsDb');

        // Extract the ticket ID and email from the retrieved data
        const ticketId = ticketDetails?.properties?.['Name']?.title?.[0]?.text?.content;
        const email = participantDetails?.properties?.['Email']?.rich_text?.[0]?.text?.content;

        // Throw an error if either the ticket ID or email is missing
        if (!ticketId || !email) {
            throw new Error('Missing required data: ticketId or email');
        }

        // Attempt to submit the relevant information to the webhook using Axios
        let response = null;
        let retries = 0;

        while (response === null && retries < MAX_RETRIES) {
            try {
                response = await axios.get(`${WEBHOOK_URL}?action=paymentSuccessful&ticketId=${ticketId}&email=${email}`);
                return response; // Return the response from the webhook
            } catch (error) {
                // console.error(error);
                retries++;
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }

        console.error(`Failed to submit data to webhook after ${MAX_RETRIES} attempts for handleSuccess`);
        return false;
    } catch (error) {
        // Handle any errors that occur while retrieving the data
        // console.error(error);
        return false;
    }
}

export default async function handleStripeWebhook(req, res) {
    if (req.method !== 'POST') {
        return res.status(500).json('Invalid request method.');
    }

    const eventType = req.body?.type;

    try {
        // Retrieve the ID of the canceled payment intent from the request body
        const paymentIntent = req.body?.data?.object?.id;
        switch (eventType) {
            case 'payment_intent.canceled':

                try {
                    // Call the handleUnsuccess function to add a ticket to the availability database
                    const response = await handleUnsuccess(paymentIntent);
                    return response;
                } catch (error) {
                    // console.error(error);
                    return res.status(500).json('Error handling payment_intent.canceled webhook event.');
                }
            
            case 'payment_intent.succeeded':

                try {
                    // Call the handleUnsuccess function to add a ticket to the availability database
                    const response = await handleSuccess(paymentIntent);
                    return res.status(200).json('Success handling payment_intent.succeeded webhook event.');
            
                } catch (error) {
                    // console.error(error);
                    return res.status(500).json('Error handling payment_intent.succeeded webhook event.');
            }
                
            default:
                // handle other webhook events
                console.log(`Received ${eventType} webhook event`);
                return res.status(200).json('Received webhook event');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json('Error handling webhook event.');
    }
};