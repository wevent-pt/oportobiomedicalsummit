import axios from 'axios'
const notionApiKey = 'secret_dkz8UsLiPhxHsAqX3WugNBvCBwxJ4W9GwkiWS80dI7P' //ticketing1: secret_zM86Gogu5oR0kgOzcallucSXyJf2wYxYpTpIsdfsR3v
const notionApiVersion = '2022-06-28'
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Notion-Version': notionApiVersion,
        Authorization: "Bearer " + notionApiKey,
        'Access-Control-Allow-Origin': '*'
    }
}

const participantsDbId = 'eb98b71ccb4b4aa2a5407961eed26bea';


class EventParticipant {
    constructor({ name, email, phone, assigned }) {
        Object.assign(this, { name, email, phone, assigned });
    }
    
    validInput(input) {
        if (typeof input !== 'string' || !input.trim()) {
            return false;
        }
        return true;
    }

    async get(){
        if (!this.email || !this.validInput(this.email)) {
            throw new Error(`Invalid email : ${this.email}`);
        }
        const response = await NotionDbManager.query(participantsDbId, { filter:  { property: 'Email', rich_text: { equals: this.email } } });
        const page = await response?.results?.[0]
        // console.log(response)
        return page || false;
    }
}
class NotionDbManager {
    static async query(dbId, query) {
        try {
            const response = await axios.post(
                `https://api.notion.com/v1/databases/${dbId}/query`, query, headers
            );
            return response.data;
        } catch (err) {
            return err;
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