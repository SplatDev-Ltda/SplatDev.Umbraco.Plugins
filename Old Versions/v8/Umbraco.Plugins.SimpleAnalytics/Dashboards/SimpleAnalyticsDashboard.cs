using System;

using Umbraco.Core.Composing;
using Umbraco.Core.Dashboards;

namespace Umbraco.Plugins.SimpleAnalytics.Dashboards
{
    [Weight(0)]
    public class SimpleAnalyticsDashboard : IDashboard
    {
        public string Alias => "SimpleAnalyticsDashboard";

        public string[] Sections => new[]
        {
            Constants.Dashboard.Sections.SETTINGS
        };

        public string View => "/App_Plugins/SimpleAnalytics/Dashboard/views/view.html";

        public IAccessRule[] AccessRules => Array.Empty<IAccessRule>();
    }
}