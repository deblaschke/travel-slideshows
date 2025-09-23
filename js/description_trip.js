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
