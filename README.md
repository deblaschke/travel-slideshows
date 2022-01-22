
TRAVEL PICTURE SLIDESHOWS README
--------------------------------

To view the slideshows, go to https://deblaschke.github.io/travel-slideshows/
in your favorite browser and select the slideshow of interest by clicking on
its thumbnail.  The slideshow will open in a new tab/window.  When the
slideshow is complete (there are two standard closing credit slides at the
end) or you've had too much, close the tab/window.

Automatic slideshows have three control buttons below the pictures: previous
slide, pause/play, and next slide.  Manual slideshows only have the previous
slide and next slide buttons.  The left arrow (previous slide) and right arrow
(next slide) keys can be used in lieu of the control buttons.

The slideshows have been tested on the following browsers:
   - Firefox on Windows and macOS
   - Chrome on Windows, macOS and Android (NOTE: Not responsive on mobile devices)
   - Internet Explorer on Windows (NOTE: Might need to allow blocked content)
   - Safari on macOS
   - Edge on Windows

The following slideshow attibutes can be customized:

   1) Manual/Automatic

      In js/slideshow.js, change MANUAL_SLIDESHOW (default false) to desired
      value

      NOTE: This can be overridden on the URL through use of the mode query
      parameter, for example "?mode=manual"

   2) Interval

      In js/slideshow.js, change SLIDESHOW_INTERVAL (default 3000) to desired
      value in milliseconds

      NOTE: Only applicable if MANUAL_SLIDESHOW is false

      NOTE: This can be overridden on the URL through use of the interval query
      parameter, for example "?interval=1000"

   3) Range

      The beginning and/or ending picture can be set on the URL through use of
      the from/to query parameters, for example "?from=10&to=25" will display
      only pictures 010_* through 025_*

      NOTE: This is not intended for use with compilations

   4) Dimensions

      In css/slideshow.css, change width and height (default 640 pixels) to
      desired value, which should be square for best appearance

      NOTE: Pictures are sized to 640 pixels along biggest dimension, so
      increasing this value can lead to pixelization

