import * as React from 'react'

import * as types from 'notion-types'

import LoginBtn from './UserComponentLoginBtn'
import LoginBtnMobile from './UserComponentLoginBtnMobile'
import { useState, useEffect } from 'react'

export const WeventNav: React.FC<{
  block: types.CollectionViewPageBlock | types.PageBlock
}> = () => {


  const [navStruct, setNavStruct] = useState([]);

  useEffect(() => {
    
      // const res = await fetch('/api/wevent/getNav');
      // const data = await res.json();

      fetch('/api/wevent/getNav').then((res) => res.json()).then((data) =>{

        const navArr = data.navArr;

        setNavStruct([...navArr])
      });

  }, [])

  // const navStruct = [
  //   {
  //     name: '3rd Edition',
  //     subArr: [
  //       {
  //         name: 'Program',
  //         href: '/program',
  //         class: 'text-sm hover:text-[color:var(--xg-color)]',
  //         type: 'li'
  //       },
  //       {
  //         name: 'Speakers',
  //         href: null,
  //         class: 'text-sm hover:text-[color:var(--xg-color)]',
  //         type: 'li'
  //       },
  //       {
  //         name: 'Partners',
  //         href: null,
  //         class: 'text-sm hover:text-[color:var(--xg-color)]',
  //         type: 'li'
  //       }
  //     ],
  //     href: null,
  //     class: 'mr-1',
  //     type: 'div'
  //   },
  //   {
  //     name: 'Tickets',
  //     subArr: null,
  //     href: '/tickets',
  //     class: 'hover:text-[color:var(--xg-color)]',
  //     type: 'li'
  //   },
  //   {
  //     name: 'Contact Us',
  //     subArr: null,
  //     href: '/contact',
  //     class: 'hover:text-[color:var(--xg-color)]',
  //     type: 'li'
  //   },
  //   {
  //     name: 'Sign In',
  //     subArr: null,
  //     href: '/api/auth/login',
  //     class:
  //       'bg-[color:var(--bg-color)] border-2 border-[color:var(--fg-color)] px-5 py-1 rounded-sm hover:bg-[color:var(--xg-color)] text-[color:var(--fg-color)] hidden md:flex',
  //     type: 'login'
  //   }
  // ]

  // const htmlTimer = `<!-- timer --><div class="custom-container-container"><div class="custom-container"><h1 id="custom-headline"></h1><div id="custom-countdown"><ul><li><span id="custom-days"></span>days</li><li><span id="custom-hours"></span>Hours</li><li><span id="custom-minutes"></span>Minutes</li><li><span id="custom-seconds"></span>Seconds</li></ul></div><div id="custom-content" class="custom-emoji"><span>⏰</span><span>👩‍🔬</span><span>🎉</span></div></div></div><style>.custom-container-container{align-items:center;background-color:var(--bg-color);display:flex;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif}.custom-container{color:#333;margin:0 auto;text-align:center}.custom-container h1{font-weight:400;letter-spacing:.125rem;text-transform:uppercase}.custom-container li{display:inline-block;font-size:1em;list-style-type:none;padding:0.5em;text-transform:uppercase}.custom-container li span{display:block;font-size:3.5rem}.custom-container .custom-emoji{display:none;padding:0.5rem}.custom-container .custom-emoji span{font-size:2.5rem;padding:0 .5rem}@media all and (max-width:768px){.custom-container h1{font-size:calc(1rem * var(--smaller))}.custom-container li{font-size:calc(1rem * var(--smaller))}.custom-container li span{font-size:calc(2.5em * var(--smaller))}}</style><script>!function(){const e=6e4,t=36e5,n=24*t;let o=new Date,c=String(o.getDate()).padStart(2,"0"),m=String(o.getMonth()+1).padStart(2,"0"),l=o.getFullYear(),d="04/20/",s=d+l;o=m+"/"+c+"/"+l,o>s&&(s=d+(l+1));const a=new Date(s).getTime(),u=setInterval((function(){const o=(new Date).getTime(),c=a-o;document.getElementById("custom-days").innerText=Math.floor(c/n),document.getElementById("custom-hours").innerText=Math.floor(c%n/t),document.getElementById("custom-minutes").innerText=Math.floor(c%t/e),document.getElementById("custom-seconds").innerText=Math.floor(c%e/1e3),c<0&&(document.getElementById("custom-headline").innerText="It's on!",document.getElementById("custom-countdown").style.display="none",document.getElementById("custom-content").style.display="block",clearInterval(u))}),0)}();</script>`
    
  const openCloseMenu = () => {
    const mobile_menu = document.getElementById('mobile-menu')
    mobile_menu.classList.toggle('hidden')
  }

  const changeIcon = () => {
    const iconsvg0 = document.getElementById('navIconSVG0')
    const iconsvg1 = document.getElementById('navIconSVG1')

    iconsvg0.classList.toggle('hidden')
    iconsvg1.classList.toggle('hidden')
  }

  const toggleNavDesporto = (num) => {
    const dropdown = document.getElementById('NavDesporto' + num)
    dropdown.classList.toggle('hidden')
  }

  return (
    <>
      <header className='h-15 bg-[color:var(--bg-color)] sticky top-0 z-50 notion-nav-header'>
        <nav className='relative px-2 py-2'>
          <div className='customNav-icon-container container mx-auto flex justify-between items-center'>
            <a href='/' className='customNav-icon-a'>
              <img src='/nav/logo_menu.svg' width='50' height='50' />
              <p className='customNav-icon-title'>
                OPORTO
                <br />
                BIOMEDICAL
                <br />
                SUMMIT
              </p>
            </a>
            
      {/* <div
              id='AllPages.timer'
              dangerouslySetInnerHTML={createMarkup(htmlTimer)}
            /> */}

            {/*parses the navStruct to build the navBar*/}
            <ul className='hidden md:flex space-x-6 items-center'>
              {navStruct.map((navItem) =>
                navItem.subArr != null ? (
                  <>
                    <li className='flex relative group '>
                      <div className='mr-1'>{navItem.name}</div>
                      <ul className='absolute  bg-[color:var(--fg-color)] text-[color:var(--bg-color)] p-3 w-52 top-6 transform scale-0 group-hover:scale-100 transition duration-150 ease-in-out origin-top shadow-lg'>
                        <>
                          {navItem.subArr.map((subNavItem) => {
                            return (
                              <>
                                <li className='text-sm hover:text-[color:var(--xg-color)]'>
                                  <a href='#'>{subNavItem.name}</a>
                                </li>
                              </>
                            )
                          })}
                        </>
                      </ul>
                    </li>
                  </>
                ) : (
                  <>
                    {navItem.type == 'li' ? (
                      <>
                        <li className='hover:text-[color:var(--xg-color)]'>
                          <a href={navItem.href}>{navItem.name}</a>
                        </li>
                      </>
                    ) : (
                      <>
                        {navItem.type == 'login' ? (
                          <>
                            <LoginBtn/>
                          </>
                        ) : null}
                      </>
                    )}
                  </>
                )
              )}
            </ul>

            {/* <!-- Mobile menu icon --> */}
            <button
              onClick={openCloseMenu}
              id='mobile-icon'
              className='md:hidden'
            >
              <i onClick={changeIcon} id='navIcon' className=''>
                <img
                  className='hidden w-6 h-6'
                  id='navIconSVG0'
                  src='/nav/bars-visible.svg'
                />
                <img
                  className='w-6 h-6'
                  id='navIconSVG1'
                  src='/nav/bars-hidden.svg'
                />
              </i>
            </button>
          </div>

          {/* <!-- Mobile menu --> */}

          <div className='md:hidden flex justify-center mt-0 w-full'>
            <div
              id='mobile-menu'
              className='hidden mobile-menu flex justify-center absolute top-70 w-full overflow-scroll'
            >
              {/* <!-- add hidden here later --> */}
              <div className="mobile-custommenu-wrapper">
              <ul className='text-center bg-[color:var(--bg-color)] shadow-sm leading-9 font-bold h-screen overflow-scroll'>
                {navStruct.map((navItem) =>
                  navItem.subArr != null ? (
                    <>
                      <li className='  bg-[color:var(--bg-color)] '>
                        <div
                          onClick={() => toggleNavDesporto(0)}
                          className='block border-b-2 border-[color:var(--fg-color)] hover:border-[color:var(--xg-color)]'
                        >
                          {navItem.name}
                          <i className='fa-solid fa-chevron-down fa-2xs pt-4'></i>
                        </div>
                        <ul
                          id='NavDesporto0'
                          className='hidden bg-[color:var(--fg-color)] text-[color:var(--bg-color)]'
                        >
                          <>
                            {navItem.subArr.map((subNavItem) => {
                              return (
                                <>
                                  <li className='text-sm leading-8 font-normal hover:text-[color:var(--xg-color)]'>
                                    <a className='block' href='/resources'>
                                      {subNavItem.name}
                                    </a>
                                  </li>
                                </>
                              )
                            })}
                          </>
                        </ul>
                      </li>
                    </>
                  ) : (
                    <>
                      {navItem.type == 'login' ? (
                        <>
                         <LoginBtnMobile/>
                        </>
                      ) : (
                        <>
                          <li className='hover:text-[color:var(--xg-color)]'>
                            <a href={navItem.href} className='block'>
                              {navItem.name}
                            </a>
                          </li>
                        </>
                      )}
                    </>
                  )
                )}
              </ul>
              </div>
            </div>
          </div>
        </nav>
      </header>
      
    </>
  )
}
