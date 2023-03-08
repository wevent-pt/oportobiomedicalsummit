import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function LoginBtn() {
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
    user && (
      <a href='/api/auth/logout' id="logoutBtn" className="bg-[color:var(--bg-color)] border-2 border-[color:var(--fg-color)] px-5 py-1 rounded-sm hover:bg-[color:var(--xg-color)] text-[color:var(--fg-color)] hidden md:flex" role="button">Sign Out</a>
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
    return(
      <a href='/api/auth/login' id="loginBtn" className="bg-[color:var(--fg-color)] border-2 border-[color:var(--fg-color)] px-5 py-1 rounded-sm  text-[color:white] hover:bg-[color:var(--fg-hover-color)] hidden md:flex" role="button">Sign In</a>
 
    )
     }
}