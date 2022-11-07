'use client';
import * as React from 'react'

export default function HtmlfromNotion() {

    function createMarkup(c){
        return { __html: c };
      }
       const   html=`<div><style>
      .notion-block-bc157d388119417e9df20c032bdfbe64 {
      max-width: none;
      max-height: none;
      width: 100vw
      }
      </style>
      <html>
      <head>
      <script type="text/javascript">
      function welcome() {
      console.log("clicked");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userEmailSaved");
      window.location.reload();
      return false;
      }
      </script>
      <script type="text/javascript">
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = "7ebf4eb1-38f7-4c10-8fab-db71c20240ef";
      (function() {
      d = document;
      s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = 1;
      d.getElementsByTagName("head")[0].appendChild(s);
      })();
      </script>


      </head>

      </html></div>`;

    
    return(
        <>
         <div dangerouslySetInnerHTML={createMarkup(html)}></div>
        </>);
      
}
