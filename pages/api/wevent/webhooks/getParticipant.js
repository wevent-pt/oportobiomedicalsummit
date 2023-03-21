import axios from 'axios'


const notionApiKeys = [
    'secret_B7EfjTkZLgH3UvsJ9YSTEWzQpk6hoYthOIKOo8o2bWR',
    'secret_wh2MYlJ0whHDmKdszfvRuLNTyUk6rfNPKChIvviH5mX',
    'secret_xSTC2XcM6oynGsiTIYgG9Aj97mzE9oHsdjZZgEaO2S8',
    'secret_zM86Gogu5oR0kgOzcallucSXyJf2wYxYpTpIsdfsR3v',
    'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P'
]
const notionApiVersion = '2022-06-28'
const participantsDbId = 'e4e0faf7bad8443382aca6771c132fb5';

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1000;




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
}

class NotionDbManager {
    static async query(dbId, query) {
        let apiKeyIndex = 0;
        let retries = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const apiKey = notionApiKeys[apiKeyIndex];
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


export default async function handler(req, res) {
    const { method } = req;
    if (method !== 'POST' && method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    try {
        
        if (method === 'POST') {
            const { action } = req.body;
            switch (action) {
                default:
                    return res.status(400).json({ error: 'Invalid action!' });
            }
        } else {
            const action = req.query.action;
            const participantEmail = req.query.email;
            const participant = new EventParticipant({ email: participantEmail });
            switch (action) {
                case 'get':
                    console.log("Getting participant...", participantEmail);
                    // eslint-disable-next-line no-case-declarations
                    const participantPage = await participant.get();
                    return res.status(200).json({ page: participantPage });

                default:
                    return res.status(400).json({ error: 'Invalid action!' });
            }
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `${error.message}` });
    }
}