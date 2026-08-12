using System;
using System.Collections.Generic;

using Umbraco.Plugins.SimpleAnalytics.Models;

namespace Umbraco.Plugins.SimpleAnalytics.Repositories
{
    public interface IAnalyticsRepository
    {
        bool AlreadyVisited(int nodeId, string ip);

        AnalyticsVisit GetCurrentVisit(int nodeId, string ip);

        PagedResults<AnalyticsVisitModel> GetPagedResults(int page = 1, int pageSize = 10, string ipAddress = "");

        int GetRealTimeVisits();

        int GetRecurringVisits();

        IEnumerable<VisitStats> GetResultsBy(string filter);

        KeyValuePair<DateTime, int> GetResultsByDate(DateTime date);

        KeyValuePair<DateTime, int>[] GetResultsXDays(int days);

        int GetTotalVisits();

        int GetVisitCount(int nodeId);

        IEnumerable<AnalyticsVisit> GetVisits(int nodeId);

        List<VisitFilter> GetVisitsByEntryUrl();

        List<VisitFilter> GetVisitsByExitUrl();

        IEnumerable<AnalyticsVisit> GetVisitsByNodeId(int nodeId);

        AnalyticsVisit Insert(AnalyticsVisit visit);

        AnalyticsVisit Update(AnalyticsVisit visit);
    }
}
