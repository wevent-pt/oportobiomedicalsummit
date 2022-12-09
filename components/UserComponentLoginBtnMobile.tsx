import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function LoginBtnMobile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if(user){
    if(typeof window !== 'undefined'){
        const obj = {
          'userEmail': user.email,
          'userName': user.name
        }
        localStorage.setItem('userEmail', obj.userEmail);
        console.log("user setted: " + JSON.stringify(obj));
    }
  return (
    user && (<>
      <li key="signoutm" className="border-[color:var(--fg-color)] border-2 hover:bg-[color:var(--xg-color)] text-[color:var(--fg-color)]">
        <a id="loginBtnM" href='/api/auth/logout' className="block">Sign Out</a>
      </li>
    </>
      )
    )
  }
  else{
    if(typeof window !== 'undefined'){
      const obj = {
        'userEmail': '',
        'userName': ''
      }
      localStorage.setItem('userEmail', obj.userEmail);
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