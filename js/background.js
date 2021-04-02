
// var _gaq = _gaq || [];
// _gaq.push(
//   ["_setAccount", "UA-147641272-1"], // prod account "UA-106878158-5"
//   ["_trackPageview"]
// );
//
// (function() {
//   var ga = document.createElement("script");
//   ga.type = "text/javascript";
//   ga.async = true;
//   ga.src = "https://ssl.google-analytics.com/ga.js";
//   var s = document.getElementsByTagName("script")[0];
//   s.parentNode.insertBefore(ga, s);
// })();


// function sendAnalyticsData(data) {
//   console.log('datatta', data)
//   if (!data.filteringEnabled) {
//     _gaq.push([ "_trackEvent", "Usage Stats",  "Time", "scrollingTime", data.totalTimeSpent ])
//   }
//   if (data.adsSeen) {
//     _gaq.push(
//       [ "_trackEvent", "Usage Stats",  "Ads", "adsSeen", data.adsSeen ],
//       [ "_trackEvent", "Usage Stats",  "Time", "timeSpentWhenAdsFound", data.totalTimeSpent ]
//     )
//   } else {
//     _gaq.push(
//       [ "_trackEvent", "Usage Stats",  "Ads", "noAds", data.adsSeen ],
//       [ "_trackEvent", "Usage Stats",  "Time", "timeSpentWhenNoAdsFound", data.totalTimeSpent ]
//     )
//   }
// }


if (!localStorage.enabled_posts) localStorage.enabled_posts = false;
if (!localStorage.installDate) {
  localStorage.installDate = new Date();
  localStorage.daysNumber = 1;
}
if (!localStorage.hasShopify) localStorage.hasShopify = false;

function checkTimeStamp() {
  var number = Number(localStorage.daysNumber);
  if (number <= 4) {
    if (localStorage.installDate) {
      var date = new Date(localStorage.installDate);
      date.setHours(0, 0, 0, 0);
      var date1 = new Date();
      date1.setHours(0, 0, 0, 0);
      var same = date.getTime() !== date1.getTime();
      if (same) {
        localStorage.daysNumber = number + 1;
      }
    } else {
      localStorage.installDate = new Date();
      localStorage.daysNumber = 1;
    }
  }
}
var IP = ''
function getIp() {
  $.ajax({
    type: "GET",
    url: "https://api.ipify.org/?format=json",
    dataType: "json",
    success: function (ipData) {
      IP = ipData ? ipData.ip : {};
    }
  })
}
getIp();

checkTimeStamp();

var lastActive
chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('activeInfo', activeInfo);
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    var url = tabs[0].url;
    console.log('ACTIVEVEVEVEVEV', url)
    if (lastActive) {
      lastActive.includes('facebook')
      chrome.extension.sendMessage({ name:'get-ga-data'})
    }
    lastActive = url

  });
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (!tab || !tab.url) {
    console.log('NO TAB')
    return
  };

  // Create href element from URL to easily get the domain
  var a = document.createElement("a");
  a.href = tab.url;
  console.log('IT IS CALLED', tab)
  chrome.pageAction.show(tabId);

  // If adblocking is disabled - show the b&w icon
  if (localStorage.enabled_posts == "false") {
    // var details = new Object();
    // details.tabId = tab.id;
    // details.path = "img/icon38-disabled.png";
    // chrome.pageAction.setIcon(details);
  } else {
    // var details = new Object();
    // details.tabId = tab.id;
    // checkTimeStamp();
    // var number = localStorage.daysNumber;
    // if (number >= 4) {
    //   details.path = "img/icon38.png";
    // }
    // chrome.pageAction.setIcon(details);
  }
});


// chrome.tabs.executeScript (null, null, function() {
//   // if (!tab || !tab.url) return;
//   // console.log('INSIDE SCRIPTTTT', tabId, details)
//   if (chrome.runtime.lastError) {
//      var errorMsg = chrome.runtime.lastError.message
//      console.log('ERORROOROROROROROOR', errorMsg)
//   }
// })

// register to events from content script
chrome.extension.onMessage.addListener(function(message, sender, callback) {
  if (message.name === 'sendFeedback') {
    console.log("BACK ERRORRRR MESSAGE", message.data)
    return sendFeedback(message.data)
  }
  console.log('YOOOOOOOOOOO', message)
  // if (message.name === 'ga_event'){
  //   sendAnalyticsData(message.data)
  //   console.log('INSIDE FIRING GA EVENT')
  // }
  if (message && message.getStatus) {
    callback({ enabled_posts: localStorage.enabled_posts == "true" });
  } else if (message && message.name === 'saveAds') {
    // console.log('MESSAGE RECEIVED TO SAVE ADS')
    // creating a new property location on ads data
    message.data['location'] = IP
    $.ajax({
      type: "POST",
      url: "https://tadg.herokuapp.com/a/s",
      data: message.data,
      dataType: "json",
      success: function(t) {
        // console.log('INSIDE SUCCESS')
        // executing callback to again trigger the function that collects data
        callback()
      },
      error: function (t) {
        // console.log('INSIDE ERROR')
        // executing callback after 20 secs to again trigger the function that collects data
        // setTimeout(() => {}, 20000)
        callback()
      }
    })
  } else {
    callback(message);
  }

  function sendFeedback (data) {
    fetch('http://localhost:3000/a/f', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        ip: IP
      })
    })
  }
});

