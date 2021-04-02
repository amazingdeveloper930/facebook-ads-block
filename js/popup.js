// Here I have added tracking code for google analytics

var _gaq = _gaq || [];
_gaq.push(
  ["_setAccount", "UA-147641272-1"],  // prod account "UA-106878158-5"
  ["_trackPageview"]
);

(function() {
  var ga = document.createElement("script");
  ga.type = "text/javascript";
  ga.async = true;
  ga.src = "https://ssl.google-analytics.com/ga.js";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(ga, s);
})();

function seeIfChecked() {
  if (localStorage.enabled_posts == "true") {
    $("#enable_block_posts").click();
  }
}

var toggleCount;
function updateMenuText() {
  if (localStorage.enabled == "false") $("#enable_block img").fadeTo(100, 0);
  else $("#enable_block img").fadeTo(100, 1);
  toggleCount = +localStorage.toggleCount;
  if (!toggleCount) {
    toggleCount = 0;
  }
  seeIfChecked();
}

function change_posts_activity() {
  // flip current state
  localStorage.enabled_posts =
    localStorage.enabled_posts == "true" ? "false" : "true";

  if (localStorage.enabled_posts === "true") {
    toggleCount++;
    localStorage.toggleCount = toggleCount;
  }
  // Update menu text

  var queryInfo = { url: "*://*.facebook.com/*" };

  chrome.tabs.query(queryInfo, function(arr) {
    if (!arr || arr.length === 0) return;

    var imagePath = "img/icon38.png";
    if (localStorage.enabled_posts === "false")
      imagePath = "img/icon38-disabled.png";

    for (var i = 0; i < arr.length; ++i) {
      var details = new Object();
      details.tabId = arr[i].id;
      details.path = imagePath;

      // chrome.pageAction.setIcon(details);

      // notify content script on change
      chrome.tabs.sendMessage(details.tabId, {
        enabled_posts: localStorage.enabled_posts == "true",
        actiontype: "posts"
      });
    }
  });
}

// Facebook pixel goes here
!(function(f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function() {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = "2.0";
  n.queue = [];
  t = b.createElement(e);
  t.async = !0;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(
  window,
  document,
  "script",
  "https://connect.facebook.net/en_US/fbevents.js"
);
fbq("init", "119612468737824");
fbq("track", "PageView");

var hasShopify = false;
hasShopify = !localStorage.hasShopify ? false : localStorage.hasShopify;

if (hasShopify) {
  fbq("trackCustom", "hasShopifyEvent", { hasShopify: hasShopify });
}

// console.log("Facebook Pixel Loaded from popup.js");

$(function() {
  chrome.tabs &&
    chrome.tabs.getSelected(null, function(tab) {
      //here we init:
      // - tutorial icon to add dynamic href using apps id
      // - facebook block template
      // - non facebook block template
      // to show and hide if it needed
      let tutorialIcon = $(".tutorial-icon");
      const facebookBlock = $("#facebook_block");
      const nonFacebookBlock = $("#not_facebook_block");

      if (tab.url.indexOf("facebook.com") < 0) {
        tutorialIcon.attr(
          "href",
          `chrome-extension://${chrome.runtime.id}/tutorial.html`
        );
        facebookBlock.hide();
        nonFacebookBlock.show();
      } else {
        tutorialIcon.attr(
          "href",
          `chrome-extension://${chrome.runtime.id}/tutorial.html`
        );
        nonFacebookBlock.hide();
        facebookBlock.show();
      }
    });
  // Update menu text according to status
  updateMenuText();

  $("#enable_block_posts").click(function() {
    change_posts_activity();
  });
});
