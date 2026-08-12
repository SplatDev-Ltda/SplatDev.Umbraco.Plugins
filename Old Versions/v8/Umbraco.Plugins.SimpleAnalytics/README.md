# Simple Analytics

_former visit counter_

##### Umbraco v8.18.8

- Simple analytics to keep track of visits within the site (for page counters and such)

### Simple Analytics Script

- A js script to track the visits of your site, grabs the node Id, the public IP address, and saves it to the database
- Connects to [https://api.ipify.org?format=text](https://api.ipify.org?format=text) to get the public IP address. You are free to change it.
- Uses the Lite version of the IP2Location BIN [https://lite.ip2location.com](https://lite.ip2location.com) to get location information
- Comes with a basic front-end example

### Simple Analytics Dashboard

- Installs a Dashboard to both Content and Settings, to display a summary of the analytics information
- Displays Browser User Agent, Location, IP, and Duration of Visits
- Lists entry and exit Urls
- Basic widgets with useful information

#### Screenshots

![Imgur](https://i.imgur.com/ZkXCWlA.png)
![Imgur](https://i.imgur.com/k5CDLSJ.png)
![Imgur](https://i.imgur.com/k5CDLSJ.png)
![Imgur](https://i.imgur.com/jWLByaN.png)
 
Visit the [Project Page](https://our.umbraco.org/projects/backoffice-extensions/visit-counter/) in the Umbraco Community

Install via Nuget

		Install-Package SplatDev.Umbraco.Plugins.SimpleAnalytics

##### Specs
- Creates a new Table `SympleAnaliticsVisits`
 

[Feedback](mailto:feedback@splatdev.com) is appreciated
