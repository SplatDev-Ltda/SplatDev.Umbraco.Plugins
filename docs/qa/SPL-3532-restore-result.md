## Root cause and fix

The three solution files were consistent: `SplatDev.Publishable.slnf`, `SplatDev.Core.sln`, and `SplatDev.Core.slnx` all reference the existing `SplatDev.Umbraco.Plugins.GoogleAnalytics/SplatDev.Umbraco.Plugins.GoogleAnalytics.csproj`.

The actual restore failure in the shared checkout was:

`SplatDev.Umbraco.Plugins.2fa/SplatDev.Umbraco.Plugins.2fa.csproj(54,2): error MSB4025: The project file could not be loaded. Name cannot begin with the '<' character, hexadecimal value 0x3C. Line 54, position 2.`

That conflict-marker error was in the shared checkout, not the PR worktree. In the PR worktree, solution restore completed successfully. Plugin builds then exposed a remaining shim compiler defect: missing `System`, `System.Collections.Generic`, `System.IO`, and `System.Threading.Tasks` usings in `SplatDev.Umbraco.Plugins.Analytics/Composers/EmbeddedAppPluginsComposer.cs`. Added in commit `d29f6082` and pushed to `feature/SPL-3532-googleanalytics`.

Verification:
- `dotnet restore SplatDev.Core.sln --no-cache`: exit 0 (warnings only)
- GoogleAnalytics Release build (net8/net10): 0 errors
- Analytics 2.1.5 shim Release build (net8/net10): 0 errors
- Existing NuGet vulnerability warnings remain; no solution path/GUID errors observed.

PR: https://github.com/splatdevtech/SplatDev.Umbraco.Plugins/pull/116
