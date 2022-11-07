function welcome() {
    console.log("clicked");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmailSaved");
    window.location.reload();
    return false;
}

window.$crisp = [];
window.CRISP_WEBSITE_ID = "7ebf4eb1-38f7-4c10-8fab-db71c20240ef";
(function () {
    d = document;
    s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    d.getElementsByTagName("head")[0].appendChild(s);
})();

console.log(hhghhhhhhh);
var AccessToken = localStorage.getItem("userToken");
var EmailSaved = localStorage.getItem("userEmailSaved");
const apikey = "83067ff0-ab00-465e-bf33-26942b8977e2"
if (AccessToken == null && (location.pathname.split("/")[1].split(" - ")[0] == "log-in-652dce0865f64a84a19bd0151821007b")) {
    var mojoEl = document.createElement("div");
    mojoEl.setAttribute("id ", "mojoauth - passwordless - form ");
    mojoEl.setAttribute("style ",
        "background - color:#2F3437;width: 100%;height: 100%;position: absolute;top: 0;");
    document.getElementsByTagName("head")[0].appendChild(mojoEl);
    console.log("element created");
    var mojoauth = new MojoAuth(apikey, {
        language: "language_code",
        redirect_url: "https://jornadasdomar.pedro.gq/log-in",
        source: [{
            type: "email",
            feature: "magiclink"
        }],
    });
    mojoauth.signIn().then(response => {
        console.log("signed in", response);
        localStorage.setItem("userToken", response.oauth.access_token);
        localStorage.setItem("userEmailSaved", response.user.email);
        mojoEl.remove();
        window.location.reload();
        return false;
    });
} else if (AccessToken != null && (location.pathname.split("/")[1].split("-")[0] == "log-in-652dce0865f64a84a19bd0151821007b")) {
    var mojoauth = new MojoAuth(apikey);
    mojoauth.verifyToken(AccessToken).then(response => {
        if (!response.isValid || response.isValid == false) {
            console.log("user not logged in");
            localStorage.removeItem("userToken");
            localStorage.removeItem("userEmailSaved");
            window.location.reload();
            return false;
        } else {
            console.log("valid log in, proceed", response);
            if (document.getElementById("mojoauth-passwordless-form")) {
                document.getElementById("mojoauth-passwordless-form").outerHTML = "";
                console.log("removed mojo aftyer verification");
            }
        }
    });
} else {
    if (document.getElementById("mojoauth-passwordless-form")) {
        document.getElementById("mojoauth-passwordless-form").outerHTML = "";
        console.log("removed mojo on simple else");
    }
}






let previousUrl = "";
const observer = new MutationObserver(() => {
    if (window.location.href !== previousUrl) {
        console.log("URL changed from " + previousUrl + " to " + window.location.href);
        previousUrl = window.location.href;
        if ((location.pathname.split("/")[1].split("-")[0] != "log")) {
            if (document.getElementById("mojoauth-passwordless-form")) {
                document.getElementById("mojoauth-passwordless-form").outerHTML = "";
                if (document.getElementById("mojoauth-login-container")) {
                    document.getElementById("mojoauth-login-container").outerHTML = "";
                }
                console.log("removed mojo event");
            }
        }
    }
});
const config = {
    subtree: true,
    childList: true
};
observer.observe(document, config);