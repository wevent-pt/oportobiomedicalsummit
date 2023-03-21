import axios from 'axios';

// const stripe = require('stripe').default('sk_test_51L5MzLBg4lHvVejrb4zYLpMKZY9s2eK8DzwypbV0nCy92iAgsgfYMxeuZuAoGlaKRlK7Sgg9QGCJrs6IR5TThHXy00L4h63yxX');
// const notionApiKey = 'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P' //ticketing1: secret_zM86Gogu5oR0kgOzcallucSXyJf2wYxYpTpIsdfsR3v


const notionApiKeys = [
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P',
    'secret_zM86Gogu5oR0kgOzcallucSXyJf2wYxYpTpIsdfsR3v',
    'secret_B7EfjTkZLgH3UvsJ9YSTEWzQpk6hoYthOIKOo8o2bWR',
    'secret_wh2MYlJ0whHDmKdszfvRuLNTyUk6rfNPKChIvviH5mX',
    'secret_xSTC2XcM6oynGsiTIYgG9Aj97mzE9oHsdjZZgEaO2S8'
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
const WEBHOOK_URL = 'https://oportobiomedicalsummit.com/api/wevent/webhooks/submitTicketingTests';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
// const TIMEOUT = 10000;

const participantsDbId = 'e4e0faf7bad8443382aca6771c132fb5';
const ticketsDbId = '2e12347eea9c440986311875d7699781';

function validInput(input) {
    if (typeof input !== 'string' || !input.trim()) {
        return false;
    }
    return true;
}
class NotionDbManager {
    static async query(dbId, query) {
        let apiKeyIndex = 0;
        let retries = 0;
        
        
        // eslint-disable-next-line no-constant-condition
        while (true) {
            let apiKey = notionApiKeys[apiKeyIndex];
            let headers = {
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
                    const resetTime = err.response.headers['x-rate-limit-reset'] || 0;
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
                    console.log(err)
                    const delay = Math.pow(1, retries) * RETRY_DELAY_MS;
                    console.log(
                        `Encountered temporary failure while querying Notion database ${dbId} with API key ${apiKey}: ${err.message}. Retrying in ${delay / 1000} seconds...`
                    );
                    retries++;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
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
        const response = await NotionDbManager.query(db, { filter: { property: filteringProperty, rich_text: { equals: filteringMatch } } });

        
        if (!response || !response.results || response.results.length === 0) {
            throw new Error(`No results found for ${filteringProperty} = ${filteringMatch} on ${type}`);
        }

        return response.results[0];
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function handleUnsuccess(paymentIntent) {
    try {
        // Retrieve the relevant product and participant details from the database
        const ticketDetails = await get(ticketsDbId, 'Payment Intent', paymentIntent, 'tickets');
        // const participantDetails = await get(participantsDbId, 'Payment Intent', paymentIntent, 'participants');

        // Extract the ticket ID and email from the retrieved data
        const ticketId = ticketDetails?.properties?.['Name']?.title?.[0]?.text?.content;
        // const email = participantDetails?.properties?.['Email']?.rich_text?.[0]?.text?.content;

        // Throw an error if either the ticket ID or email is missing
        if (!ticketId) {
            throw new Error('Missing required data: ticketId or email');
        }
        console.log("canceling ", ticketId);
        // Attempt to submit the relevant information to the webhook using Axios
        let response = null;
        let retries = 0;

        while (response === null && retries < MAX_RETRIES) {
            try {
                response = await axios.get(`${WEBHOOK_URL}?action=paymentUnsuccessful&ticketId=${ticketId}`);
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
        console.error(error);
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
        console.error(error);
        return false;
    }
}
async function handleTemp(paymentIntent) {
    try {
        // Attempt to submit the relevant information to the webhook using Axios
        let response = null;
        let retries = 0;

        while (response === null && retries < MAX_RETRIES) {
            try {
                response = await axios.get(`${WEBHOOK_URL}?action=handleTemp&ticketId=${paymentIntent}`);
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
        console.error(error);
        return false;
    }
}

const ALLOWED_METHODS = ['POST', 'GET'];
export default async function handleStripeWebhook(req, res) {
    const { method } = req;

    if (!ALLOWED_METHODS.includes(method))
        return res.status(500).json({ error: 'Method not allowed' });

    if (method === 'POST'){
        const eventType = req.body?.type;
        try {
            // Retrieve the ID of the canceled payment intent from the request body
            const paymentIntent = req.body?.data?.object?.id;
            console.log("!!!!", paymentIntent);
            switch (eventType) {
                case 'payment_intent.canceled':
                    try {
                        // Call the handleUnsuccess function to add a ticket to the availability database
                        const response = await handleUnsuccess(paymentIntent);
                        return res.status(200).json('Success handling payment_intent.canceled webhook event to: ', response);
                    
                    } catch (error) {
                        // console.error(error);
                        return res.status(500).json('Error handling payment_intent.canceled webhook event.');
                    }
                case 'payment_intent.succeeded':
                    try {
                        // Call the handleUnsuccess function to add a ticket to the availability database
                        await handleSuccess(paymentIntent);
                        await handleTemp(paymentIntent);
                        return res.status(200).json('Success handling payment_intent.succeeded webhook event.');
                
                    } catch (error) {
                        // console.error(error);
                        return res.status(500).json('Error handling payment_intent.succeeded webhook event.');
                    }
                case 'checkout.session.completed':
                        try {
                            // Call the handleUnsuccess function to add a ticket to the availability database
                            console.log('checkout.session.completed with checkout.session: ' + paymentIntent, JSON.stringify(req.body));
                            await handleSuccess(paymentIntent);
                            return res.status(200).json('Success handling payment_intent.succeeded webhook event.');
                    
                        } catch (error) {
                            // console.error(error);
                            return res.status(500).json('Error handling payment_intent.succeeded webhook event.');
                        }
                case 'checkout.session.expired':
                    try {
                        // Call the handleUnsuccess function to add a ticket to the availability database
                        const response = await handleUnsuccess(paymentIntent);
                        return res.status(200).json('Success handling payment_intent.canceled webhook event to: ', response);
                    
                    } catch (error) {
                        // console.error(error);
                        return res.status(500).json('Error handling payment_intent.canceled webhook event.');
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
    } else{
        try {
            // Retrieve the ID of the canceled payment intent from the request body
            const { action } = req.query;
            const paymentIntent1 = req.query.paymentIntent;
            switch (action) {
                case 'cancel':
                    console.log("canceling ", paymentIntent1);
                    try {
                        const response = await handleUnsuccess(paymentIntent1);
                        if (response){
                            res.status(200).json('Success handling payment_intent.canceled webhook event.');
                        }
                        res.status(500).json('Error handling payment_intent.canceled webhook event.');
                    } catch (error) {
                        // console.error(error);
                        return res.status(500).json('Error handling payment_intent.canceled webhook event.');
                    }
                    break;
                default:
                    // handle other webhook events
                    console.log(`Received ${action} webhook event`);
                    return res.status(200).json('Received webhook event');
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json('Error handling webhook event.');
    }

    }
};