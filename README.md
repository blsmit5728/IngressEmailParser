# IngressEmailParser
Parses ingress Prime emails about Portals submissions/approvals/edits.

# Setup
* Create a Spreadsheet in Google Docs with the following Tabs: (use EXACTLY the same name)
  * Submitted
  * Approved
  * Edited
  * Rejected
![Tabs](Tabs.png)
* Open the Script Editor: **Tools->Script Editor**
* Delete all existing code in the window.
* Paste the contents of parser.js into the window.
* **SET YOUR DISCORD WEBHOOK URL**
![WEBHOOK](webhook.png)
* Setup the username lookup
  * replace the 'A' in the if with something in your email address
  * and the 'A' in the return statment with your name
![USERNAME](username_lookups.png)
* Save the Project as "IngressParser" (without quotes)
* Open GMail
* Create a new label
  * "Ingress-Notifications" (without quotes)
  * "Ingress-Processed" (without quotes)
* Create a filter:
  * from:(ingress-support@nianticlabs.com OR nominations@portals.ingress.com) 
  * Has words: -"Damage Report"
  * apply label: Ingress-Notifications
![Filter1](Filter-Notifications.PNG)  
* (Optional) Mission Support
  * from:(ingress-support@nianticlabs.com) 
  * Has Words: Mission Submission
* Go back the script editor and select the Trigger button
![trigger](trigger_button.png)
* Create a new trigger with the following trigger settings
![TRIGGER_SETTINGS](trigger_settings.png)
* Hit save and an authorization window will appear.
* Sign in with your Google Email
* Hit "Advanced" then "Proceed"
![AUTH](authorize_advanced.png) 
* Then hit "Allow" on the next window.
