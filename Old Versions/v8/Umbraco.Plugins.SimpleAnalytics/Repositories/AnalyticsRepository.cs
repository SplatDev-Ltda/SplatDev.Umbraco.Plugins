using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Web;

using Newtonsoft.Json;

using Umbraco.Core.Scoping;
using Umbraco.Plugins.SimpleAnalytics.Extensions;
using Umbraco.Plugins.SimpleAnalytics.Models;
using Umbraco.Web;

namespace Umbraco.Plugins.SimpleAnalytics.Repositories
{
    public class AnalyticsRepository : IAnalyticsRepository
    {
        private readonly IScopeProvider _scopeProvider;
        private readonly HttpContextBase _context;
        private readonly UmbracoHelper _umbracoHelper;
        private const string IP_DATABASE = "IP2LOCATION-LITE-DB11.BIN";
        private const string PLUGIN_PATH = "~/App_Plugins/SimpleAnalytics/Dashboard";
        public AnalyticsRepository(IScopeProvider scopeProvider, HttpContextBase context, UmbracoHelper umbracoHelper)
        {
            _scopeProvider = scopeProvider;
            _context = context;
            _umbracoHelper = umbracoHelper;
        }

        public bool AlreadyVisited(int nodeId, string ip)
        {
            using (var scope = _scopeProvider.CreateScope())
            {
                var results = scope.Database.ExecuteScalar<int>(string.Format("SELECT COUNT([IPAddress]) FROM " + AnalyticsVisit.TABLENAME + " WHERE [ContentNodeId] = {0} AND [IPAddress] = \'{1}\'", nodeId, ip)) > 0;

                return results;
            }
        }

        public AnalyticsVisit GetCurrentVisit(int nodeId, string ip)
        {
            string sql = string.Format("SELECT * FROM [" + AnalyticsVisit.TABLENAME + "] WHERE [ContentNodeId] = {0} AND [IPAddress] = \'{1}\' AND [VisitFinished] IS NULL", nodeId, ip);
            using (var scope = _scopeProvider.CreateScope())
            {
                var results = scope.Database.Query<AnalyticsVisit>(sql).FirstOrDefault();

                return results;
            }
        }

        public PagedResults<AnalyticsVisitModel> GetPagedResults(int page = 1, int pageSize = 10, string ipAddress = "")
        {
            List<AnalyticsVisit> results = new List<AnalyticsVisit>();
            PagedResults<AnalyticsVisitModel> pagedResults = new PagedResults<AnalyticsVisitModel>();
            int count = 0;
            var serverPath = _context.Server.MapPath(PLUGIN_PATH);
            var path = Path.Combine(serverPath, IP_DATABASE);
            using (var scope = _scopeProvider.CreateScope())
            {
                var db = scope.Database;
                string sqlBase = string.Format("SELECT * FROM {0}", AnalyticsVisit.TABLENAME);
                string sqlBaseCount = string.Format("SELECT COUNT(*) FROM {0}", AnalyticsVisit.TABLENAME);

                if (!string.IsNullOrEmpty(ipAddress))
                {
                    var sqlWhere = " WHERE 1 = 1";
                    var sqlIp = !string.IsNullOrEmpty(ipAddress) ? " AND [IPAddress] = '" + ipAddress + "'" : "";
                    sqlBase += sqlWhere + sqlIp;
                    sqlBaseCount += sqlWhere + sqlIp;
                }
                count = db.ExecuteScalar<int>(sqlBaseCount);
                string sql = sqlBase + string.Format(" ORDER BY Id OFFSET({0}) ROWS FETCH NEXT({1}) ROWS ONLY", (page - 1) * pageSize, pageSize);
                results = db.Query<AnalyticsVisit>(sql).ToList();

            }
            foreach (var result in results)
            {
                var node = _umbracoHelper.Content(result.ContentNodeId);
                var info = new AnalyticsVisitModel
                {
                    Browser = JsonConvert.DeserializeObject<BrowserInfo>(result.BrowserInfo),
                    BrowserInfo = result.BrowserInfo,
                    ExitUrl = result.ExitUrl,
                    Id = result.Id,
                    IPAddress = result.IPAddress,
                    IPMapping = Ip2LocationExtensions.GetIpMapping(result.IPAddress, path),
                    ContentNodeId = result.ContentNodeId,
                    NodeName = node.Name,
                    EntryUrl = node.Url(),
                    RecurringVisit = result.RecurringVisit,
                    Resolution = result.Resolution,
                    VisitedStarted = result.VisitedStarted,
                    VisitFinished = result.VisitFinished,
                    TotalVisits = count,
                    VisitLength = result.VisitedStarted != null && result.VisitFinished != null ? (result.VisitFinished - result.VisitedStarted).Value.ToString(@"hh\:mm\:ss") : "",
                    UserAgent = BrowserExtensions.GetBrowserInfo(result.BrowserInfo),
                };

                if (info.Browser != null)
                {
                    info.Browser.LanguageName = !string.IsNullOrEmpty(info.Browser.Language) ? new CultureInfo(info.Browser.Language).DisplayName : "";
                    info.Browser.LanguageFlag = !string.IsNullOrEmpty(info.Browser.Language) ? info.Browser.Language.Substring(3) + ".png" : "";
                    info.Browser.OS = BrowserExtensions.ParseOS(info.UserAgent.Platform);
                }

                pagedResults.Results.Add(info);
                pagedResults.Found = count;
                pagedResults.PageNumber = page;
                pagedResults.PageSize = pageSize;
                pagedResults.Query = ipAddress;
            }

            return pagedResults;
        }

        public int GetRealTimeVisits()
        {
            string sqlBaseCount = string.Format("SELECT COUNT(*) AS COUNT FROM {0} WHERE RecurringVisit = 'FALSE'", AnalyticsVisit.TABLENAME);
            int results = 0;
            using (var scope = _scopeProvider.CreateScope())
            {

                results = scope.Database.ExecuteScalar<int>(sqlBaseCount);

            }

            return results;
        }

        public int GetRecurringVisits()
        {
            string sqlBaseCount = string.Format("SELECT COUNT(*) AS COUNT FROM {0} WHERE RecurringVisit = 'TRUE'", AnalyticsVisit.TABLENAME);
            using (var scope = _scopeProvider.CreateScope())
            {

                var results = scope.Database.ExecuteScalar<int>(sqlBaseCount);

                return results;
            }
        }

        public IEnumerable<VisitStats> GetResultsBy(string filter)
        {
            var serverPath = _context.Server.MapPath(PLUGIN_PATH);
            var path = Path.Combine(serverPath, IP_DATABASE);
            string sqlBaseCount = string.Format("SELECT IPAddress, \'{1}\' AS FILTER, COUNT(*) AS COUNT FROM {0} GROUP BY [IPAddress]", AnalyticsVisit.TABLENAME, filter);
            using (var scope = _scopeProvider.CreateScope())
            {

                //scope.Database = ApplicationContext.scope.DatabaseContext.Database;

                var results = scope.Database.Query<VisitStats>(sqlBaseCount).ToList();
                var list = new List<VisitStats>();
                foreach (var result in results)
                {
                    var visitStats = new VisitStats
                    {
                        Mapping = Ip2LocationExtensions.GetIpMapping(result.IPAddress, path),
                        Count = result.Count,
                        Filter = result.Filter,
                        IPAddress = result.IPAddress
                    };
                    list.Add(visitStats);
                }

                return list.Where(x => x.Filter == filter);
            }
        }

        public KeyValuePair<DateTime, int> GetResultsByDate(DateTime date)
        {
            string sqlBaseCount = string.Format("SELECT COUNT(*) FROM {0} WHERE VisitedStarted BETWEEN '{1} 00:00:00' and '{1} 23:59:59'", AnalyticsVisit.TABLENAME, date.Date.ToString("yyyy-MM-dd"));
            int results = 0;
            using (var scope = _scopeProvider.CreateScope())
            {

                results = scope.Database.ExecuteScalar<int>(sqlBaseCount);

            }

            return new KeyValuePair<DateTime, int>(date, results);
        }

        public KeyValuePair<DateTime, int>[] GetResultsXDays(int days)
        {
            var startDay = DateTime.Now.AddDays(-(days)).Date;
            var currDay = startDay;
            KeyValuePair<DateTime, int>[] results = new KeyValuePair<DateTime, int>[days];
            for (int i = 0; i < days; i++)
            {
                results[i] = GetResultsByDate(currDay);
                currDay = currDay.AddDays(1);
            }
            return results;
        }

        public int GetTotalVisits()
        {
            string sqlBaseCount = string.Format("SELECT COUNT(*) FROM {0}", AnalyticsVisit.TABLENAME);
            int results = 0;
            using (var scope = _scopeProvider.CreateScope())
            {

                results = scope.Database.ExecuteScalar<int>(sqlBaseCount);
            }

            return results;
        }

        public int GetVisitCount(int nodeId)
        {
            int results = 0;
            using (var scope = _scopeProvider.CreateScope())
            {

                results = GetVisitsByNodeId(nodeId).Count();

            }

            return results;
        }

        public IEnumerable<AnalyticsVisit> GetVisits(int nodeId)
        {
            var results = Enumerable.Empty<AnalyticsVisit>();
            using (var scope = _scopeProvider.CreateScope())
            {

                results = GetVisitsByNodeId(nodeId);

            }
            return results;
        }

        public List<VisitFilter> GetVisitsByEntryUrl()
        {
            string sqlEntryUrl = string.Format("SELECT [ContentNodeId] AS Filter, COUNT(*) AS COUNT FROM {0} GROUP BY [ContentNodeId]", AnalyticsVisit.TABLENAME);
            List<VisitFilter> results = new List<VisitFilter>();
            using (var scope = _scopeProvider.CreateScope())
            {

                results = scope.Database.Query<VisitFilter>(sqlEntryUrl).ToList();

            }

            var list = new List<VisitFilter>();
            foreach (var result in results)
            {
                var entryNode = _umbracoHelper.Content(result.Filter);
                var visitStats = new VisitFilter
                {
                    Count = result.Count,
                    Filter = entryNode.Url()
                };
                list.Add(visitStats);
            }
            return list;
        }

        public List<VisitFilter> GetVisitsByExitUrl()
        {
            string sqlExitUrl = string.Format("SELECT [ExitUrl] AS Filter, COUNT(*) AS COUNT FROM {0} WHERE [ExitUrl] <> '' GROUP BY [ExitUrl]", AnalyticsVisit.TABLENAME);
            List<VisitFilter> results = new List<VisitFilter>();

            using (var scope = _scopeProvider.CreateScope())
            {

                results = scope.Database.Query<VisitFilter>(sqlExitUrl).ToList();

            }

            var list = new List<VisitFilter>();
            foreach (var result in results)
            {
                var visitStats = new VisitFilter
                {
                    Count = result.Count,
                    Filter = result.Filter
                };
                list.Add(visitStats);
            }
            return list;
        }

        public IEnumerable<AnalyticsVisit> GetVisitsByNodeId(int nodeId)
        {
            var results = Enumerable.Empty<AnalyticsVisit>();
            using (var scope = _scopeProvider.CreateScope())
            {
                results = scope.Database.Query<AnalyticsVisit>($"SELECT * FROM {AnalyticsVisit.TABLENAME} WHERE [ContentNodeId] = @0", nodeId).ToList();
            }

            return results;
        }

        public AnalyticsVisit Insert(AnalyticsVisit visit)
        {
            using (var scope = _scopeProvider.CreateScope())
            {
                var db = scope.Database;
                db.Insert(visit);
                scope.Complete();
                return visit;
            }
        }

        public AnalyticsVisit Update(AnalyticsVisit visit)
        {
            using (var scope = _scopeProvider.CreateScope())
            {
                scope.Database.Update(visit);
                scope.Complete();
                return visit;
            }
        }
    }
}
