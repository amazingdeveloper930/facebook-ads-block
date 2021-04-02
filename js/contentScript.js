window.sentAds = {}
var CleanPostsIntervalID;
// Initiate cleaning functionality if on facebook.com domain
var currentURL = "" + window.location;
var messageType;
var enabled_posts;
var isActive
var startTime = +new Date()
var adsSeen = 0
var onFacebook = false


if (currentURL.indexOf("facebook.com") > 0) {
  onFacebook = true
  // check extension status on init
  chrome.extension.sendMessage({ getStatus: 1 }, function (response) {
    if (response) {
      if (response.enabled_posts) {
        isActive = true
        enabled_posts = response.enabled_posts;
        startCleaningPosts();
      }
    }
  });

  // register to extension enabled/disabled by user
  chrome.extension.onMessage.addListener(function (message, sender, callback) {
    enabled_posts = message.enabled_posts;

    if (message && message.actiontype == "posts") {
      if (message && message.enabled_posts) {
        isActive = true
        startTime = +new Date() //resetting time
        startCleaningPosts();
      } else {
        sendAnalyticsData()
        restorePosts();
      }
    }

    if (message && message.name === 'get-ga-data') {
      sendAnalyticsData()
    }
  });
}

function sendAnalyticsData () {
  chrome.extension.sendMessage({ name: 'ga_event', data: {
    adsSeen,
    totalTimeSpent: Math.round(((+new Date()) - startTime)/1000),
    filteringEnabled: false
  }})
  adsSeen = 0
  startTime = 0
    //resetting ads length
}

function isAd (element) {
  let final = false

  let subHeadingDiv = $(element).find('[data-ft=\'{"tn":"C"}\']').next()
  let els = $(subHeadingDiv).find('a span').toArray()
  // let els = $(element).find('[id^=fbfeed__sub_header_id_] a span').toArray()
  let classObj = {}
  els.forEach(item => {
    let innerEl = $(item).find('span')[0]
    if (innerEl) {
      let cl = innerEl.classList.value
      classObj[cl] =  (classObj[cl] || '') + innerEl.getAttribute('data-content')
    }
  })
  let lang = {
         "patrocinado"  : 1,
        "sponsored"  : 1,
        "sponsorisé"  : 1,
        "sponsorizzata"  : 1,
        "広告"  : 1,
        "赞助内容"  : 1,
        "gesponsert"  : 1,
        "贊助"  : 1,
        "rėmėjai"  : 1,
        "5p4m"  : 1,
        "ได้รับการสนับสนุน"  : 1,
        "may sponsor"  : 1,
        "pеклама"  : 1,
        "реклама"  : 1,
        "ממומן"  : 1,
        "مُموَّل"  : 1,
        "إعلان مُموَّل"  : 1,
        "sponsorizzato"  : 1,
        "sponsoreret"  : 1,
        "sponzorováno"  : 1,
        "gesponsord"  : 1,
        "commandité"  : 1,
        "प्रायोजित"  : 1,
        "bersponsor"  : 1,
        "xορηγούμενη"  : 1,
        "sponsorowane"  : 1,
        "sponzorované"  : 1,
        "publicidad"  : 1,
        "sponsorlu"  : 1,
        "được tài trợ"  : 1,
        "reklamo"  : 1,
        "patrocinat"  : 1,
        "geborg"  : 1,
        "la maalgeliyey"  : 1,
        "disponsori"  : 1,
        "giisponsoran"  : 1,
        "sponzorirano"  : 1,
        "paeroniet"  : 1,
        "spunsurizatu"  : 1,
        "noddwyd"  : 1,
        "sponsitud"  : 1,
        "pəɹosuods"  : 1,
        "babestua"  : 1,
        "sponsore"  : 1,
        "yoɓanaama"  : 1,
        "stuðlað"  : 1,
        "urraithe"  : 1,
        "oñepatrosinapyre"  : 1,
        "daukar nauyi"  : 1,
        "plaćeni oglas"  : 1,
        "icyamamaza ndasukirwaho"  : 1,
        "imedhaminiwa"  : 1,
        "peye"  : 1,
        "sponsorkirî"  : 1,
        "apmaksāta reklāma"  : 1,
        "remiama"  : 1,
        "hirdetés"  : 1,
        "misy mpiantoka"  : 1,
        "sponsorjat"  : 1,
        "sponset"  : 1,
        "sponsa"  : 1,
        "reklama"  : 1,
        "sponsorizat"  : 1,
        "patronadu de:"  : 1,
        "zvabhadharirwa"  : 1,
        "sponsorizuar"  : 1,
        "sponsoroitu"  : 1,
        "sponsrad"  : 1,
        "sponsorıdû"  : 1,
        "kostað"  : 1,
        "szpōnzorowane"  : 1,
        "xορηγούμενη"  : 1,
        "pэклама"  : 1,
        "cпонсорирано"  : 1,
        "سپانسرڈ"  : 1,
        "دارای پشتیبانی مالی"  : 1,
        "تمويل شوي"  : 1,
        "پاڵپشتیکراو"  : 1,
        "ܒܘܕܩܐ ܡܡܘܘܢܐ"  : 1,
        "পৃষ্ঠপোষকতা কৰা"  : 1,
        "স্পনসর করা"  : 1,
        "ਸਰਪ੍ਰਸਤੀ ਪ੍ਰਾਪਤ"  : 1,
        "પ્રાયોજિત"  : 1,
        "ପ୍ରଯୋଜିତ"  : 1,
        "விளம்பரம்"  : 1,
        "ప్రాయోజితం చేయబడింది"  : 1,
        "ಪ್ರಾಯೋಜಿತ"  : 1,
        "സ്പോൺസർ ചെയ്തത്"  : 1,
        "මුදල් ගෙවා ප්‍රචාරය කරන ලදි"  : 1,
        "ຜູ້ສະໜັບສະໜູນ"  : 1,
        "အခပေးကြော်ငြာ"  : 1,
        "რეკლამა"  : 1,
        "የተከፈለበት ማስታወቂያ"  : 1,
        "បានឧបត្ថម្ភ"  : 1,
        "ⵉⴷⵍ" : 1
  }
  for (key in classObj) {
    if (lang[classObj[key].toLowerCase()]) {
      final = true
    }
  }
  return final
}

// failed attempts for finding sponsored stories
// don't delete below code, I need it later
// approach 2
// let arr = []
  // let obj = { 'S': 1, 'p': 2,'o': 3,'n': 4,'s': 5,'o_1': 6,'r': 7,'e': 8,'d': 9 }
  // let lastIndex = 0
  // let eval = false
  // let current = 0
  // let classList1 = ''
  // let classList2 = ''

  // for (let i = 0; i< els.length; i++) {
  //   let el = els[i]
  //   let a = $(el).find('span')[0]
  //   let val
  //   if (a) {
  //     val = window.getComputedStyle(a, ':after').getPropertyValue('content').trim()
  //     if (!val || val === 'none') {
  //       final = ''
  //       break
  //     }
  //     final += val
  //   }
  // }
// }


function startCleaningPosts() {
  messageType = "POST";
  CleanPostsIntervalID = setInterval(function () {
    // loop over all stories
    $('[data-pagelet^="FeedUnit_"]').each((index, element) => {
      // find if a story has ads
      if (!isAd(element)) {
        $(element).hide();
        finalText = ''
      } else {
        $(element).css("display", "")
      }
    });
  }, 1000);
}

function restorePosts() {
  // resetting data
  isActive = false
  counter = 0
  removeElement('noAdsCard')

  clearInterval(CleanPostsIntervalID);
  $('[data-pagelet^="FeedUnit_"]').each((index, element) => {
    // find if a story has ads
    if (!isAd(element)) {
      $(element).show();
    }
  });
}


$(document).on("click", "._3mht ._y-c", function (e) {
  e.stopPropagation();
});

let counter = 0

function collectAdsData () {
  // console.log("COUNT DATATTATTATTA", $("._5jmm").length)
  let allStories = $('[data-pagelet^="FeedUnit_"]')
  let sentAdsLength = 0
  let adLength = 0
  allStories.each((index, element) => {
    // finding if a story is sponsored
    const isSponsored = isAd(element)
    // if a story is sponsored then start collecting ads data
    if (isSponsored) {
      adLength += 1
      let companyEl = $(element).find('[data-ft=\'{"tn":"k"}\'] a');
      const companyPageName = companyEl[0] ? companyEl[0].innerText : '';
      const companyUrl = companyEl.attr('href');

      const destinationUrl = $(element).find('._275_._52c6').attr('href');
      const companyLogo = $(element).find('._38vo img').attr('src');
      const postCopy = $(element).find('[data-ft=\'{"tn":"K"}\'] p').text();

      const videoEl = $(element).find('._53j5 video').toArray();
      let isVideo = videoEl.length > 0;
      let adImage = $(element).find('.scaledImageFitWidth.img').attr('src');

      // when the story is video then picking up video backgroud image as ad image
      if (isVideo) adImage = $(element).find('._3chq').attr('src')

      let headline = $(element).find("._6m6._2cnj._5s6c").text();
      let smalltext = $(element).find('._6m7._3bt9').text();
      // linkPreviewWithButton and linkPreviewWithButton have same results even though when there is no button available
      // the only difference is that when there is no button avaialbe then the link preview gets nested one level deep
      // however the jquery text method can easily extraxt that
      const linkPreviewWithButton = $(element).find('._2iau._59tj').text();
      const linkPreviewNoButton = $(element).find('._2iau._59tj').text();
      const buttonText = $(element).find('._42ft._4jy0._4jy4._517h._51sy').text();
      const comments = $(element).find('._3hg-._42ft').text().split(' ')[0]
      const shares = $(element).find('._3rwx._42ft').text().split(' ')[0] || $(element).find('._355t._4vn2').text().split(' ')[0]
      const likes = $(element).find('._81hb')[0] ? $(element).find('._81hb')[0].textContent: ''

      let views = null
      // if views are visible
      if (isVideo && $(element).find('._26fq').text()) {
        views = $(element).find('._26fq').text()
        // if views are hidden
      } else if (isVideo){
        viewsArr = $(element).find('._1vx9 span').toArray()
        // console.log('VIDEO EL', $(element).find('._1vx9 span'))
        views = viewsArr[viewsArr.length - 1] ? viewsArr[viewsArr.length - 1].textContent.split(' ')[0] : ''
      }

      let postUrl = '';
      let postUrlwithQuery = $(element).find('._3hg-._42ft').attr('href') || '';
      postUrl =  postUrlwithQuery.split('?comment_tracking')[0];
      // when there is a see more link, then the post url can be found on that link
      if (!postUrl && $(element).find('.see_more_link').attr('href')) {
        postUrl = $(element).find('.see_more_link').attr('href');
      }

      // DO NOT DELETE THE BELOW CODE, IT WILL BE USED LATER
      // commenting out carousel ads handling for now
      // const carouselAds = $(element).find('._5ya').toArray()
      // let carouselAdsDetails = []
      // if (carouselAds.length > 0) {
      //   carouselAds.forEach(ad => {
      //     let headline = $(ad).find('._1032').text()
      //     let smalltext = $(ad).find('._1m-h').text()
      //     let destinationUrl = $(ad).find('div > a').attr('href')
      //     let adImage = $(ad).find('._g5g img').attr('src')
      //     carouselAdsDetails.push({
      //       headline,
      //       smalltext,
      //       destinationUrl,
      //       adImage
      //     })
      //   })
      // } else {
      //   headline = $(element).find("._6m6._2cnj._5s6c").text()
      //   smalltext = $(element).find('._6m7._3bt9').text()
      // }
      const finalAdObj = {
        companyPageName, companyLogo, companyUrl, postCopy, destinationUrl,
        isVideo, adImage, headline, smalltext, linkPreviewWithButton,
        linkPreviewNoButton, buttonText, location: '', postUrl, comments,
        likes, shares, views
      }

      // checking if an ad is already sent to db
      if (postUrl && !window.sentAds[postUrl]) {
        window.sentAds[postUrl] = 1
        if (finalAdObj.companyPageName) {
          sentAdsLength += 1
          adsSeen += 1
          // console.log('Sending message to background page to save ads', finalAdObj)
          chrome.extension.sendMessage({name: 'saveAds', data: finalAdObj}, function () {
            // do not delete!!!
            // triggernig count data again once we got the respnse from api
            // let a = throttle(collectAdsData, 10000)
            // console.log("THROTTLE RETURNED VALUE")
          })
        }
      }
    }
  });

  if (adLength === 0 &&  counter <= 3 && isActive){
    popup('Hang Tight! Facebok is loading more posts')
    console.log('no ads found', adLength)
  }
  if (adLength > 0 &&  !sentAdsLength &&  counter <= 3 && isActive) {
    popup('Facebook is not showing you ads right now!')
    console.log('no ads found', counter)
  }
}

function removeElement(id) {
  var elem = document.getElementById(id);
  if (elem && elem.parentNode) {
    return elem.parentNode.removeChild(elem);
  }
  return false
}

function popup (title){
  counter++
  if(!document.getElementById('turbo-noAdsCard') && counter >= 3){
    let html = `
    <div class="turbo-noAdsCard" id="turbo-noAdsCard">
      <div>
        <img class="turbo-card-image" src="https://cdn0.iconfinder.com/data/icons/technology-39/32/laptop_computer_work_screen-512.png"/>
      </div>
      <div class="turbo-ml-40">
        <h3 id="card-title">${title}</h3>
        <div class="turbo-mt-10 turbo-f-tags" >
          <a style="text-decoration: none;" onclick = "window.location.reload()" id="refresh" >Refresh page</a>
          <a style="text-decoration: none;" id="turbo-reportproblemtag" class="turbo-ml-10" >Report a problem </a>
        </div>
      </div>
    </div>`
    document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend' , html)
    document.getElementById('turbo-reportproblemtag').addEventListener('click', (e) => reportProblem(e))
  }
  if (!document.getElementById('turbo-overlay')) {
    let overlayDiv = `<div id="turbo-overlay"></div>`
    document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend' , overlayDiv)
  }

}
function submitFeedback (e) {
  e.preventDefault()
  console.log('clicked')
}

function reportProblem (e) {
  e.preventDefault();
  document.getElementById('turbo-overlay').classList.add('turbo-overlay')
  let html = `
    <div id="turbo-reportproblemdiv" class="turbo-modal">
      <div class="turbo-modal-content">
        <div> <a class="turbo-closefeedback" style="text-decoration: none; font-size:15px;" id="turbo-closefeedbackLink">X</a> </div>
        <div class="tubroFeedbackForm">
          <div class="turbo-feedbacktext-div">
            <textarea id="turbo-feedbacktext" class="turbo-feedbacktext-area" name="userfeedback" placeholder= "Write your problem here"></textarea>
            <div id="turbo-feedbacktext-error" class="turbo-feedback-error turbo-hidden">Please enter the problem you are facing.</div>
          </div>
          <div id="turbo-feedbackincludedetails">
            <input type="checkbox" checked disabled id="turbo-feedbackcheckbox">Include details about this webpage</input>
          </div>
          <div>
            <input class="turbo-button" type="button" value="Submit" id="turbo-feedbacksubmit">
          </div>
        </div>
      </div>
    </div>
  `
  document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend' , html)
  document.getElementById('turbo-closefeedbackLink').addEventListener('click', closePopup)
  document.getElementById('turbo-feedbacktext').addEventListener('keyup', function(e) {
    if (e.target.value.trim()) {
      document.getElementById('turbo-feedbacktext-error').classList.add('turbo-hidden')
    } else {
      document.getElementById('turbo-feedbacktext-error').classList.remove('turbo-hidden')
    }
  })
  $('#turbo-feedbacksubmit').on('click', onFormSubmit)
}

function onFormSubmit(e) {
  if (!$('#turbo-feedbacktext')[0].value.trim()) {
    document.getElementById('turbo-feedbacktext-error').classList.remove('turbo-hidden')
    return
  }
  e.preventDefault();
  let feedback = $('#turbo-feedbacktext')[0].value;
  let storyDiv = getStoryDiv()
  closePopup()
  chrome.extension.sendMessage({ name: 'sendFeedback', data: { feedback, storyDiv } })
  console.log('EEEEEE', feedback, storyDiv)
}

function getStoryDiv() {
  return $('[data-pagelet^="FeedUnit_"]').get(3).outerHTML
}

function closePopup (e) {
  if (e) e.preventDefault();
  removeElement('turbo-reportproblemdiv')
  document.getElementById('turbo-overlay').classList.remove('turbo-overlay')
}

function startAdsCollection () {
  if (onFacebook) {
    setInterval(() => {
      collectAdsData()
    }, 20000)
  }
}

// DO NOT DELETE, will use this function for better optimisations of ada sending
// function throttle (callback, limit=10000) {
//   let wait = false;
//   return function () {
//     if (!wait) {
//     console.log('Actual function called')
//       callback.apply(null, arguments);
//       wait = true;
//       setTimeout(function () {

//         wait = false;
//       }, limit);
//     }
//   }
// }

// // setting up a recursive function to avoid set interval
// function countData() {
//   setTimeout(function () {
//     collectAdsData()
//   }, 10000)
// }

jQuery(document).ready(function ($) {
  // console.log("DOC IS READY")
  startAdsCollection()
  if (window.history && window.history.pushState) {
    $(window).on("popstate", function () {
      var hashLocation = location.hash;
      var hashSplit = hashLocation.split("#!/");
      var hashName = hashSplit[1];
      if (hashName !== "") {
        var hash = window.location.hash;
        if (hash === "") {
          setTimeout(function () {
            if (messageType == "POST") {
              if (enabled_posts) {
                startCleaningPosts();
              }
            }
          }, 1000);
        }
      }
    });
  }

});
