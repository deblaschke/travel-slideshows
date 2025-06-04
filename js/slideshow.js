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
  slideIndex = 0;

  // Initiate slideshow
  if (MANUAL_SLIDESHOW) {
    hidePlayButton();
    showPic(1);
  } else {
    slideshow();
  }
});
