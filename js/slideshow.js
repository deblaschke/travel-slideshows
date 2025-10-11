// Indicates manual (true) or automatic (false) slideshow
var MANUAL_SLIDESHOW = false;
// Automatic slideshow interval in milliseconds
var SLIDESHOW_INTERVAL = 3000;
// Indicates audio (true) or no audio (false) during slideshow
var SLIDESHOW_AUDIO = false;
// Indicates beginning slide (-1 indicates none)
var SLIDESHOW_INDEX_FROM = -1;
// Indicates ending slide (-1 indicates none)
var SLIDESHOW_INDEX_TO = -1;
// Indicates number of slides to preload before initiating slideshow (remainder loaded asynchronously)
var SLIDESHOW_PRELOAD = 10;

// Current slide index
var slideIndex;
// Timeout object (Number representing timer ID)
var slideshowTimeout = null;
// Sound object (HTMLAudioElement object)
var slideshowSound = null;
// Array of slides with class "tripPix"
var slideshowElems = document.getElementsByClassName("tripPix");
// Indicates if slideshow has valid from/to specified
var slideshowFromTo = false;
// Indicates if mobile device (if not detected, default behavior occurs which is acceptable)
var isMobileDevice = false;

// Allow for override of default behavior in URL via query parameters
if ("URLSearchParams" in window) {
  var urlParams = new URLSearchParams(window.location.search);
  var urlParam = urlParams.get('mode');
  if (urlParam === 'manual') {
    MANUAL_SLIDESHOW = true;
  }
  urlParam = urlParams.get('interval');
  if (/^\d+$/.test(urlParam)) {
    SLIDESHOW_INTERVAL = parseInt(urlParam, 10);
  }
  urlParam = urlParams.get('audio');
  if (urlParam === 'off') {
    SLIDESHOW_AUDIO = false;
  }
  urlParam = urlParams.get('from');
  if (/^\d+$/.test(urlParam)) {
    SLIDESHOW_INDEX_FROM = parseInt(urlParam, 10);
    if (isNaN(SLIDESHOW_INDEX_FROM) || SLIDESHOW_INDEX_FROM < 0) SLIDESHOW_INDEX_FROM = -1;
  }
  urlParam = urlParams.get('to');
  if (/^\d+$/.test(urlParam)) {
    SLIDESHOW_INDEX_TO = parseInt(urlParam, 10);
    if (isNaN(SLIDESHOW_INDEX_TO) || SLIDESHOW_INDEX_TO < 0) SLIDESHOW_INDEX_TO = -1;
  }
  if (SLIDESHOW_INDEX_FROM > -1 || SLIDESHOW_INDEX_TO > -1) {
    slideshowFromTo = true;
  }
}

// getDescription returns description for compilation slide including trip name
function getDescription(path) {
  var result = "";

  // path is of format "*/dir/file.jpg"
  // dir is of format "nnnn[-nn]*"
  // file is of format "nnn_picture-description"

  // Process valid paths (must have directory separator and .jpg extension)
  path = decodeURI(path);
  var index = path.lastIndexOf('/');
  if (index >= 0 && path.lastIndexOf('.jpg') > index) {
    var file = path.substring(index + 1, path.lastIndexOf('.'));

    // File begins with "nnn_" for slides
    if (/^[0-9]{3}_/.test(file)) {
      if (/^[0-9]{3}_[C-Z]{1}[0-9]{7}/.test(file)) {
        // Found digital camera picture name ("nnn_Annnnnnn")
        result = file.substring(4, 12);
      } else if (/^[0-9]{3}_[A-B]{1}[0-9]{3}-[0-9]{2}/.test(file)) {
        // Found film camera picture name ("nnn_Annn-nn")
        result = file.substring(4, 11);
      } else if (/^[0-9]{3}_[0-9]{8}T[0-9]{6}/.test(file)) {
        // Found cell phone camera picture name ("nnn_nnnnnnnnTnnnnnn")
        result = file.substring(4, 12) + file.substring(13, 19);
      }

      // Continue processing if recognized picture name
      if (result.length > 0) {
        // Handle description if present
        index = file.indexOf('-', result.length + 4);
        if (index >= 0) {
          // Picture description is everything after "-"
          var desc = file.substring(index + 1);

          // Replace underscores with spaces
          result = result + " - " + desc.replace(/_/g, ' ');

          // Replace special characters ("[*]") with HTML entity names ("&*;")
          index = file.indexOf('[');
          if (index >= 0 && index < file.indexOf(']')) {
            result = result.replace(/\[/g, '&');
            result = result.replace(/\]/g, ';');
          }
        }
      }
    }

    // Append trip name if valid dir format
    var dir = path.match(/\/[0-9]{4}(-[0-9]{2})?[A-Z]{1}[A-Z0-9]*\//gi);
    if (result.length > 0 && dir != null) {
      var trip = "";

      // Get trip name from dir
      var tripDir = dir[0].slice(1, -1);
      if (["2017Dusseldorf", "2018Dusseldorf"].includes(tripDir)) {
        trip = "Germany compilation";
      } else if (all_trips.has(tripDir)) {
        trip = all_trips.get(tripDir).title;
      }

      // Append trip name if one exists
      if (trip.length > 0) {
        result = result + "<BR>(" + trip + ")";
      }
    }
  }

  // Display space to occupy slideName span if description empty
  if (result.length == 0) {
    result = "&nbsp;";
  }

  return result;
}

// SPECIAL CASE: GitHub
function getRegion(dir) {
  var region = "";
  if (all_trips.has(dir)) {
    region = "https://deblaschke.github.io/travel-slideshows-" + all_trips.get(dir).region;
  }
  return region;
}

// preloadSlideshow adds title and preloaded slides to slideshow
function preloadSlideshow(targetElement, titleSlide, filtered_slides) {
  // Add title to slideshow
  var imgElem = document.createElement('img');
  imgElem.src = titleSlide == null ? "QUERY/title.jpg" : titleSlide;
  imgElem.alt = "Title";
  imgElem.className = "tripPix";
  imgElem.style = "width:95%;height:71%;";
  targetElement.appendChild(imgElem);

  // Add initial matching slides to slideshow
  var numPreload = filtered_slides.length > SLIDESHOW_PRELOAD ? SLIDESHOW_PRELOAD : filtered_slides.length;
  for (var i = 0; i < numPreload; i++) {
    var slide = filtered_slides[i];
    imgElem = document.createElement('img');
    imgElem.src = getRegion(slide.dir) + "/" + slide.dir + "/" + slide.file + ".jpg";
    imgElem.alt = 'Slide';
    // DEBUG: Uncomment following line along with 'document.getElementById("slideName").innerHTML =' lines below
    // imgElem.deb_attrs = slide.attrs;
    imgElem.className = 'tripPix';
    imgElem.style = slide.style;
    targetElement.appendChild(imgElem);
  }
}

// loadSlideshow asynchronously adds non-preloaded slides and credits to slideshow
async function loadSlideshow(targetElement, filtered_slides) {
  var imgElem;

  // Add matching slides to slideshow, if any
  for (var i = SLIDESHOW_PRELOAD; i < filtered_slides.length; i++) {
    var slide = filtered_slides[i];
    imgElem = document.createElement('img');
    imgElem.src = getRegion(slide.dir) + "/" + slide.dir + "/" + slide.file + ".jpg";
    imgElem.alt = 'Slide';
    // DEBUG: Uncomment following line along with 'document.getElementById("slideName").innerHTML =' lines below
    // imgElem.deb_attrs = slide.attrs;
    imgElem.className = 'tripPix';
    imgElem.style = slide.style;
    targetElement.appendChild(imgElem);
  }

  // Add credits to slideshow
  imgElem = document.createElement('img');
  imgElem.src = "images/theend1.jpg";
  imgElem.alt = "Credit";
  imgElem.className = "tripPix";
  imgElem.style = "width:95%;height:71%;";
  targetElement.appendChild(imgElem);
  imgElem = document.createElement('img');
  imgElem.src = "images/theend2.jpg";
  imgElem.alt = "Credit";
  imgElem.className = "tripPix";
  imgElem.style = "width:95%;height:71%;";
  targetElement.appendChild(imgElem);
  if (SLIDESHOW_AUDIO) {
    imgElem = document.createElement('img');
    imgElem.src = "images/theend3.jpg";
    imgElem.alt = "Credit";
    imgElem.className = "tripPix";
    imgElem.style = "width:95%;height:71%;";
    targetElement.appendChild(imgElem);
  }
}

// reduceSlideshow removes elements from slideshowElems that are outside specified from/to range
function reduceSlideshow() {
  // Start at end so that remove() does not affect index
  for (var i = slideshowElems.length - 1; i > -1; i--) {
    var path = slideshowElems[i].src;
    var index = path.lastIndexOf('/');
    if (index >= 0 && path.lastIndexOf('.jpg') > index) {
      var file = path.substring(index + 1, path.lastIndexOf('.'));
      if (/^[0-9]{3}_/.test(file)) {
        num = parseInt(file.substring(0, 3), 10);
        if (!isNaN(num)) {
          if ((SLIDESHOW_INDEX_FROM > -1 && num < SLIDESHOW_INDEX_FROM) ||
              (SLIDESHOW_INDEX_TO > -1 && num > SLIDESHOW_INDEX_TO)) {
            slideshowElems[i].remove();
          }
        }
      }
    }
  }
  slideshowFromTo = false;
}

// hidePlayButton hides play/pause button for manual slideshows
function hidePlayButton() {
  document.getElementById("buttonPlayPause").style.display = "none";
}

// toggleFlow plays/pauses slideshow as result of user action (mouseclick or keystroke)
// where elem is play/pause button
function toggleFlow(elem) {
  if (slideshowTimeout != null) {
    // Pause slideshow
    clearInterval(slideshowTimeout);
    slideshowTimeout = null;

    // Set button text to ">" (play)
    elem.innerHTML = "&#9658;";
    elem.title = "Play";

    // Pause audio if it exists
    if (slideshowSound != null) {
      slideshowSound.pause();
    }
  } else {
    // Play slideshow
    slideshow();

    // Set button text to "||" (pause)
    elem.innerHTML = "&#10074;&#10074;";
    elem.title = "Pause";

    // Play audio if it exists
    if (slideshowSound != null) {
      slideshowSound.play();
    }
  }
}

// changePic changes slide as result of user action (mouseclick or keystroke)
// where n is delta (+1 or -1)
function changePic(n) {
  showPic(n);

  if (!MANUAL_SLIDESHOW) {
    // Automatic slideshow

    if (slideshowTimeout != null) {
      // Set new timeout for new slide
      clearInterval(slideshowTimeout);
      slideshowTimeout = setInterval(slideshow, SLIDESHOW_INTERVAL);

      // Play audio if it exists
      if (slideshowSound != null) {
        slideshowSound.play();
      }
    }
  } else {
    // Manual slideshow

    // Play audio if it exists
    if (slideshowSound != null) {
      slideshowSound.play();
    }
  }
}

// showPic displays slide where n is change to slideIndex
function showPic(n) {
  slideIndex += n;

  // Reduce slideshow to from/to range (one time only)
  if (slideshowFromTo) reduceSlideshow();

  // Handle wrapping past end of slideshow
  if (slideIndex > slideshowElems.length) {slideIndex = 1}

  // Handle wrapping before beginning of slideshow
  if (slideIndex < 1) {slideIndex = slideshowElems.length}

  // Set all slides to hidden
  for (var i = 0; i < slideshowElems.length; i++) {
    slideshowElems[i].style.display = "none";
  }

  // Set current slide to visible
  slideshowElems[slideIndex-1].style.display = "block";

  // Set slide description
  document.getElementById("slideName").innerHTML = getDescription(slideshowElems[slideIndex-1].src);
  // DEBUG: Uncomment following lines along with 'imgElem.deb_attrs = slide.attrs;' lines above
  // document.getElementById("slideName").innerHTML = (slideshowElems[slideIndex-1].alt == 'Slide')
  //   ? getDescription(slideshowElems[slideIndex-1].src) + '<br><font size="-1" color="blue">[' + (slideshowElems[slideIndex-1].deb_attrs || '') + '] (#' + (slideIndex-1) + '/' + (slideshowElems.length-4) + ')</font>'
  //   : "";
}

// slideshow runs automatic slideshow
function slideshow() {
  showPic(1);

  // Play slideshow if paused
  if (slideshowTimeout == null) {
    slideshowTimeout = setInterval(slideshow, SLIDESHOW_INTERVAL);
  }
}

// Handle left arrow, right arrow and pause keys
document.onkeydown = function(event) {
  switch (event.key) {
    case 'ArrowLeft':
      changePic(-1);
      break;
    case 'ArrowRight':
      changePic(1);
      break;
    case 'Escape':
      if (!MANUAL_SLIDESHOW) {
        toggleFlow(document.getElementById("buttonPlayPause"));
      }
      break;
  }
}

// Load and play audio if configured
if (SLIDESHOW_AUDIO) {
  // Create audio object
  slideshowSound = new Audio("media/audio.mp3");

  // Set audio object to loop
  if (typeof slideshowSound.loop == 'boolean') {
    slideshowSound.loop = true;
  } else {
    slideshowSound.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
  }

  // Play audio object, catching/ignoring any errors
  promise = slideshowSound.play();
  if (promise != null) {
    promise.catch(function(error) { });
  }
}

// setPicDimensions sets dimensions of #innerTable based on window dimensions and device type
function setPicDimensions() {
  // Find smallest window dimension
  var minDim = Math.min(window.innerHeight, window.innerWidth);

  // Calculate smallest dimension based on smallest window dimension and device type
  if (minDim > 842 && isMobileDevice) {
    minDim = 842; /* 95% of 842 is 800 (bump up mimimum on mobile because width is large but screen is small) */
  } else if (minDim > 674) {
    minDim = 674; /* 95% of 674 is 640, which is actual slide resolution */
  } else if (minDim < 269) {
    minDim = 269; /* 95% of 269 is 256, which is as small as we want to go */
  }

  // Set innerTable dimensions (a square) to smallest dimension
  document.getElementById("innerTable").style.width = minDim + 'px';
  document.getElementById("innerTable").style.height = minDim + 'px';

  // Set slideName width to smaller than innerTable width
  document.getElementById("slideName").style.width = (minDim-2) + 'px';
}

// Handle window load
window.onload = function() {
  // Don't do anything if search page
  if (window.location.pathname.includes("SEARCH")) return;

  if (!SLIDESHOW_AUDIO) {
    // Remove music credit (last slide) if it exists
    var audioCredit = slideshowElems[slideshowElems.length-1].src;
    if (audioCredit.indexOf("theend3") != -1) {
      slideshowElems[slideshowElems.length-1].remove();
    }
  }
}

// Handle window resize
window.onresize = function() {
  setPicDimensions();
}

// Handle DOM loaded event
document.addEventListener("DOMContentLoaded", (event) => {
  isMobileDevice = /iPhone|Android|BlackBerry/i.test(navigator.userAgent);
  setPicDimensions();
});
