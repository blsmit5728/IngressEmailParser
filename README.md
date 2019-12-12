# IngressEmailParser
Parses ingress Prime emails about Portals submissions/approvals/edits.

# Setup
* Create a Spreadsheet in Google Docs with the following Tabs: (use EXACTLY the same name)
  * Submitted
  * Approved
  * Edited
  * Rejected
* Open the Script Editor: **Tools->Script Editor**
* Delete all existing code in the window.
* Paste the contents of parser.js into the window.
* **SET YOUR DISCORD WEBHOOK URL**
* Save the Project as "IngressParser" (without quotes)
* Open GMail
* Create a new label
  * "Ingress-Notifications" (without quotes)
  * "Ingress-Processed" (without quotes)
* Create a filter:
  * from:(ingress-support@nianticlabs.com OR nominations@portals.ingress.com) 
  * Has words: -"Damage Report"
  * apply label: Ingress-Notifications
* (Optional) Mission Support
  * from:(ingress-support@nianticlabs.com) 
  * Has Words: Mission Submission
