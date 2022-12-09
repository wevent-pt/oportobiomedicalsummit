import * as React from 'react'
import Document, { Head, Html, Main, NextScript } from 'next/document'

import { IconContext } from '@react-icons/all-files'

export default class MyDocument extends Document {
  render() {
    function createMarkup(c) {
      return { __html: c }
    }
    const htmlHeadAll = `     
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <script id="tailwindd-script" src="https://cdn.tailwindcss.com"></script>
    <script id="mojo-script" src="https://cdn.mojoauth.com/js/mojoauth.min.js"></script>
    <script id="mojo-custom-script">
    function resolveMojoSignIn(response) {
      deb(JSON.stringify(response));
      if (response.authenticated) {
        setUser(response.user.email, response.oauth.access_token);
      } else {
        window.location = "/autherror";
      }
    }
    
    function signUser() {
      var obj = {
        'userEmail': window.localStorage.getItem('userEmail'),
        'userToken': window.localStorage.getItem('userToken')
      }
      var authed = obj.userEmail;
      if (authed) {
        deb(authed + " already signedIn");
        window.location = "/signedin";
      } else {
        const mojoauth = new MojoAuth("dd4b7e12-f1bd-4fb6-aec3-ad86de79d558", {
          source: [{
            type: 'email',
            feature: 'magiclink'
          }]
        });
        mojoauth.signIn().then(response => resolveMojoSignIn(response));
      }
    }
    </script>
    <script id="debuggerUser">
      const debug = false;
    
      function deb(data) {
        if (debug) {
          console.log("debug: ", data);
          if (document.getElementById("info")) {
            document.getElementById("info").innerHTML += '<p></p>';
            document.getElementById("info").innerHTML += data;
          }
        }
      }
    </script>
    <script id="userFunctionsAndMojo">
      function setUser(email, token) {
        var obj = {
          'userEmail': email,
          'userToken': token
        }
        window.localStorage.setItem('userEmail', obj.userEmail);
        window.localStorage.setItem('userToken', obj.userToken);
        deb("user setted: " + JSON.stringify(obj));
        location.reload();
      }
      
      function getUser() {
        userEmail = window.localStorage.getItem('userEmail');
        userToken = window.localStorage.getItem('userToken');
        var obj = {
          'userEmail': userEmail,
          'userToken': userToken
        }
        deb("got user: " + JSON.stringify(obj));
        return obj;
      }

      function getAgendaInfo() {
        userEmail = window.localStorage.getItem('userEmail');
        userToken = window.localStorage.getItem('userToken');
        var obj = {
          'userEmail': userEmail,
          'userToken': userToken
        }
        deb("got user: " + JSON.stringify(obj));
        return obj;
      }
      
      function resetUser() {
        var obj = {
          'userEmail': '',
          'userToken': ''
        }
        window.localStorage.setItem('userEmail', obj.userEmail);
        window.localStorage.setItem('userToken', obj.userToken);
        deb("reset user: " + JSON.stringify(obj));
        location.reload();
      }
    </script>
    
    <script id="inlineToExecutehtml">
      function clearBlock(el) {
        const node = el.parentElement;
        // console.log("nodeeeeee", node);
        // node.innerHTML = '';
        const newEl = document.createElement("div");
        newEl.className = "notion-asset-wrapper notion-asset-wrapper-embed";
        // element is the element you want to wrap
        var parent = node.parentNode;
        var wrapper = document.createElement("div");
        // set the wrapper as child (instead of the element)
        parent.replaceChild(wrapper, node);
        // set element as child of wrapper
        wrapper.appendChild(node);
        wrapper.className = "notion-asset-wrapper notion-asset-wrapper-embed";
        return wrapper;
      }
      const SELECTOR2 = "code:not([super-embed-seen])";
    
      function setupEmbeds() {
        document.querySelectorAll(SELECTOR2).forEach((node) => {
          node.setAttribute("super-embed-seen", 1);
          if (node.innerText.startsWith("super-embed:")) {
            const code = node.innerText.replace("super-embed:", "");
            const parentNode = clearBlock(node);
            parentNode.innerHTML = code;
            parentNode.querySelectorAll("script").forEach((script) => {
              if (!script.src && script.innerText) {
                eval(script.innerText);
              } else {
                const scr = document.createElement("script");
                Array.from(script.attributes).forEach((attr) => {
                  scr.setAttribute(attr.name, attr.value);
                });
                document.body.appendChild(scr);
              }
            });
          }
        });
      }
      setupEmbeds();
      var observer = new MutationObserver(function(mutations) {
        if (document.querySelector(SELECTOR2)) {
          setupEmbeds();
        }
      });
      observer.observe(document, {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true
      });
      
      </script>
      <script id="spriptLoginBtn">
      function doStuff(element) {
        if(getUser().userEmail){
          element.innerHTML='Sign Out';
          element.removeAttribute('href');
          element.setAttribute('onclick',"resetUser()");
        }
      }
      var checkIfExists = setInterval(function() {
        var exists = document.getElementById("loginBtn");
    
        if (exists) {
            clearInterval(checkIfExists);
            doStuff(exists);
        }
      }, 25);
      
      var checkIfExistsM = setInterval(function() {
        var existsM = document.getElementById("loginBtnM");
    
        if (existsM) {
            clearInterval(checkIfExistsM);
            doStuff(existsM);
        }
      }, 25);
    
      
      
    </script>
    
    <script id="protectd_pages_auth_redirect_to_index">
      const protectd_pages_auth_redirect_to_index = ["/signedin", "/auth-login-control", "/protected-stream"];
      for (const key in protectd_pages_auth_redirect_to_index) {
        if (window.location.pathname === protectd_pages_auth_redirect_to_index[key]) {
          if (!window.localStorage.getItem("userEmail")) {
            window.location = "/";
          }
        }
      }
    </script>
    <script id="protected_pages_auth_redirect_to_signedin">
      const protected_pages_auth_redirect_to_signedin = ["/signin", "/auth-signin-control"];
      for (const key in protected_pages_auth_redirect_to_signedin) {
        if (window.location.pathname === protected_pages_auth_redirect_to_signedin[key]) {
          if (window.localStorage.getItem("userEmail")) {
            window.location = "/signedin";
          }
        }
      }
    </script>
    `
    const htmlInnerBody = `
    <script>
    </script>`
    return (
      <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
        <Html lang='en'>
          <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png"/>
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"/>
<link rel="icon" type="image/png" sizes="194x194" href="/icons/favicon-194x194.png"/>
<link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png"/>
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png"/>
<link rel="manifest" href="/icons/site.webmanifest"/>
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#c87766"/>
<link rel="shortcut icon" href="/icons/favicon.ico"/>
<meta name="apple-mobile-web-app-title" content="Oporto Biomedical Summit"/>
<meta name="application-name" content="Oporto Biomedical Summit"/>
<meta name="msapplication-TileColor" content="#ffffff"/>
<meta name="msapplication-TileImage" content="/icons/mstile-144x144.png"/>
<meta name="msapplication-config" content="/icons/browserconfig.xml"/>
<meta name="theme-color" content="#ffffff" />
            <link rel='manifest' href='/manifest.json' />

            <head
              id='AllPages.headNEXT'
              dangerouslySetInnerHTML={createMarkup(htmlHeadAll)}
            />
            <head
              id='AllPages.jsNEXT'
              dangerouslySetInnerHTML={createMarkup(`<script></script>`)}
            />
            <head
              id='AllPages.cssNEXT'
              dangerouslySetInnerHTML={createMarkup(`<style></style>`)}
            />
            <head
              id='AllPages.innerBody'
              dangerouslySetInnerHTML={createMarkup(htmlInnerBody)}
            />
          </Head>

          <body>
            
            
            <Main />
            <NextScript />
          </body>
        </Html>
      </IconContext.Provider>
    )
  }
}
