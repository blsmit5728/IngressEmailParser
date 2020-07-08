/**************************************************************************************
** @brief 
**************************************************************************************/
function myFunction() {
  var label = GmailApp.getUserLabelByName("Ingress-Notifications");
  var doneLabel = GmailApp.getUserLabelByName("Ingress-Processed");

  var threads = label.getThreads();
  if (threads.length != 0)
  {
    for (var i=0; i<threads.length; i++)
    {
      var t = threads[i];
      var messages = threads[i].getMessages();
      
      for (var j=0; j<messages.length; j++)
      {        
        var msg = messages[j].getPlainBody();
        var test = messages[j].getRawContent();
        var msgHTML = messages[j].getBody();
        var msgHTMLSplit = msgHTML.split("\n");
        var imgUrl = msgHTMLSplit[124];
        var cleanBodyText = msg.replace(/<\/?[^>]+(>|$)/g, "");
        var msgArray = cleanBodyText.split("\n");
        var sub = messages[j].getSubject();
        var dat = messages[j].getDate();
        var whoTo = messages[j].getTo();
        
        if ( sub.search("Fwd:") != -1 )
        {
          break;
        }
        
        if ( sub.search("Portal review complete") != -1)
        {
          /* handle a Review complete email */
          portalReviewComplete(cleanBodyText, sub, dat, t, label, doneLabel, imgUrl, whoTo, msgHTMLSplit[113], msgHTMLSplit[122]);
        }
        else if (sub.search("Portal submission confirmation") != -1)
        {
          /* handle a Submission Email */
          submissionConfParser(cleanBodyText, sub, dat, t, label, doneLabel, msgHTMLSplit[127], whoTo);
        }
        else if (sub.search("Portal edit submission confirmation") != -1)
        {
          /* handle an Edit submission Conf email */ 
          portalEditSubmission(sub, dat, t, label, doneLabel, whoTo);
        }
        else if (sub.search("Portal Edit Suggestion") != -1)
        {
          /* handle an Edit submission Conf email */ 
          var len = msgHTMLSplit.length;
          if( len == 1 ) // we have a REDACTED email.
          {
            portalEditSubmission(msgArray[14], dat, t, label, doneLabel, "None", "None", whoTo);
          } else {
            var combined = msgHTMLSplit[123] + msgHTMLSplit[124];
            portalEditSubmission(msgHTMLSplit[108], dat, t, label, doneLabel, msgHTMLSplit[125],combined, whoTo);
          }
        }
        else if (sub.search("Portal edit review complete") != -1)
        {
          var len = msgHTMLSplit.length;
          if( len == 1 ) // we have a REDACTED email.
          {
            var N = "";
            if (msgArray.length < 10){
              N = msgArray[3];
            } else {
              N = msgArray[10];
            }
            portalEditReviewComp(N, cleanBodyText, dat, t, label, doneLabel, whoTo, "None", "None");
          } else {
            var combined = msgHTMLSplit[122] + msgHTMLSplit[123];
            portalEditReviewComp(msgHTMLSplit[108], msgHTMLSplit[111], dat, t, label, doneLabel, whoTo, combined, msgHTMLSplit[124]);
          }
        }
        else if (sub.search("Portal photo review complete") != -1)
        {
          photoParser(sub, dat, t, label, doneLabel, msgHTMLSplit[108], msgHTMLSplit[120], whoTo, msgHTMLSplit[112]);
        }
        else if (sub.search("Portal photo submission") != -1)
        {
          photoSubParser(msgHTMLSplit[108], dat, t, label, doneLabel, whoTo,msgHTMLSplit[123]);
        }
        else if (sub.search("Mission") != -1)
        {
          mission_parser(sub, dat, t, label, doneLabel, whoTo);
        }
        else if(sub.search("Invalid Ingress Portal") != -1)
        {
          invalid_portal_parser(sub,msgHTMLSplit[108],msgHTMLSplit[111],dat, t, label, doneLabel, whoTo);
        }        
        else if ( (sub.search("Nominating") != -1) )
        {
          poke_submission_parser(dat, msgArray[10], msgArray[12], msgHTMLSplit[164].replace(/<\/?[^>]+(>|$)/g, ""), t, label, doneLabel, whoTo);
        }
        else if (sub.search("Eligible") != -1)
        {
          poke_approval_parser(dat, msgArray[10], msgArray[12], msgHTMLSplit[166].replace(/<\/?[^>]+(>|$)/g, ""), t, label, doneLabel, whoTo);
        }
        else if (sub.search("Ineligible") != -1)
        {
          poke_rejection_parser(dat, msgArray[12], msgArray[14], msgHTMLSplit[163], msgHTMLSplit[172].replace(/<\/?[^>]+(>|$)/g, ""), t, label, doneLabel, whoTo);
        }
        else if (sub.search("Edit Suggestion Accepted") != -1)
        {
          Logger.log("EDITAC");
          // new 18
          // name 8
          // id 22
          poke_edit_accepted(dat, msgArray[8], t, label, doneLabel, whoTo, msgArray[22], msgArray[18])
        }
        else if (sub.search("Edit Suggestion Received") != -1)
        {
          //function poke_edit_rx( date, title, theThread, label1, label2, whoTo, base64Id)
          Logger.log("EDITRX");
          poke_edit_rx(dat, msgArray[8], t, label, doneLabel, whoTo, msgArray[24], msgArray[20])
          // ID= 24
          // name = 8
          // new Name = 20
        }
        else if (sub.search("Edit Suggestion Rejected") != -1)
        {
          Logger.log("EDITRJ");
          poke_edit_rejected(dat, msgArray[8], t, label, doneLabel, whoTo, msgArray[22], msgArray[20])
        }
        else if( sub.search("Invalid Pok") != -1)
        {
          Logger.log("INV");
        }
      }
    }
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function get_portal_bot_response(portalName)
{
  return "None";
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function poke_submission_parser(date, title, desc, img, theThread, label1, label2, whoTo)
{
  var length = img.length;
  var imgUrl = img;
  var t = imgUrl.replace(' ', '');
  if(findInRow(date) == -1)
  { 
    addToSubmittedRow("SUBMITTED", date, title, whoTo);
    postMessageToDiscord("Portal Submitted - " + title, t, whoTo);
    move_thread( theThread, label1, label2 );
  }
  else
  {
    move_thread( theThread, label1, label2 );
    Logger.log("poke_submission_parser: This entry exists! " + title);
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function poke_approval_parser(date, title, desc, img, theThread, label1, label2, whoTo)
{
  var length = img.length;
  var imgUrl = img;
  var t = imgUrl.replace(' ', '');
  if(findInRow(date) == -1)
  { 
    addToAcceptedRow("APPROVED", date, title, whoTo);
    postMessageToDiscord("Portal __**Accepted!**__ - " + title, t, whoTo);
    move_thread( theThread, label1, label2 );
  }
  else
  {
    move_thread( theThread, label1, label2 );
    Logger.log("poke_approval_parser: This entry exists! " + title);
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function poke_rejection_parser(date, title, desc, reason, img, theThread, label1, label2, whoTo)
{
  var length = img.length;
  var imgUrl = img;
  var t = imgUrl.replace(' ', '');
  if(findInRow(date) == -1)
  { 
    addToRejectedRow("REJECTED", date, title, whoTo);
    var rsp = "Portal __**Rejected!**__ - " + title + "\n**Reason:** " + reason;
    postMessageToDiscord(rsp, t, whoTo);
    move_thread( theThread, label1, label2 );
  }
  else
  {
    move_thread( theThread, label1, label2 );
    Logger.log("poke_rejection_parser: This entry exists!" + title);
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function poke_edit_rx( date, title, theThread, label1, label2, whoTo, base64Id, sugg)
{
  var s = title.indexOf(":");
  var Name = title.substr(s+1,title.length);
  var rowIndex = findEditedEntry("NULL", Name);
  if(rowIndex == -1)
  {
    var discordStr = "Portal Edit Submitted - " + Name + "\nNew Desc/Title: " + sugg;
    addToEditedRow("EDITED", date, Name, whoTo, base64Id);
    postMessageToDiscord(discordStr, "None", whoTo);
    move_thread( theThread, label1, label2 );
  }
  else
  {
    //addToEditedRow("EDITED", date, PortalName, whoTo);
    //postMessageToDiscord(discordStr, portal_photo_link, whoTo);
    move_thread( theThread, label1, label2 );
    Logger.log("poke_edit_rx: Name already found in Edits: " + Name);
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function poke_edit_accepted( date, title, theThread, label1, label2, whoTo, base64Id, sugg)
{
  var s = title.indexOf(":");
  var Name = title.substr(s+1,title.length);
  var rowIndex = findEditedEntry("NULL", Name);
  if(rowIndex == -1)
  {
    move_thread( theThread, label1, label2 );
    Logger.log("poke_edit_accepted: Name already found in Edits: " + Name);
  }
  else
  {
    var discordStr = "Portal Edit Accepted - " + Name + "\New Desc/Title: " + sugg;
    modifyEditedRow(rowIndex, "ACCEPTED", date)
    postMessageToDiscord(discordStr, "None", whoTo);
    move_thread( theThread, label1, label2 );
    
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function poke_edit_rejected( date, title, theThread, label1, label2, whoTo, base64Id, sugg)
{
  var s = title.indexOf(":");
  var Name = title.substr(s+1,title.length);
  var rowIndex = findEditedEntry("NULL", Name);
  if(rowIndex == -1)
  {
    move_thread( theThread, label1, label2 );
    Logger.log("poke_edit_rejected: Name already found in Edits: " + Name);
  }
  else
  {
    var discordStr = "Portal Edit Rejected - " + Name + "\New Desc/Title: " + sugg;
    modifyEditedRow(rowIndex, "REJECTED", date)
    postMessageToDiscord(discordStr, "None", whoTo);
    move_thread( theThread, label1, label2 );
    
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function photoSubParser(name, date, theThread, label1, label2, whoTo, img)
{
  var PortalName = name;
  if(findInRow(date) == -1)
  {
    addToPhotoRow("PHOTO", date, PortalName, whoTo, "SUBMITTED" );
    var s = img.indexOf("<");
    var newImg = img.substr(0,s);
    //var t = img.replace(' ', ''); // extra "<br><br> "
    postMessageToDiscord("Portal Photo Submitted - " + PortalName, newImg, whoTo);
    move_thread( theThread, label1, label2 );
  }
  else
  {
    move_thread( theThread, label1, label2 );
    Logger.log("photoSubParser: This entry exists!" + name);
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function invalid_portal_parser(subject, name, bodyText, date, theThread, label1, label2, whoTo)
{
  var PortalName = name;
  var portal_photo_url = get_portal_bot_response(PortalName);
  if(subject.search("reviewed") != -1)
  {
    if( bodyText.search("remain") != -1)
    {
      var rowIndex = findInvalidEntry("NULL", PortalName);
      if( rowIndex != -1)
      {        
        //addToRejectedRow("INVALID", date, PortalName, whoTo);
        modifyInvalidRow(rowIndex, "REJECTED", date);
        postMessageToDiscord("Invalid Portal __**Rejected**__ - " + PortalName, "None", whoTo);
        move_thread( theThread, label1, label2 );
      }
      else if ( rowIndex == -1 )
      {
        addToRejectedRow("INVALID", date, PortalName, whoTo);
        postMessageToDiscord("Invalid Portal __**Rejected**__ - " + PortalName, "None", whoTo);
        move_thread( theThread, label1, label2 );
      }
      else
      {
        move_thread( theThread, label1, label2 );
        Logger.log("invalid_portal_parser: This entry exists! " + PortalName);
      }
    }
    else
    {
      var rowIndex = findInvalidEntry("NULL", PortalName);
      if( rowIndex != -1)
      {        
        addToAcceptedRow("INVALID", date, PortalName, whoTo);
        postMessageToDiscord("Invalid Portal __**Accepted**__ - " + PortalName, "None", whoTo);
        move_thread( theThread, label1, label2 );
      }
      else if ( rowIndex == -1 )
      {
        //addToAcceptedRow("INVALID", date, PortalName, whoTo);
        modifyInvalidRow(rowIndex, "ACCEPTED", date);
        postMessageToDiscord("Invalid Portal __**Accepted**__ - " + PortalName, "None", whoTo);
        move_thread( theThread, label1, label2 );
      }
      else
      {
        move_thread( theThread, label1, label2 );
        Logger.log("invalid_portal_parser: This entry exists! " + PortalName);
      }
    }
  }
  else
  {
    // submitted
    var ind = findInvalidEntry(date, PortalName);
    if(ind == -1)
      {        
        addToInvalidRow("INVALID", date, PortalName, whoTo, "SUBMITTED");
        postMessageToDiscord("Invalid Portal Submitted - " + PortalName, portal_photo_url, whoTo);
        move_thread( theThread, label1, label2 );
      }
      else
      {
        move_thread( theThread, label1, label2 );
        Logger.log("invalid_portal_parser: This entry exists! " + PortalName);
      }
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function portalReviewComplete(bodyText, subjectStr, date, theThread, label1, label2, imgUrl, whoTo, rejectReason, rejectImgUrl)
{
  var PortalName = subjectStr.substr(23,50);
  var imageUrl = get_portal_bot_response(PortalName);
  if ( (bodyText.search("rejected") == -1) && (bodyText.search("rejection") == -1) )
  {
    if ( bodyText.search("too close") == -1)
    {
      if(findInRow(date) == -1)
      {        
        addToAcceptedRow("ACCEPTED", date, PortalName, whoTo);
        postMessageToDiscord("Portal __**Accepted!**__ - " + PortalName, imgUrl, whoTo);
        move_thread( theThread, label1, label2 );
      }
      else
      {
        move_thread( theThread, label1, label2 );
        Logger.log("portalReviewComplete: This entry exists! " + PortalName);
      }
    }
    else
    {
      if(findInRow(date) == -1)
      {
        addToRejectedRow("NOT ACCEPTED", date,PortalName, whoTo);
        postMessageToDiscord("Portal __**Rejected!**__ Too Close or Duplicate - " + PortalName, "None", whoTo);
        move_thread( theThread, label1, label2 );
      }
      else
      {
        move_thread( theThread, label1, label2 );
        Logger.log("portalReviewComplete: This entry exists! " + PortalName);
      }
    }
  }
  else
  {
    if(findInRow(date) == -1)
    {
      if( bodyText.search("rejected due to the") != -1)
      {
        addToRejectedRow("REJECTED", date,PortalName, whoTo);
        var RR = rejectReason.replace("                                                  "," ");
        var RArray = RR.split("<");
        var R = RArray[0];
        var rsp = "Portal __**Rejected!**__ - " + PortalName + "\n**Reason:** " + R;
        var imageArray = rejectImgUrl.split("<");
        var newImage = imageArray[0];
        postMessageToDiscord(rsp, newImage, whoTo);
        move_thread( theThread, label1, label2 );
      } else {
        // Redacted Emails!
        var rsp = "[REDACTED]\nPortal __**Rejected!**__ - " + PortalName;
        postMessageToDiscord(rsp, "None", whoTo);
        move_thread( theThread, label1, label2 );
      }
    }
    else
    {
      move_thread( theThread, label1, label2 );
      Logger.log("portalReviewComplete: This entry exists! " + PortalName);
    }
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function portalEditSubmission(subjectLine, date, theThread, label1, label2, locationString, newDesc, whoTo)
{
  var PortalName = subjectLine;
  var discordStr = "";
  var paren = locationString.indexOf(")"); 
  var portal_photo_link = "";
  if ( paren > -1 )
  {
    // locationString has 2 <br> at the end...
    var s = locationString.indexOf(")");
    var newLocation = locationString.substr(1,s-1);
    var comma = locationString.indexOf(",");
    var lat = newLocation.substr(0, comma-1);
    var lon = newLocation.substr(comma+1,newLocation.length);
    var googleMapsLink = "http://maps.google.com/maps?q=" + lat + "," + lon
    var intelLink = "https://intel.ingress.com/intel?pll=" + lat + "," + lon + "&z=18"
    portal_photo_link = get_portal_bot_response(PortalName);
    discordStr = "Portal Edit Submitted - " + PortalName + "\nNew Location: " + googleMapsLink + "\nIntel Link: " + intelLink;
  } else {
    discordStr = "Portal Edit Submitted - " + PortalName + "\nNew Desc/Title: " + newDesc;
    portal_photo_link = get_portal_bot_response(PortalName);
  }
  
  
  if(findInRow(date) == -1)
  {
    addToEditedRow("EDITED", date, PortalName, whoTo, 0);
    postMessageToDiscord(discordStr, portal_photo_link, whoTo);
    move_thread( theThread, label1, label2 );
  }
  else
  {
    move_thread( theThread, label1, label2 );
    Logger.log("portalEditSubmission: This entry exists!" + PortalName);
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function portalEditReviewComp(Name,bodyText, date, theThread, label1, label2, whoTo, thingChanged, locationStr)
{
  var PortalName = Name;
  var portal_photo_link = "";
  Logger.log(PortalName);
  Logger.log(bodyText);
  
  var paren = -1;
  if( locationStr != "None" ){
    var paren = locationStr.indexOf(")"); 
  }
  var googleMapsLink = "";
  var intelLink = "";
  if ( paren > -1 )
  {
    // locationString has 2 <br> at the end...
    var s = locationStr.indexOf(")");
    var newLocation = locationStr.substr(1,s-1);
    var comma = locationStr.indexOf(",");
    var lat = newLocation.substr(0, comma-1);
    var lon = newLocation.substr(comma+1,newLocation.length);
    googleMapsLink = "http://maps.google.com/maps?q=" + lat + "," + lon
    intelLink = "https://intel.ingress.com/intel?pll=" + lat + "," + lon + "&z=18"
  }
  if ( bodyText.search("and we have implemented") != -1)
  {
    var rowIndex = findEditedEntry("NULL", PortalName);
    if(rowIndex != -1)
    {
      modifyEditedRow(rowIndex, "ACCEPTED", date)
      //addToAcceptedRow("EDITED", date, PortalName, whoTo);
      var send_str = "";
      if ( googleMapsLink != "" ) {
        send_str = "Portal Edit Accepted - " + PortalName + "\nNew Location: " + googleMapsLink + "\nIntel Link: " + intelLink;
      }
      else {
        send_str = "Portal Edit Accepted - " + PortalName + "\New Desc/Title: " + thingChanged;
      }
      portal_photo_link = get_portal_bot_response(PortalName);
      postMessageToDiscord(send_str, portal_photo_link, whoTo);
      move_thread( theThread, label1, label2 );
    }
    else
    {
      addToEditedRow("EDITED", date, PortalName, whoTo, 0);
      Logger.log("portalEditReviewComp: This entry does not exist in Edited, added it: " + PortalName);
    }
  }
  else if( bodyText.search("decided not to") != -1)
  {
    var rowIndex = findEditedEntry("NULL", PortalName);
    if(rowIndex != -1)
    {
      modifyEditedRow(rowIndex, "REJECTED", date)
      //addToRejectedRow("EDITED", date, PortalName, whoTo);
      var send_str = "";
      if ( googleMapsLink != "" ) {
        send_str = "Portal Edit Rejected - " + PortalName + "\nNew Location: " + googleMapsLink;
      }
      else {
        send_str = "Portal Edit Rejected - " + PortalName + "\New Desc/Title: " + thingChanged;
      }
      portal_photo_link = get_portal_bot_response(PortalName);
      postMessageToDiscord(send_str, portal_photo_link, whoTo);
      move_thread( theThread, label1, label2 );
    }
    else
    {
      addToEditedRow("EDITED", date, PortalName, whoTo, 0);
      //move_thread( theThread, label1, label2 );
      Logger.log("portalEditReviewComp: This entry does not exist in Edited, added it: " + PortalName);
    }
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function photoParser(subjectLine, date, theThread, label1, label2, title, img, whoTo, body)
{
  var PortalName = title;
  var imageArray = img.split("<");
  var newImage = imageArray[0];
  var rowIndex = findPhotoEntry("NULL", PortalName);
  if(rowIndex != -1)
  {
    if ( body.search("we’ve accepted your additional photo submission") > -1)
    {
      modifyPhotoRow(rowIndex, "ACCEPTED", date);
      postMessageToDiscord("Portal Photo Accepted - " + PortalName, newImage, whoTo);
      move_thread( theThread, label1, label2 );
    } else {
      modifyPhotoRow(rowIndex, "REJECTED", date);
      postMessageToDiscord("Portal Photo Rejected - " + PortalName, newImage, whoTo);
      move_thread( theThread, label1, label2 );
    }
  }
  else
  {
    move_thread( theThread, label1, label2 );
    Logger.log("photoParser: This entry exists: " + PortalName );
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function mission_parser(subjectLine, date, theThread, label1, label2, whoTo)
{
  if (subjectLine.search("Ingress Mission Approved") != -1)
  {
    var MissionName = subjectLine.substr(26,60);
    var rowIndex = findMissionsEntry("NULL", MissionName);
    if(rowIndex == -1)
    {
      modifyMissionsRow(rowIndex, "APPROVED", date);
      //addToAcceptedRow("MISSION APPROVED", date, MissionName, whoTo);
      postMessageToDiscord("Mission Approved - " + MissionName, "None", whoTo);
      move_thread( theThread, label1, label2 );
    }
    else
    {
      move_thread( theThread, label1, label2 );
      Logger.log("mission_parser: This entry exists! " + MissionName);
    }
  }
  else if(subjectLine.search("Ingress Mission Submission Received") != -1)
  {
    var MissionName = subjectLine.substr(36,60);
    var rowIndex = findMissionsEntry("NULL", MissionName);
    if(rowIndex == -1)
    {
      addToMissionsRow("MISSION SUBMITTED", date, MissionName, whoTo);
      postMessageToDiscord("Mission Submitted - " + MissionName, "None", whoTo);
      move_thread( theThread, label1, label2 );
    }
    else
    {
      move_thread( theThread, label1, label2 );
      Logger.log("mission_parser: This entry exists!" + MissionName);
    }
  }
  else if (subjectLine.search("Ingress Mission Rejected") != -1)
  {
    var MissionName = subjectLine.substr(25,60);
    var rowIndex = findMissionsEntry("NULL", MissionName);
    if(rowIndex == -1)
    {
      modifyMissionsRow(rowIndex, "REJECTED", date);
      postMessageToDiscord("Mission Rejected - " + MissionName, "None", whoTo);
      move_thread( theThread, label1, label2 );
    }
    else
    {
      move_thread( theThread, label1, label2 );
      Logger.log("mission_parser: This entry exists! " + MissionName);
    }
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function submissionConfParser(bodyText, subjectLine, date, theThread, label1, label2, imgUrl, whoTo)
{
  var PortalName = "";
  if ( bodyText.search("Good work,") != -1)
  {
    PortalName = subjectLine.substr(23,50);
    if(findInRow(date) == -1)
    {              
      addToAcceptedRow("ACCEPTED", date, PortalName, whoTo);
      postMessageToDiscord("Portal __**Accepted!**__ - " + PortalName, imgUrl, whoTo);
      move_thread( theThread, label1, label2 );
    }
    else
    {
      move_thread( theThread, label1, label2 );
      Logger.log("submissionConfParser: This entry exists!" + PortalName);
    }
  }
  else
  {
    PortalName = subjectLine.substr(31,50);
    if(findInRow(date) == -1)
    {
      addToSubmittedRow("SUBMITTED", date, PortalName, whoTo);
      postMessageToDiscord("Portal Submitted - " + PortalName, imgUrl, whoTo);
      move_thread( theThread, label1, label2 );
    }
    else
    {
      move_thread( theThread, label1, label2 );
      Logger.log("submissionConfParser: This entry exists!" + PortalName);
    }
  }
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function addToAcceptedRow(type, date, data, whoTo)
{
  var acceptedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accepted");
  acceptedSS.appendRow([type, date, data, whoTo]);
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function addToSubmittedRow(type, date, data, whoTo)
{
  var submittedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submitted");
  submittedSS.appendRow([type, date, data, whoTo]);
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function addToEditedRow(type, date, data, whoTo, id)
{
  var EditedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Edited");
  EditedSS.appendRow([type, date, data, whoTo, "SUBMITTED", "", "", id]);
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function addToMissionsRow(type, date, data, whoTo)
{
  var MissionsSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Missions");
  MissionsSS.appendRow([type, date, data, whoTo]);
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function addToRejectedRow(type, date, data, whoTo)
{
  var RejectedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Rejected");
  RejectedSS.appendRow([type, date, data, whoTo]);
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function addToInvalidRow(type, date, data, whoTo, status)
{
  var InvalidSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Invalid");
  InvalidSS.appendRow([type, date, data, whoTo, status]);
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function addToPhotoRow(type, date, data, whoTo, status)
{
  var PhotoSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Photo");
  PhotoSS.appendRow([type, date, data, whoTo, status]);
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function modifyPhotoRow(rowIndex, newValue, date)
{
  var PhotoSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Photo");
  PhotoSS.getRange(rowIndex, 5 ).setValue(newValue); 
  // Add the new date for the Accept/reject.
  PhotoSS.getRange(rowIndex, 6 ).setValue(date); 
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function modifyInvalidRow(rowIndex, newValue, date)
{
  var InvalidSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Invalid");
  InvalidSS.getRange(rowIndex, 5 ).setValue(newValue); 
  // Add the new date for the Accept/reject.
  InvalidSS.getRange(rowIndex, 6 ).setValue(date); 
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function modifyEditedRow(rowIndex, newValue, date)
{
  var EditedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Edited");
  EditedSS.getRange(rowIndex, 5 ).setValue(newValue); 
  // Add the new date for the Accept/reject.
  EditedSS.getRange(rowIndex, 6 ).setValue(date); 
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function modifyMissionsRow(rowIndex, newValue, date)
{
  var MissionsSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Missions");
  MissionsSS.getRange(rowIndex, 5 ).setValue(newValue); 
  // Add the new date for the Accept/reject.
  MissionsSS.getRange(rowIndex, 6 ).setValue(date); 
}

/**************************************************************************************
** @brief 
**************************************************************************************/
function getExistingDate( rowIndex )
{
  var submittedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submitted");
  var range = submittedSS.getRange(rowIndex,1); 
  var data = range.getValue();
  return data;
}

/**************************************************************************************
** @brief Move a tread label from notifications to processed
**************************************************************************************/
function move_thread(t, l1, l2) {
  t.removeLabel(l1);
  t.addLabel(l2);
}

/**************************************************************************************
** @brief Search a sheet of rows for data
** @param rows
** @param date
** @param name
**************************************************************************************/
function genericRowSearch(rows, date, name)
{
  var t = rows.length;
  for (var r=0; r<rows.length; r++) { 
    if ( (date != "NULL") && (name != "NULL") ) {
      if ( (rows[r].join("#").indexOf(date) !== -1) && (rows[r].join("#").indexOf(name) !== -1) ) {
        return r+1;
      }
    } else if ( name == "NULL" ){
      if ( rows[r].join("#").indexOf(date) !== -1) {
        return r+1;
      }
    } else {
      if ( rows[r].join("#").indexOf(name) !== -1) {
        return r+1;
      }
    }
  }
  return -1;
}

/**************************************************************************************
** @brief Find a Submitted Entry
** @param date The date of the email
** @param name The Name of the Portal
**************************************************************************************/
function findSubmittedEntry( date, name )
{
  var submittedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submitted");
  var subrange = submittedSS.getDataRange();
  var subrows  = subrange.getValues(); 
  return genericRowSearch(subrows, date, name);
}

/**************************************************************************************
** @brief Find an entry on the Accepted sheet
** @param date The date of the email
** @param name The Name of the Portal
**************************************************************************************/
function findAcceptedEntry( date, name )
{
  var acceptedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accepted");
  var accrange = acceptedSS.getDataRange();
  var accrows  = accrange.getValues(); 
  return genericRowSearch(accrows, date, name);
}

/**************************************************************************************
** @brief Find an entry on the Rejected sheet
** @param date The date of the email
** @param name The Name of the Portal
**************************************************************************************/
function findRejectedEntry( date, name )
{
  var RejectedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Rejected");
  var rejrange = RejectedSS.getDataRange();
  var rejrows  = rejrange.getValues(); 
  return genericRowSearch(rejrows, date, name);
}

/**************************************************************************************
** @brief Find an entry on the Edited sheet
** @param date The date of the email
** @param name The Name of the Portal
**************************************************************************************/
function findEditedEntry( date, name )
{
  var EditedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Edited");
  var edjrange = EditedSS.getDataRange();
  var edjrows  = edjrange.getValues(); 
  return genericRowSearch(edjrows, date, name);
}

/**************************************************************************************
** @brief 
** @param date The date of the email
** @param name The Name of the Portal
**************************************************************************************/
function findInvalidEntry( date, name ){
  var InvalidSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Invalid");
  var injrange = InvalidSS.getDataRange();
  var injrows  = injrange.getValues(); 
  return genericRowSearch(injrows, date, name);
}

/**************************************************************************************
** @brief 
** @param date The date of the email
** @param name The Name of the Portal
**************************************************************************************/
function findMissionsEntry( date, name ){
  var MissionsSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Missions");
  var missrange = MissionsSS.getDataRange();
  var missrows  = missrange.getValues(); 
  return genericRowSearch(missrows, date, name);
}

/**************************************************************************************
** @brief 
** @param date The date of the email
** @param name The Name of the Portal
**************************************************************************************/
function findPhotoEntry( date, name ){
  var PhotoSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Photo");
  var photorange = PhotoSS.getDataRange();
  var photorows  = photorange.getValues(); 
  return genericRowSearch(photorows, date, name);
}


/**************************************************************************************
** @brief Find an expected data in any row of the Spreadsheet
** @param data The Data to Find, usually a date.
**************************************************************************************/
function findInRow(data) {
  
  var ret_val = -1;
  
  ret_val = findAcceptedEntry(data, "NULL");
  if ( ret_val !== -1 ) {
    return ret_val;
  }
  ret_val = findSubmittedEntry(data, "NULL");
  if ( ret_val !== -1 ) {
    return ret_val;
  }
  ret_val = findRejectedEntry(data, "NULL");
  if ( ret_val !== -1 ) {
    return ret_val;
  }
  ret_val = findEditedEntry(data, "NULL");
  if ( ret_val !== -1 ) {
    return ret_val;
  }
  ret_val = findInvalidEntry(data, "NULL");
  if ( ret_val !== -1 ) {
    return ret_val;
  }
  return ret_val;
}

/**************************************************************************************
** @brief Post a Message to Discord
** @param message The text to post
** @param imgUrl If we have one, the imageURL to post
** @param whoTo The useremail that was found in the email being processed
**************************************************************************************/
function postMessageToDiscord(message, imgUrl, whoTo) {
  
  message = message || "Hello World!";
  
  message = message + "\n__Created by__: " + getUserNameFromEmail(whoTo);
  
  var discordUrl = getDiscordUrl();
  var payload;
  if (imgUrl.search("None") == -1) {
    /* if we find an imgUrl instead of the word None */
    payload = JSON.stringify({content: message,  embeds : [{image: {url: imgUrl}}]});
  } else {
    payload = JSON.stringify({content: message});
  }
  var params = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "POST",
    payload: payload,
    muteHttpExceptions: false
  };
  Logger.log("Discord: " + payload);
  var response = UrlFetchApp.fetch(discordUrl, params);

  Logger.log(response.getAllHeaders());
  Logger.log(response.getContentText());
  Logger.log("Discord Done!")
  
}

/**************************************************************************************
** @brief Untested - Send a message to a telegram channel
**************************************************************************************/
function postMessageToTelegram(message, imgUrl, whoTo)
{
  message = message || "Hello World!";
  message = message + "\nCreated by: " + getUserNameFromEmail(whoTo);
  var botToken = getTeleBotToken();
  // get your chat ID: curl https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
  var chatId = getTeleChatId();
  var teleUrl =  "https://api.telegram.org/bot" + botToken + "/sendMessage";
  var payload;
  if (imgUrl.search("None") == -1) {
    /* if we find an imgUrl instead of the word None */
    message = message + "\n" + imgUrl;
  }
  payload = JSON.stringify({chat_id: chatId, text: message});
  var params = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "POST",
    payload: payload,
    muteHttpExceptions: false
  };
  Logger.log("Telegram:" + payload);
  var response = UrlFetchApp.fetch(teleUrl, params);

  Logger.log(response.getAllHeaders());
  Logger.log(response.getContentText());
  Logger.log("Telegram Done!"); 
}
/**************************************************************************************
** @brief Eh....
**************************************************************************************/
function getRandomResponse(){
  responses = ["YOU SUCK! HAHA!","Try Again!","Game Over Man!", "Uhhhh, what were you thinking? You're such a dumb @$$", "Dude... Not a Portal, EAD."]
  return responses[Math.floor(Math.random()*5)]
}

/**************************************************************************************
** @brief Get the diff of two dates
** @param oldDate
** @param newDate
**************************************************************************************/
function getDifferenceInDates(oldDate, newDate){
  var hd=new Date(oldDate).valueOf();
  var td=new Date(newDate).valueOf();
  var sec=1000;
  var min=60*sec;
  var hour=60*min;
  var day=24*hour;
  var diff=td-hd;
  var days=Math.floor(diff/day);
  var hours=Math.floor(diff%day/hour);
  var minutes=Math.floor(diff%day%hour/min);
  Logger.log('%s days %s hours %s minutes',days,hours,minutes);
}

/**************************************************************************************
** @brief Return a Discord approp name
** @param userEmail
**************************************************************************************/
function getUserNameFromEmail(userEmail)
{
  //if (userEmail.search("something") != -1){
  //  return "someone";
  //} 
  //return "**__Unknown User: " + userEmail + "__**";
  return "**__Unknown__**";
}

function getDiscordUrl()
{
  return "discord-webhookurl";
}

function getTeleBotToken()
{
  return "a-bot-token";
}
function getTeleChatId()
{
  // get your chat ID: curl https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
  return "achatid";
}