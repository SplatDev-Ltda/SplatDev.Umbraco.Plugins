# Umbraco Backup Manager

<!-- screenshot:start -->
<!-- screenshot:end -->
A simple backup tool for Umbraco. Allows backing up files and database directly from the backoffice, when you don't have access to the server.

The solution is organized into major releases + latest minor release.

![basic file structure](https://i.imgur.com/j6BuG6t.png)

The batch file will install the correct version of the Umbraco template, create the solution, the plugin, and the web project for testing

![batch file](https://i.imgur.com/CfXWXQE.png)

![install](https://i.imgur.com/btMXhRr.png)

Once the solution is created, you may open it with Visual Studio and start migrating the code from version 8 to each consecutive version.

![solution](https://i.imgur.com/akIe01V.png)


To make migration easier, migrate the plugin to the latest of each major version.

ex.  
- v9.5.4
- v10.8.3
- v11.5.0
- v12.3.6
- v13.1.0

for questions, please contact Carlos Casalicchio

-----

### Documentation for the plugin

#### Install via nuget

		Install-Package SplatDev.Umbraco.Plugins.Backups

A simple backup tool for Umbraco. Allows backing up files and database directly from the backoffice, when you don't have access to the server.

- Creates a Dashboard to perform backups from the backoffice
	![Imgur](https://i.imgur.com/5wtidnD.png)
	![Imgur](https://i.imgur.com/079jIqN.png)
	![Imgur](https://i.imgur.com/NICZcBV.png)
	![Imgur](https://i.imgur.com/T7dJcie.png)


- It also works when using SQLCE
	![Imgur](https://i.imgur.com/PrjfTv0.png)

##### Specs
- Type: Dashboard
- Value Type: NONE
- Dependencies:
  - System.IO.Compression
  - System.IO.Compression.FileSystem

[Feedback](mailto:feedback@splatdev.com) is appreciated