import React from 'react';
import axios from 'axios'
import { useUser } from '@auth0/nextjs-auth0/client';

const notionApiKey = 'secret_AyvYNwuha6i495DwFjWHZ7FMRh8XDcaCGKjgKwHYxgO';
const notionApiVersion = '2022-06-28';
const headers = {
    headers: {
        'Content-Type': 'application/json',
        'Notion-Version': notionApiVersion,
        Authorization: "Bearer " + notionApiKey,
        'Access-Control-Allow-Origin': '*'
    }
};

const ticketsDbId = '2e12347eea9c440986311875d7699781';
const participantsDbId = 'e4e0faf7bad8443382aca6771c132fb5';

export default function LoginBtn() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    if (typeof window !== 'undefined') {
      const obj = { userEmail: user.email, userName: user.name };
      localStorage.setItem('userEmail', obj.userEmail);

      const ticketNow = localStorage.getItem('userTicket');
      if (!ticketNow) {
        const participants = axios.post(
          `https://api.notion.com/v1/databases/${participantsDbId}/query`,
          { 
            filter: 
            // {
              // and: [
                { property: 'Email', rich_text: { equals: user.email } }, 
                // { property: 'Assigned', rich_text: { equals: 'Yes' } },
              // ]
            // }
          },
          headers
        ).catch(error => console.error(error));

          console.log("user is registered", "the ticket is: ", participants);
          localStorage.setItem('userTicket','Partial Ticket');
      } else {
        console.log("Ticket already exists: " + ticketNow);
      }
    }
    return (
      <a href='/api/auth/logout' id="logoutBtn" className="bg-[color:var(--bg-color)] border-2 border-[color:var(--fg-color)] px-5 py-1 rounded-sm hover:bg-[color:var(--xg-color)] text-[color:var(--fg-color)] hidden md:flex" role="button">Sign Out</a>
    );
  } else {
    if (typeof window !== 'undefined') {
      const obj = { userEmail: '', userName: '', userTicket: '' };
      localStorage.setItem('userEmail', obj.userEmail);
      localStorage.setItem('userName', obj.userName);
      localStorage.setItem('userTicket', obj.userTicket);
      console.log("user deleted: " + JSON.stringify(obj));
    }
    return (
      <a href='/api/auth/login' id="loginBtn" className="bg-[color:var(--fg-color)] border-2 border-[color:var(--fg-color)] px-5 py-1 rounded-sm  text-[color:white] hover:bg-[color:var(--fg-hover-color)] hidden md:flex" role="button">Sign In</a>
    );
  }
}
