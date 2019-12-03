//@ts-nocheck
//@ts-ignore
import { Dropbox } from "dropbox";

const utils: any = {
  parseQueryString: function(str: string) {
    var ret = Object.create(null);

    if (typeof str !== "string") {
      return ret;
    }

    str = str.trim().replace(/^(\?|#|&)/, "");

    if (!str) {
      return ret;
    }

    str.split("&").forEach(function(param) {
      var parts = param.replace(/\+/g, " ").split("=");
      // Firefox (pre 40) decodes `%3D` to `=`
      // https://github.com/sindresorhus/query-string/pull/37
      let key = parts.shift() as string;
      let val: any = parts.length > 0 ? parts.join("=") : undefined;

      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (ret[key] === undefined) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
    });

    return ret;
  }
};

let CLIENT_ID = "x6r5q8bswp39z2z";
export function getAuthenticationUrl() {
  var dbx: any = new Dropbox({ clientId: CLIENT_ID });
  return dbx.getAuthenticationUrl(window.location);
}

// Parses the url and gets the access token if it is in the urls hash
export function getAccessTokenFromUrl(): string {
  return utils.parseQueryString(window.location.hash).access_token;
}
// If the user was just redirected from authenticating, the urls hash will
// contain the access token.
export function isAuthenticated() {
  return !!getAccessTokenFromUrl();
}
// Render a list of items to #files
/*function renderItems(items:any) {
  var filesContainer = document.getElementById("files");
  items.forEach(function(item) {
    var li = document.createElement("li");
    li.innerHTML = item.name;
    filesContainer.appendChild(li);
  });
}*/
// This example keeps both the authenticate and non-authenticated setions
// in the DOM and uses this function to show/hide the correct section.
/*function showPageSection(elementId) {
  document.getElementById(elementId).style.display = "block";
}

if (isAuthenticated()) {
  showPageSection("authed-section");
  // Create an instance of Dropbox with the access token and use it to
  // fetch and render the files in the users root directory.
  var dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  dbx
    .filesListFolder({ path: "" })
    .then(function(response) {
      renderItems(response.entries);
    })
    .catch(function(error) {
      console.error(error);
    });
} else {
  import { Dropbox } from "dropbox";
  var dbx = new Dropbox.Dropbox({ clientId: CLIENT_ID });
  var authUrl = dbx.getAuthenticationUrl("http://localhost:3000/auth");
  document.getElementById("authlink").href = authUrl;
}
*/
