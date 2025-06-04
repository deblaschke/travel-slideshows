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
    if (dir != null) {
      var trip = "";

      // Get trip name from dir
      switch (dir[0].slice(1, -1)) {
        // Spring Vacation cases
        case "1990Colorado":
        case "1991Trip":
        case "1993Trip":
        case "2001Trip":
        case "2022Colorado":
          trip = dir[0].substring(1, 5) + " Spring Vacation";
          break;

        // Summer Vacation cases
        case "1992Trip":
        case "1995Trip":
        case "2002Trip":
        case "2004Trip":
        case "2005Trip":
        case "2006Trip":
        case "2008Trip":
        case "2009Trip":
        case "2011Trip":
        case "2012Trip":
        case "2013Trip":
        case "2014Trip":
        case "2015Trip":
        case "2017Trip":
        case "2018Trip":
        case "2019Trip":
        case "2020Trip":
        case "2021Trip":
        case "2022Trip":
        case "2023Trip":
          trip = dir[0].substring(1, 5) + " Summer Vacation";
          break;

        // Autumn Vacation cases
        case "1990Trip":
        case "1991FallFoliage":
        case "1992FallFoliage":
        case "1993Homecoming":
        case "1998Homecoming":
        case "1999Trip":
        case "2021Colorado":
          trip = dir[0].substring(1, 5) + " Autumn Vacation";
          break;

        // Two-year Winter Vacation cases
        case "1996-97RoseParade":
          trip = dir[0].substring(1, 8) + " Winter Vacation";
          break;

        // Spring Break cases
        case "1988Trip":
        case "2014WashDC":
        case "2016WashDC":
        case "2018Colorado":
          trip = dir[0].substring(1, 5) + " Spring Break";
          break;

        // One-year Winter Break cases
        case "2015NewMexico":
          trip = dir[0].substring(1, 5) + " Winter Break";
          break;

        // Two-year Winter Break cases
        case "2013-14Florida":
        case "2014-15Arizona":
        case "2018-19Florida":
        case "2024-25Trip":
          trip = dir[0].substring(1, 8) + " Winter Break";
          break;

        // Summer Vacation I cases
        case "1998Colorado":
        case "2007Trip":
        case "2010Trip":
        case "2016Alaska":
          trip = dir[0].substring(1, 5) + " Summer Vacation I";
          break;

        // Summer Vacation II cases
        case "1998Trip":
        case "2007Colorado":
        case "2010Wisconsin":
        case "2016Trip":
          trip = dir[0].substring(1, 5) + " Summer Vacation II";
          break;

        // Business Trip cases
        case "1992OS2Trip":
        case "2016Berlin":
          trip = dir[0].substring(1, 5) + " Business Trip";
          break;

        // Special cases
        case "1989Honeymoon":
          trip = "1989 Honeymoon";
          break;
        case "2019Berlin":
          trip = "2019 Business Trip I";
          break;
        case "2019Cologne":
          trip = "2019 Business Trip II";
          break;
        case "2017Dusseldorf":
        case "2018Dusseldorf":
          trip = "Germany compilation";
          break;
        case "2023SanAntonio":
          trip = "2023 Bowl Trip";
          break;
        case "2024LosAngeles":
          trip = "2024 Concert Trip";
          break;
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
