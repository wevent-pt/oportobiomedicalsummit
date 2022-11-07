import * as React from 'react'

import * as types from 'notion-types'
import { IoMoonSharp } from '@react-icons/all-files/io5/IoMoonSharp'
import { IoSunnyOutline } from '@react-icons/all-files/io5/IoSunnyOutline'
import cs from 'classnames'
import { Breadcrumbs, Header, useNotionContext } from 'react-notion-x'
// import { Search } from 'react-notion-x'
import { navigationLinks, navigationStyle } from '@/lib/config'
// import { isSearchEnabled } from '@/lib/config'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

const ToggleThemeButton = () => {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const onToggleTheme = React.useCallback(() => {
    toggleDarkMode()
  }, [toggleDarkMode])
  return (
    <div
      className={cs('breadcrumb', 'button', !hasMounted && styles.hidden)}
      onClick={onToggleTheme}
    >
      {hasMounted && isDarkMode ? <IoMoonSharp /> : <IoSunnyOutline />}
    </div>
  )
}

// const SiteName = () => {
//   const [hasMounted, setHasMounted] = React.useState(false)

//   React.useEffect(() => {
//     setHasMounted(true)
//   }, [])

//   const goToTop = () => {


//     window.scrollTo({
//         top: 0,
//         behavior: 'smooth',
//     });

//   };
  
//   return (
//     <div className={cs('breadcrumbs',!hasMounted && styles.hidden)}>
//       <div className={cs('breadcrumb', 'active',!hasMounted && styles.hidden)}>
//         <span className={cs('title',!hasMounted && styles.hidden)} onClick={goToTop}>↑</span>
//       </div>
//     </div>
//   )
// }


const SiteName1 = () => {
  const goToMenu = () => {
    const el = document.getElementsByClassName("notion-page-scroller") as HTMLCollectionOf<HTMLElement>;;
   
    const elHeight = el[0].offsetHeight;
     console.log(elHeight);
    window.scrollTo({
        top: elHeight,
        behavior: 'smooth',
    });

  };
  return (
    <div
      className={cs('breadcrumb', 'button')}
      onClick={goToMenu}
      >Menu
    </div>
  )
}
const SiteName2 = () => {
  const goToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
  }

  return (
    <div
      className={cs('breadcrumb', 'button')}
      onClick={goToTop}
      >↑
    </div>
  )
}
export const NotionPageHeader: React.FC<{
  block: types.CollectionViewPageBlock | types.PageBlock
}> = ({ block }) => {
  const { components, mapPageUrl } = useNotionContext()

  if (navigationStyle === 'default') {
    return <Header block={block} />
  }
  return (
    <header className='notion-header'>
      <div className='notion-nav-header'>
        <Breadcrumbs block={block} rootOnly={true}/>

        <div className='notion-nav-header-rhs breadcrumbs'>
          <ToggleThemeButton />
          {navigationLinks
            ?.map((link, index) => {
              if (!link.pageId && !link.url) {
                return null
              }

              if (link.pageId) {
                  return (
                    <components.PageLink
                      href={mapPageUrl(link.pageId)}
                      key={index}
                      className={cs(styles.navLink, 'breadcrumb', 'button')}
                    >
                      {link.title}
                    </components.PageLink>
                  )  
                // }
                
              } else {
                return (
                  <components.Link
                    href={link.url}
                    key={index}
                    className={cs(styles.navLink, 'breadcrumb', 'button')}
                  >
                    {link.title}
                  </components.Link>
                )
              }
            })
            .filter(Boolean)}
          <SiteName1 />
          <SiteName2 />
          {/* {isSearchEnabled && <Search block={block} title={null} />} */}
        </div>
      </div>
    </header>
  )
}
