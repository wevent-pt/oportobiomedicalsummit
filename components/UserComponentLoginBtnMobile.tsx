import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function LoginBtnMobile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if(user){
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
    user && (<>
      <li key="signoutm" className="border-[color:var(--fg-color)] border-2 hover:bg-[color:var(--xg-color)] text-[color:var(--fg-color)]">
        <a id="logoutBtn" href='/api/auth/logout' className="block">Sign Out</a>
      </li>
    </>
      )
    )
  }
  else{
    if (typeof window !== 'undefined') {
      const obj = { userEmail: '', userName: '', userTicket: '' };
      localStorage.setItem('userEmail', obj.userEmail);
      localStorage.setItem('userName', obj.userName);
      localStorage.setItem('userTicket', obj.userTicket);
      console.log("user deleted: " + JSON.stringify(obj));
    }
    return(<>
      <li key="signinm" className="border-[color:var(--fg-color)] border-2 hover:bg-[color:var(--xg-color)] text-[color:var(--fg-color)]">
        <a id="loginBtnM" href='/api/auth/login' className="block">Sign In</a>
      </li>
    </>
                
    )
     }
}