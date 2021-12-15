function process_wayfarer_emails() {
  var label = GmailApp.getUserLabelByName("Ingress-Notifications");
  var doneLabel = GmailApp.getUserLabelByName("Ingress-Processed");

  var threads = label.getThreads(0, 30);
  if (threads.length != 0)
  {
    for (var i=0; i<threads.length; i++)
    {
      var message_thread = threads[i];
      var messages = threads[i].getMessages();
      Logger.log("Running parser for : " + messages.length + " messages, max 30 messages");
      for (var j=0; j<messages.length; j++)
      {        
        var msg = messages[j].getPlainBody();
        var test = messages[j].getRawContent();
        var msgHTML = messages[j].getBody();
        var msgHTMLSplit = msgHTML.split("\n");
        var cleanBodyText = msg.replace(/<\/?[^>]+(>|$)/g, "");
        var sub = messages[j].getSubject();
        var dat = messages[j].getDate();
        var whoTo = messages[j].getTo();
        
        Logger.log("Running Parser for : " + whoTo + " on message: " + sub);
        
        if ( sub.search("Fwd:") != -1 )
        {
          break;
        }
        //var v = sub.search("nomination received");
        if( sub.search("nomination received") != -1 )
        {
          /* nomination email from new system */
          process_nomination_email( msgHTMLSplit, whoTo );

        }
        else if ( sub.search("nomination decided") != -1 )
        {
          /* nomination decision email */
          process_descision_email( msgHTMLSplit, whoTo );
        }
        /* Move the Processed Data */
        move_thread( message_thread, label, doneLabel );

      }
    }
  }
}

function process_descision_email( html_data, emailAddr )
{
  var discord_dict = get_blank_discord_dict();
  discord_dict["who"] = emailAddr;
  
  Logger.log(html_data[236]);
  var resulting_text = html_data[240];
  var v = resulting_text.search("Congratulations");
  if (resulting_text.search("Congratulations") != -1)
  {
    discord_dict["result"] = "__Portal Accepted__";
    discord_dict["color"] = 0x57f717;
  } else 
  {
    discord_dict["result"] = "__Portal Denied__";
    discord_dict["color"] = 0xf71717;
  }
  // Title Text
  var result_text = html_data[236].trim().replace(/<[^>]*>/g, "");
  result_text = result_text.replace("Thank you for your Wayspot nomination", '').trim();
  var title_text = result_text.substr(0,result_text.search(" on "));
  var date_str = result_text.substr(result_text.search(" on ")+4,40).replace('!','');
  discord_dict["title"] = title_text;
  discord_dict["desc"] = "Was Submitted on: " + date_str;
  Logger.log(result_text);
  post_wayfarer_email_to_discord(discord_dict);
}

function process_nomination_email( html_data, emailAddr )
{
  var discord_dict = get_blank_discord_dict();
  var images_text = html_data[242];
  var images_split = images_text.split('<');
  var i_split1 = images_split[2].split('=');
  var i_split2 = images_split[5].split('=');
  // "http://lh3.googleusercontent.com/gEEvKxFZUAScWB2aDA7nY03c6Sv41PBwBgKVzjDPExSlrZSO9OvrhcKX2CAz-3eLfYZjcAGi0_108-dKqmyfM9d5sjUB2S6ppj9OSLdDTw alt"
  var sub_photo = i_split1[1].replace(/ alt/g, "");
  var sup_photo = i_split2[1].replace(/ alt/g, "");
  var location_text_0 = html_data[243];
  location_text_0 = location_text_0.replace(/ /g, "");
  location_text_0 = location_text_0.replace('(', "");
  location_text_0 = location_text_0.replace(')', "");
  location_text_0 = location_text_0.replace("<br/> ", "");
  location_text_1 = location_text_0.split("<");
  var location_text = location_text_1[0].split(',');
  // (IIFFFFFF , -IIFFFFFF)
  // THIS ONLY WORKS FOR MY AREA.
  var lat_int = location_text[0].substr(0,2);
  var lat_frac = location_text[0].substr(2);
  var latitude = lat_int + "." + lat_frac
  var lng_int = location_text[1].substr(0,3);
  var lng_frac = location_text[1].substr(3);
  var longitude = lng_int + "." + lng_frac

  var nomination_title = html_data[239].trim().replace("<br/>", "").trim();
  var nomination_desc = html_data[240].replace("<br/>", "").trim();
  discord_dict = {
    "sub_photo" : sub_photo,
    "sup_photo" : sup_photo,
    "location" : "https://intel.ingress.com/?pll=" + latitude + ',' + longitude,
    "title" : nomination_title,
    "desc" : nomination_desc,
    "result" : "__Portal Submitted__ ",
    "who" : emailAddr,
    "color" : 0x124C93
  };
  post_wayfarer_email_to_discord(discord_dict);
}

/**************************************************************************************
** @brief Post a Message to Discord
** @param message The text to post
** @param imgUrl If we have one, the imageURL to post
** @param whoTo The useremail that was found in the email being processed
**************************************************************************************/
function post_wayfarer_email_to_discord( post_dict ) {
  
  Logger.log(post_dict);
  message = ""; //post_dict["result"] + "\n__Description:__ " + post_dict["desc"] + "\n__Created by__: " + getUserNameFromEmail(post_dict["who"]);
  var discordUrl = getDiscordUrl();
  var payload;

  var url = "Not Provided";
  if (post_dict["location"] != "None")
  {
    url = post_dict["location"]
  }
  if (post_dict["sub_photo"].search("None") == -1) {
    // if we find an imgUrl instead of the word None
    payload = JSON.stringify(
      {
        content : message,
        embeds:[
          {
            type: "rich",
            title: "**" + post_dict["result"] + "**",
            description: "",
            color: post_dict["color"],
            fields: [
              {
                name: "**" + post_dict["title"] + "**",
                value: post_dict["desc"],
                inline: true
              },
              {
                name: "**Submitted By**",
                value : getUserNameFromEmail(post_dict["who"]),
                inline : true
              },
              {
                name: "**Location**",
                value: url,
                inline: true
              }
            ],
            image: {
              url: post_dict["sub_photo"]
            },
            thumbnail: {
              url: post_dict["sup_photo"]
            }
          }
        ]});
  } else {
    payload = JSON.stringify(
      {
        content : message,
        embeds:[
          {
            type: "rich",
            title: "**" + post_dict["result"] + "**",
            description: "",
            color: post_dict["color"],
            fields: [
              {
                name: "**" + post_dict["title"] + "**",
                value: post_dict["desc"],
                inline: true
              },
              {
                name: "**Submitted By**",
                value : getUserNameFromEmail(post_dict["who"]),
                inline : true
              }
            ]
          }
        ]});
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
  Logger.log("Discord: Done!")
}

function get_blank_discord_dict()
{
  var discord_dict = {
    "sub_photo" : "None",
    "sup_photo" : "None",
    "location" : "None",
    "title" : "None",
    "desc" : "None",
    "result" : "None",
    "who" : "None",
    "color" : 0x0
  };
  return discord_dict;
}

