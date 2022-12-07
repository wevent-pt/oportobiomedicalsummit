import * as React from 'react'

import * as types from 'notion-types'

// import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'
// import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'
// import cs from 'classnames'
// import { Breadcrumbs, Header, useNotionContext } from 'react-notion-x'
// import { Search } from 'react-notion-x'
// import { navigationLinks, navigationStyle } from '@/lib/config'

// import styles from './styles.module.css'

export const WeventNav: React.FC<{
  block: types.CollectionViewPageBlock | types.PageBlock
}> = () => {
  // const navLinks = [
  //   {
  //     title: 'Demo',
  //     href: '/1f41c20b8d9b439aa521f5b030c2b745',
  //     subPages: [
  //       {
  //         title: 'Rooms',
  //         href: '/#'
  //       },
  //       {
  //         title: 'Chat Room',
  //         href: '/1f41c20b8d9b439aa521f5b030c2b745'
  //       },
  //       {
  //         title: 'Blocks',
  //         href: '/1f41c20b8d9b439aa521f5b030c2b745'
  //       },
  //       {
  //         title: 'Security',
  //         href: '/1f41c20b8d9b439aa521f5b030c2b745'
  //       },
  //       {
  //         title: 'Design',
  //         href: '/1f41c20b8d9b439aa521f5b030c2b745'
  //       },
  //       {
  //         title: 'Payment',
  //         href: '/1f41c20b8d9b439aa521f5b030c2b745'
  //       }
  //     ]
  //   },
  //   {
  //     title: 'Contact Us',
  //     href: '/1f41c20b8d9b439aa521f5b030c2b745'
  //   },
  // ]

  const navStruct = [
    {
      name: 'Demo',
      subArr: [
        {
          name: 'Room1',
          href: null,
          class: 'text-sm hover:text-[color:var(--xg-color)]',
          type: 'li'
        },
        {
          name: 'Room2',
          href: null,
          class: 'text-sm hover:text-[color:var(--xg-color)]',
          type: 'li'
        }
      ],
      href: null,
      class: 'mr-1',
      type: 'div'
    },
    {
      name: 'About',
      subArr: null,
      href: null,
      class: 'hover:text-[color:var(--xg-color)]',
      type: 'li'
    },
    {
      name: 'Tickets',
      subArr: null,
      href: null,
      class: 'hover:text-[color:var(--xg-color)]',
      type: 'li'
    },
    {
      name: 'Contacts',
      subArr: null,
      href: null,
      class: 'hover:text-[color:var(--xg-color)]',
      type: 'li'
    },
    {
      name: 'Sign In',
      subArr: null,
      href: null,
      class:
        'bg-[color:var(--bg-color)] border-2 border-[color:var(--fg-color)] px-5 py-1 rounded-sm hover:bg-[color:var(--xg-color)] text-[color:var(--fg-color)] hidden md:flex',
      type: 'a'
    }
  ]

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
        <nav className='relative px-2 py-4'>
          <div className='customNav-icon-container container mx-auto flex justify-between items-center'>
            <a href='/' className='customNav-icon-a'>
              <img src='/nav/logo_menu.svg' width='70' height='70' />
              <p className='customNav-icon-title'>
                OPORTO
                <br />
                BIOMEDICAL
                <br />
                SUMMIT
              </p>
            </a>

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
                        {navItem.type == 'a' ? (
                          <>
                            <a
                              href='/signin'
                              id='loginBtn'
                              className='bg-[color:var(--bg-color)] border-2 border-[color:var(--fg-color)] px-5 py-1 rounded-sm hover:bg-[color:var(--xg-color)] text-[color:var(--fg-color)] hidden md:flex'
                              role='button'
                            >
                              {navItem.name}
                            </a>
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

          <div className='md:hidden flex justify-center mt-3 w-full'>
            <div
              id='mobile-menu'
              className='hidden mobile-menu absolute top-70 w-full overflow-scroll'
            >
              {/* <!-- add hidden here later --> */}
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
                      {navItem.name == 'Sign In' ? (
                        <>
                          <li className='border-[color:var(--fg-color)] border-2 hover:bg-[color:var(--xg-color)] text-[color:var(--fg-color)]'>
                            <a id='loginBtnM' href='/signin' className='block'>
                              {navItem.name}
                            </a>
                          </li>
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
        </nav>
      </header>
    </>
  )
}
