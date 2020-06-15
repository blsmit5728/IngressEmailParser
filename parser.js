
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
          var combined = msgHTMLSplit[123] + msgHTMLSplit[124];
          portalEditSubmission(msgHTMLSplit[108], dat, t, label, doneLabel, msgHTMLSplit[125],combined, whoTo);
        }
        else if (sub.search("Portal edit review complete") != -1)
        {
          var combined = msgHTMLSplit[122] + msgHTMLSplit[123];
          portalEditReviewComp(msgHTMLSplit[108], msgHTMLSplit[111], dat, t, label, doneLabel, whoTo, combined, msgHTMLSplit[124]);
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
          poke_rejection_parser(dat, msgArray[12], msgArray[14], msgHTMLSplit[172].replace(/<\/?[^>]+(>|$)/g, ""), t, label, doneLabel, whoTo);
        }
      }
    }
  }
}

function poke_submission_parser(date, title, desc, img, theThread, label1, label2, whoTo)
{
  var length = img.length;
  var imgUrl = img;
  var t = imgUrl.replace(' ', '');
  if(findInRow(date) == -1)
  { 
    addToSubmittedRow("SUBMITTED", date, title, whoTo);
    postMessageToDiscord("Portal Submitted - " + title, t, whoTo);
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
  }
  else
  {
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
    Logger.log("S: This entry exists!");
  }
}

function poke_approval_parser(date, title, desc, img, theThread, label1, label2, whoTo)
{
  var length = img.length;
  var imgUrl = img;
  var t = imgUrl.replace(' ', '');
  if(findInRow(date) == -1)
  { 
    addToAcceptedRow("APPROVED", date, title, whoTo);
    postMessageToDiscord("Portal __**Accepted!**__ - " + title, t, whoTo);
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
  }
  else
  {
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
    Logger.log("S: This entry exists!");
  }
}

function poke_rejection_parser(date, title, desc, img, theThread, label1, label2, whoTo)
{
  var length = img.length;
  var imgUrl = img;
  var t = imgUrl.replace(' ', '');
  if(findInRow(date) == -1)
  { 
    addToRejectedRow("REJECTED", date, title, whoTo);
    postMessageToDiscord("Portal __**Rejected!**__ - " + title, t, whoTo);
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
  }
  else
  {
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
    Logger.log("S: This entry exists!");
  }
}

function photoSubParser(name, date, theThread, label1, label2, whoTo, img)
{
  var PortalName = name;
  if(findInRow(date) == -1)
  {
    addToSubmittedRow("PHOTO", date, PortalName, whoTo);
    var s = img.indexOf("<");
    var newImg = img.substr(0,s);
    //var t = img.replace(' ', ''); // extra "<br><br> "
    postMessageToDiscord("Portal Photo Submitted - " + PortalName, newImg, whoTo);
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
  }
  else
  {
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
    Logger.log("S: This entry exists!");
  }
}

function invalid_portal_parser(subject, name, bodyText, date, theThread, label1, label2, whoTo)
{
  var PortalName = name;
  if(subject.search("reviewed") != -1)
  {
    if( bodyText.search("remain") != -1)
    {
      if(findInRow(date) == -1)
      {        
        addToRejectedRow("INVALID", date, PortalName, whoTo);
        postMessageToDiscord("Invalid Portal __**Rejected**__ - " + PortalName, "None", whoTo);
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
      }
      else
      {
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
      }
    }
    else
    {
      if(findInRow(date) == -1)
      {        
        addToAcceptedRow("INVALID", date, PortalName, whoTo);
        postMessageToDiscord("Invalid Portal __**Accepted**__ - " + PortalName, "None", whoTo);
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
      }
      else
      {
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
      }
    }
  }
  else
  {
    // submitted
    if(findInRow(date) == -1)
      {        
        addToSubmittedRow("INVALID", date, PortalName, whoTo);
        postMessageToDiscord("Invalid Portal Submitted - " + PortalName, "None", whoTo);
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
      }
      else
      {
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
        Logger.log("A: This entry exists!");
      }
  }
}

function portalReviewComplete(bodyText, subjectStr, date, theThread, label1, label2, imgUrl, whoTo, rejectReason, rejectImgUrl)
{
  var PortalName = subjectStr.substr(23,50);
  if ( (bodyText.search("rejected") == -1) && (bodyText.search("rejection") == -1) )
  {
    if ( bodyText.search("too close") == -1)
    {
      if(findInRow(date) == -1)
      {        
        addToAcceptedRow("ACCEPTED", date, PortalName, whoTo);
        postMessageToDiscord("Portal __**Accepted!**__ - " + PortalName, imgUrl, whoTo);
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
      }
      else
      {
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
        Logger.log("A: This entry exists!");
      }
    }
    else
    {
      if(findInRow(date) == -1)
      {
        addToRejectedRow("NOT ACCEPTED", date,PortalName, whoTo);
        postMessageToDiscord("Portal __**Rejected!**__ Too Close or Duplicate - " + PortalName, "None", whoTo);
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
      }
      else
      {
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
        Logger.log("A: This entry exists!");
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
        theThread.removeLabel(label1);
        theThread.addLabel(label2);
      }
    }
    else
    {
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
      Logger.log("R: This entry exists!");
    }
  }
}

function portalEditSubmission(subjectLine, date, theThread, label1, label2, locationString, newDesc, whoTo)
{
  var PortalName = subjectLine;
  var discordStr = "";
  var paren = locationString.indexOf(")"); 
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
    discordStr = "Portal Edit Submitted - " + PortalName + "\nNew Location: " + googleMapsLink + "\nIntel Link: " + intelLink;
  } else {
    discordStr = "Portal Edit Submitted - " + PortalName + "\nNew Desc/Title: " + newDesc;
  }
  
  
  if(findInRow(date) == -1)
  {
    addToEditedRow("EDITED", date, PortalName, whoTo);
    postMessageToDiscord(discordStr, "None", whoTo);
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
  }
  else
  {
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
    Logger.log("S: This entry exists!");
  }
}


function portalEditReviewComp(Name,bodyText, date, theThread, label1, label2, whoTo, thingChanged, locationStr)
{
  var PortalName = Name;
  console.log(PortalName);
  var paren = locationStr.indexOf(")"); 
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
    if(findInRow(date) == -1)
    {
      addToAcceptedRow("EDITED", date, PortalName, whoTo);
      var send_str = "";
      if ( googleMapsLink != "" ) {
        send_str = "Portal Edit Accepted - " + PortalName + "\nNew Location: " + googleMapsLink + "\nIntel Link: " + intelLink;
      }
      else {
        send_str = "Portal Edit Accepted - " + PortalName + "\New Desc/Title: " + thingChanged;
      }
      postMessageToDiscord(send_str, "None", whoTo);
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
    }
    else
    {
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
      Logger.log("S: This entry exists!");
    }
  }
  else if( bodyText.search("decided not to") != -1)
  {
    if(findInRow(date) == -1)
    {
      addToRejectedRow("EDITED", date, PortalName, whoTo);
      var send_str = "";
      if ( googleMapsLink != "" ) {
        send_str = "Portal Edit Rejected - " + PortalName + "\nNew Location: " + googleMapsLink;
      }
      else {
        send_str = "Portal Edit Rejected - " + PortalName + "\New Desc/Title: " + thingChanged;
      }
      postMessageToDiscord(send_str, "None", whoTo);
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
    }
    else
    {
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
      Logger.log("S: This entry exists!");
    }
  }
}

function photoParser(subjectLine, date, theThread, label1, label2, title, img, whoTo, body)
{
  var PortalName = title;
  var imageArray = img.split("<");
  var newImage = imageArray[0];
  if(findInRow(date) == -1)
  {
    if ( body.search("we’ve accepted your additional photo submission") > -1)
    {
      addToAcceptedRow("PHOTO", date, PortalName, whoTo);
      postMessageToDiscord("Portal Photo Accepted - " + PortalName, newImage, whoTo);
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
    } else {
      addToRejectedRow("PHOTO", date, PortalName, whoTo);
      postMessageToDiscord("Portal Photo Rejected - " + PortalName, newImage, whoTo);
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
    }
  }
  else
  {
    theThread.removeLabel(label1);
    theThread.addLabel(label2);
    Logger.log("S: This entry exists!");
  }
}

function mission_parser(subjectLine, date, theThread, label1, label2, whoTo)
{
  if (subjectLine.search("Ingress Mission Approved") != -1)
  {
    var MissionName = subjectLine.substr(26,60);
    if(findInRow(date) == -1)
    {
      addToAcceptedRow("MISSION APPROVED", date, MissionName, whoTo);
      postMessageToDiscord("Mission Approved - " + MissionName, "None", whoTo);
    }
    else
    {
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
      Logger.log("S: This entry exists!");
    }
  }
  else if(subjectLine.search("Ingress Mission Submission Received") != -1)
  {
    var MissionName = subjectLine.substr(36,60);
    if(findInRow(date) == -1)
    {
      addToSubmittedRow("MISSION SUBMITTED", date, MissionName, whoTo);
      postMessageToDiscord("Mission Submitted - " + MissionName, "None", whoTo);
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
    }
    else
    {
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
      Logger.log("S: This entry exists!");
    }
  }
  else if (subjectLine.search("Ingress Mission Rejected") != -1)
  {
    var MissionName = subjectLine.substr(25,60);
    if(findInRow(date) == -1)
    {
      addToSubmittedRow("MISSION REJECTED", date, MissionName, whoTo);
      postMessageToDiscord("Mission Rejected - " + MissionName, "None", whoTo);
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
    }
    else
    {
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
      Logger.log("S: This entry exists!");
    }
  }
}

function submissionConfParser(bodyText, subjectLine, date, theThread, label1, label2, imgUrl, whoTo)
{
  if ( bodyText.search("Good work,") != -1)
  {
    var PortalName = subjectLine.substr(23,50);
    if(findInRow(date) == -1)
    {              
      addToAcceptedRow("ACCEPTED", date, PortalName, whoTo);
      postMessageToDiscord("Portal __**Accepted!**__ - " + PortalName, imgUrl, whoTo);
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
    }
    else
    {
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
      Logger.log("A: This entry exists!");
    }
  }
  else
  {
    PortalName = subjectLine.substr(31,50);
    if(findInRow(date) == -1)
    {
      addToSubmittedRow("SUBMITTED", date, PortalName, whoTo);
      postMessageToDiscord("Portal Submitted - " + PortalName, imgUrl, whoTo);
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
    }
    else
    {
      theThread.removeLabel(label1);
      theThread.addLabel(label2);
      Logger.log("S: This entry exists!");
    }
  }
}

function addToAcceptedRow(type, date, data, whoTo)
{
  var acceptedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accepted");
  acceptedSS.appendRow([type, date, data, whoTo]);
}
function addToSubmittedRow(type, date, data, whoTo)
{
  var submittedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submitted");
  submittedSS.appendRow([type, date, data, whoTo]);
}
function addToEditedRow(type, date, data, whoTo)
{
  var EditedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Edited");
  EditedSS.appendRow([type, date, data, whoTo]);
}
function addToRejectedRow(type, date, data, whoTo)
{
  var RejectedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Rejected");
  RejectedSS.appendRow([type, date, data, whoTo]);
}

function move_thread(t) {
  t.removeLabel("Ingress-Notifications");
  t.addLabel("Ingress-Processed");
}

function findInRow(data) {
  var acceptedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accepted");
  var submittedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submitted");
  var RejectedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Rejected");
  var EditedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Edited");
  
  var accrange = acceptedSS.getDataRange();
  var accrows  = accrange.getValues(); 
  
  for (var r=0; r<accrows.length; r++) { 
    if ( accrows[r].join("#").indexOf(data) !== -1 ) {
      return r+1;
    }
  }
  var subrange = submittedSS.getDataRange();
  var subrows  = subrange.getValues(); 
  
  for (var r=0; r<subrows.length; r++) { 
    if ( subrows[r].join("#").indexOf(data) !== -1 ) {
      return r+1;
    }
  }
  var rejrange = RejectedSS.getDataRange();
  var rejrows  = rejrange.getValues(); 
  
  for (var r=0; r<rejrows.length; r++) { 
    if ( rejrows[r].join("#").indexOf(data) !== -1 ) {
      return r+1;
    }
  }
  
  var edjrange = EditedSS.getDataRange();
  var edjrows  = edjrange.getValues(); 
  
  for (var r=0; r<edjrows.length; r++) { 
    if ( edjrows[r].join("#").indexOf(data) !== -1 ) {
      return r+1;
    }
  }
  
  return -1;
    
}

function getUserNameFromEmail(userEmail)
{
  if (userEmail.search("SOMEUSEREMAILNAME") != -1){
    return "**A USER I KNOW!**";
  } 
  //return "**__Unknown User: " + userEmail + "__**";
  return "**__Unknown__**";
}
    

function postMessageToDiscord(message, imgUrl, whoTo) {

  message = message || "Hello World!";
  
  message = message + "\n__Created by__: " + getUserNameFromEmail(whoTo);
  
  var discordUrl = 'MY_DISCORD_WEBHOOK_URL';
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
  console.log(params)
  var response = UrlFetchApp.fetch(discordUrl, params);

  console.log(response.getAllHeaders());
  console.log(response.getContentText());
}


function getRandomResponse(){
  responses = ["YOU SUCK! HAHA!",
               "Try Again!",
               "Game Over Man!", 
               "Uhhhh, what were you thinking? You're such a dumb @$$", 
               "Dude... Not a Portal, EAD."]
  return responses[Math.floor(Math.random()*5)]
}

