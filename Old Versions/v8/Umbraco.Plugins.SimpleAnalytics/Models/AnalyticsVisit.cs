using System;

using NPoco;

using Umbraco.Core.Persistence.DatabaseAnnotations;


namespace Umbraco.Plugins.SimpleAnalytics.Models
{
    [TableName(TABLENAME)]
    [PrimaryKey("Id", AutoIncrement = true)]
    public class AnalyticsVisit
    {
        public const string TABLENAME = "SimpleAnalyticsVisits";
        [PrimaryKeyColumn(AutoIncrement = true)]
        public int Id { get; set; }

        [NullSetting(NullSetting = NullSettings.NotNull)]
        public string IPAddress { get; set; }

        public int ContentNodeId { get; set; }

        [SpecialDbType(SpecialDbTypes.NTEXT), NullSetting(NullSetting = NullSettings.Null)]
        public string BrowserInfo { get; set; }

        [NullSetting(NullSetting = NullSettings.Null)]
        public string Resolution { get; set; }

        public DateTime VisitedStarted { get; set; }

        [NullSetting(NullSetting = NullSettings.Null)]
        public DateTime? VisitFinished { get; set; }

        [NullSetting(NullSetting = NullSettings.Null)]
        public string ExitUrl { get; set; }

        [NullSetting(NullSetting = NullSettings.Null)]
        public bool RecurringVisit { get; set; }
    }
}
