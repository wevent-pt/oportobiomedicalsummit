import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

/*OBS keys*/
// const ticketsDbId = '2e12347eea9c440986311875d7699781';
// const participantsDbId = 'e4e0faf7bad8443382aca6771c132fb5';
/*OBS keys */


/**test keys */
// const participantsDbId = 'eb98b71ccb4b4aa2a5407961eed26bea';
// const ticketsDbId = '5dbaccb7c3484d9b8c12878b5aac92c7';
// const ticketsAvailabilityDbId = 'eca8f685664a452583b448e81cdfe3ef';
// const couponsAvailabilityDbId = '14f3f2f6d0fc488cb72d8bd7554a14fb';
// const studentNumbersAvailabilityDbId = 'f3fdc42694ed4913a336cacfcf19d6a2';
/***test keys */


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
        fetch(`/api/wevent/webhooks/getParticipant?email=${obj.userEmail}&action=get`)
	      .then(response =>  response.json())
        .then((data) =>{
          const pageProps = data.page.properties;
          // console.log('pageProps',pageProps);
          //check if assigned === true
          const assignedVal = pageProps['Assigned']['rich_text'][0]['plain_text'];
          if(assignedVal === 'Yes'){
            const ticketInfo = pageProps['Ticket Info']['rich_text'][0]['plain_text'];
            const userName = pageProps['Name']['title'][0]['plain_text'];
            if(ticketInfo && userName){
              localStorage.setItem('userTicket',ticketInfo);
              localStorage.setItem('userName', userName);
            }
          }

        })
        .catch(err => console.error(err));
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
