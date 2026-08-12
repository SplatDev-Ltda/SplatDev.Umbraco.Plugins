using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

using Newtonsoft.Json;

using Umbraco.Plugins.SimpleAnalytics.Models;
using Umbraco.Plugins.SimpleAnalytics.Repositories;
using Umbraco.Web.Mvc;
using Umbraco.Web.WebApi;

namespace Umbraco.Plugins.SimpleAnalytics.Controllers.Controllers
{
    [PluginController("Analytics")]
    public class AnalyticsApiController : UmbracoApiController
    {
        private readonly IAnalyticsRepository _analyticsRepository;

        public AnalyticsApiController(IAnalyticsRepository analyticsRepository)
        {
            _analyticsRepository = analyticsRepository;
        }

        public int this[int nodeId]
        {
            get { return _analyticsRepository.GetVisitsByNodeId(nodeId).Count(); }
        }

        [HttpGet]
        public AnalyticsVisit GetCurrentVisit(int nodeId, string ip)
        {
            return _analyticsRepository.GetCurrentVisit(nodeId, ip);
        }

        [HttpGet]
        public PagedResults<AnalyticsVisitModel> GetPagedResults(int page = 1, int pageSize = 10, string ipAddress = "")
        {
            return _analyticsRepository.GetPagedResults(page, pageSize, ipAddress);
        }

        [HttpGet]
        public int GetRealTimeVisits()
        {
            return _analyticsRepository.GetRealTimeVisits();
        }

        [HttpGet]
        public int GetRecurringVisits()
        {
            return _analyticsRepository.GetRecurringVisits();
        }

        [HttpGet]
        public IEnumerable<VisitStats> GetResultsBy(string filter)
        {
            return _analyticsRepository.GetResultsBy(filter);
        }

        [HttpGet]
        public KeyValuePair<DateTime, int> GetResultsByDate(DateTime date)
        {
            return _analyticsRepository.GetResultsByDate(date);
        }

        [HttpGet]
        public KeyValuePair<DateTime, int>[] GetResultsXDays(int days)
        {
            return _analyticsRepository.GetResultsXDays(days);
        }

        [HttpGet]
        public int GetTotalVisits()
        {
            return _analyticsRepository.GetTotalVisits();
        }

        [HttpGet]
        public IHttpActionResult GetVisitCount(int nodeId)
        {
            var results = _analyticsRepository.GetVisitCount(nodeId);
            return Ok(results);
        }

        [HttpGet]
        public IHttpActionResult GetVisits(int nodeId)
        {
            var results = _analyticsRepository.GetVisits(nodeId);
            return Ok(results);
        }

        [HttpGet]
        public List<VisitFilter> GetVisitsByEntryUrl()
        {
            return _analyticsRepository.GetVisitsByEntryUrl();
        }

        [HttpGet]
        public List<VisitFilter> GetVisitsByExitUrl()
        {
            return _analyticsRepository.GetVisitsByExitUrl();
        }

        [HttpGet]
        public async Task<IHttpActionResult> LogVisit(string jsonData)
        {
            var thisVisit = JsonConvert.DeserializeObject<AnalyticsVisitModel>(jsonData);
            var visit = _analyticsRepository.GetCurrentVisit(thisVisit.ContentNodeId, thisVisit.IPAddress);
            var recurring = _analyticsRepository.AlreadyVisited(thisVisit.ContentNodeId, thisVisit.IPAddress);

            if (visit == null || visit.Id == 0)
            {
                visit = new AnalyticsVisit
                {
                    ContentNodeId = thisVisit.ContentNodeId,
                    IPAddress = thisVisit.IPAddress,
                    BrowserInfo = JsonConvert.SerializeObject(thisVisit.Browser),
                    Resolution = thisVisit.Resolution,
                    VisitedStarted = DateTime.Now,
                    ExitUrl = thisVisit.ExitUrl,
                    RecurringVisit = recurring
                };
                if (!string.IsNullOrEmpty(visit.IPAddress) && visit.ContentNodeId > 0 && visit.VisitedStarted > DateTime.MinValue)
                    _analyticsRepository.Insert(visit);
            }
            else
            {
                if (!string.IsNullOrEmpty(thisVisit.ExitUrl))
                {
                    visit.ExitUrl = thisVisit.ExitUrl;
                    visit.VisitFinished = DateTime.Now;
                    _analyticsRepository.Update(visit);
                }
            }
            await Task.FromResult(0);
            return Ok(visit);
        }
    }


}
