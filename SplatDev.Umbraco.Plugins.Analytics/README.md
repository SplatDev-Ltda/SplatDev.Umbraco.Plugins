# Analytics compatibility shim

`SplatDev.Umbraco.Plugins.Analytics` is deprecated. Version 2.1.5 is an empty compatibility package that depends on and installs the renamed GA4 package:

```sh
dotnet add package SplatDev.Umbraco.Plugins.GoogleAnalytics
```

Existing applications can continue to reference this package while migrating. The package is scheduled for NuGet deprecation with `alternatePackage` set to `SplatDev.Umbraco.Plugins.GoogleAnalytics`.
