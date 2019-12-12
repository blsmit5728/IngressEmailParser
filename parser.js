
function myFunction() {

  var label = GmailApp.getUserLabelByName("Ingress-Notifications");
  var doneLabel = GmailApp.getUserLabelByName("Ingress-Processed");

  var threads = label.getThreads();

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
      //cleanBodyText = cleanBodyText.replace("\n","")
      //cleanBodyText = cleanBodyText.replace("\r","")
      var msgArray = cleanBodyText.split("\n");
      var sub = messages[j].getSubject();
      var PortalName = sub.substr(23,50);
      var dat = messages[j].getDate();
      if ( sub.search("Portal review complete") != -1)
      {
        /* handle a Review complete email */
        portalReviewComplete(cleanBodyText, sub, dat, t, label, doneLabel, imgUrl);
      }
      else if (sub.search("Portal submission confirmation") != -1)
      {
        /* handle a Submission Email */
        submissionConfParser(cleanBodyText, sub, dat, t, label, doneLabel);
      }
      else if (sub.search("Portal edit submission confirmation") != -1)
      {
        /* handle an Edit submission Conf email */ 
        portalEditSubmission(sub, dat, t, label, doneLabel);
      }
      else if (sub.search("Portal Edit Suggestion") != -1)
      {
          /* handle an Edit submission Conf email */ 
        portalEditSubmission(msgHTMLSplit[108], dat, t, label, doneLabel);
      }
      else if (sub.search("Portal edit review complete") != -1)
      {
        portalEditReviewComp(msgHTMLSplit[108], msgHTMLSplit[111], dat, t, label, doneLabel);
      }
      else if (sub.search("Portal photo review complete") != -1)
      {
        photoParser(sub, dat, t, label, doneLabel);
      }
      else if (sub.search("Mission") != -1)
      {
        mission_parser(sub, dat, t, label, doneLabel);
      }
      
    }
  }
}

function portalReviewComplete(bodyText, subjectStr, date, theThread, label1, label2, imgUrl)
{
  var PortalName = subjectStr.substr(23,50);
  if ( (bodyText.search("rejected") == -1) && (bodyText.search("rejection") == -1) )
  {
    if ( bodyText.search("too close") == -1)
    {
      if(findInRow(date) == -1)
      {        
        addToAcceptedRow("ACCEPTED", date, PortalName);
        postMessageToDiscord("Portal __**Accepted!**__ - " + PortalName, imgUrl);
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
        addToRejectedRow("NOT ACCEPTED", date,PortalName);
        postMessageToDiscord("Portal __**Rejected!**__ Too Close or Duplicate - " + PortalName, "None");
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
        addToRejectedRow("REJECTED", date,PortalName);
        postMessageToDiscord("Portal __**Rejected!**__ " + getRandomResponse() + " - " + PortalName, "None");
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

function portalEditSubmission(subjectLine, date, theThread, label1, label2)
{
  var PortalName = subjectLine;
  if(findInRow(date) == -1)
  {
    addToEditedRow("EDITED", date, PortalName);
    postMessageToDiscord("Portal Edit Submitted - " + PortalName, "None");
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


function portalEditReviewComp(Name,bodyText, date, theThread, label1, label2)
{
  var PortalName = Name;
  console.log(PortalName);
  if ( bodyText.search("and we have implemented") != -1)
  {
    if(findInRow(date) == -1)
    {
      addToAcceptedRow("EDITED", date, PortalName);
      postMessageToDiscord("Portal Edit Accepted - " + PortalName, "None");
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
  else if( bodyText.search("decided not to make") != -1)
  {
    if(findInRow(date) == -1)
    {
      addToRejectedRow("EDITED", date, PortalName);
      postMessageToDiscord("Portal Edit Rejected - " + PortalName, "None");
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

function photoParser(subjectLine, date, theThread, label1, label2)
{
  var PortalName = subjectLine.substr(30,68);
  if(findInRow(dat) == -1)
  {
    addToAcceptedRow("PHOTO", date, PortalName);
    postMessageToDiscord("Portal Photo Reviewed - " + PortalName, "None");
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

function mission_parser(subjectLine, date, theThread, label1, label2)
{
  if (subjectLine.search("Ingress Mission Approved") != -1)
  {
    var MissionName = subjectLine.substr(26,60);
    if(findInRow(date) == -1)
    {
      addToAcceptedRow("MISSION APPROVED", date, MissionName);
      postMessageToDiscord("Mission Approved - " + MissionName, "None");
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
      addToSubmittedRow("MISSION SUBMITTED", date, MissionName);
      postMessageToDiscord("Mission Submitted - " + MissionName, "None");
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
      addToSubmittedRow("MISSION REJECTED", date, MissionName);
      postMessageToDiscord("Mission Rejected - " + MissionName, "None");
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

function submissionConfParser(bodyText, subjectLine, date, theThread, label1, label2)
{
  if ( bodyText.search("Good work,") != -1)
  {
    var PortalName = subjectLine.substr(23,50);
    if(findInRow(date) == -1)
    {              
      addToAcceptedRow("ACCEPTED", date, PortalName);
      postMessageToDiscord("Portal __**Accepted!**__ - " + PortalName, "None");
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
      addToSubmittedRow("SUBMITTED", date, PortalName);
      postMessageToDiscord("Portal Submitted - " + PortalName, "None");
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

function addToAcceptedRow(type, date, data)
{
  var acceptedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accepted");
  acceptedSS.appendRow([type, date, data, Session.getActiveUser().getEmail()]);
}
function addToSubmittedRow(type, date, data)
{
  var submittedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submitted");
  submittedSS.appendRow([type, date, data, Session.getActiveUser().getEmail()]);
}
function addToEditedRow(type, date, data)
{
  var EditedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Edited");
  EditedSS.appendRow([type, date, data, Session.getActiveUser().getEmail()]);
}
function addToRejectedRow(type, date, data)
{
  var RejectedSS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Rejected");
  RejectedSS.appendRow([type, date, data, Session.getActiveUser().getEmail()]);
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
  if (userEmail.search("A") != -1){
    return "A";
  } else if (userEmail.search("B") != -1) {
    return "B";
  } else if (userEmail.search("C") != -1) {
    return "C";
  } else {
    return "**__Unknown User: " + userEmail + "__**";
  }
}
    

function postMessageToDiscord(message, imgUrl) {

  message = message || "Hello World!";
  
  var runningUserEmail = Session.getActiveUser().getEmail();
  
  message = message + "\n__Created by__: " + getUserNameFromEmail(runningUserEmail);
  
  var discordUrl = 'https://discordapp.com/api/webhooks/<webhook-token>';
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
  responses = ["YOU SUCK! HAHA!","Try Again!","Game Over Man!", "Uhhhh, what were you thinking? You're such a dumb @$$", "Dude... Not a Portal, EAD."]
  return responses[Math.floor(Math.random()*5)]
}

