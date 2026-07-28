namespace SplatDev.Security
{
    using Google.Apis.Safebrowsing.v4.Data;

    using System.Text.Json;
    using System.Text.Json.Serialization;

    using RestSharp;

    using SplatDev.UrlShortening.Models;

    using System;
    using System.Linq;
    using System.Net.Http;
    using System.Security.Cryptography;
    using System.Text;
    using System.Text.RegularExpressions;
    using System.Threading;
    using System.Threading.Tasks;

    public static class Tools
    {
        private static readonly JsonSerializerOptions _jsonDeserializeOptions = new()
        {
            PropertyNameCaseInsensitive = true,
        };

        private static readonly Regex _regex = new Regex("[^a-zA-Z0-9]");

        private static RestClient CreateRestClient(string baseUrl, HttpMessageHandler? handler = null)
        {
            if (handler != null)
            {
                var httpClient = new HttpClient(handler);
                return new RestClient(httpClient, new RestClientOptions(baseUrl));
            }
            return new RestClient(baseUrl);
        }

        /// <summary>
        /// Checks the phish.
        /// </summary>
        /// <param name="apiKey">The API key.</param>
        /// <param name="url">The URL.</param>
        /// <param name="insights">if set to <c>true</c> [insights].</param>
        /// <returns></returns>
        public static async Task<CheckPhishResponse> CheckPhish(string apiKey, string url, bool insights = false, HttpMessageHandler? handler = null)
        {
            var client = CreateRestClient(Constants.CHECK_PHISH_URL, handler);
            var request = new RestRequest("api/neo/scan");
            request.AddJsonBody(new { apiKey, urlInfo = new { url } });
            await Task.FromResult(0);
            var response = client.Post(request);

            var job = JsonSerializer.Deserialize<CheckPhishResponse>(response.Content, _jsonDeserializeOptions);

            if (job == null || job.jobID == "none") return new CheckPhishResponse
            {
                status = "PENDING",
                disposition = "clean"
            };

            Thread.Sleep(5 * 1000);
            var requestStatus = new RestRequest("api/neo/scan/status");
            requestStatus.AddJsonBody(new { apiKey, job.jobID, insights });
            var responseStatus = client.Post(requestStatus);

            return JsonSerializer.Deserialize<CheckPhishResponse>(responseStatus.Content, _jsonDeserializeOptions);
        }

        /// <summary>
        /// Checks the phish pending job.
        /// </summary>
        /// <param name="apiKey">The API key.</param>
        /// <param name="jobId">The job identifier.</param>
        /// <param name="insights">if set to <c>true</c> [insights].</param>
        /// <returns></returns>
        public static async Task<CheckPhishResponse> CheckPhishPendingJob(string apiKey, string jobId, bool insights = false, HttpMessageHandler? handler = null)
        {
            var client = CreateRestClient(Constants.CHECK_PHISH_URL, handler);
            var requestStatus = new RestRequest("api/neo/scan/status");
            requestStatus.AddJsonBody(new { apiKey, jobID = jobId, insights });
            var responseStatus = client.Post(requestStatus);
            await Task.FromResult(0);
            return JsonSerializer.Deserialize<CheckPhishResponse>(responseStatus.Content, _jsonDeserializeOptions);
        }

        /// <summary>
        /// Encodes the authentication header.
        /// </summary>
        /// <param name="username">The username.</param>
        /// <param name="password">The password.</param>
        /// <returns></returns>
        public static string EncodeAuthHeader(string username, string password)
        {
            var byteArray = Encoding.ASCII.GetBytes($"{username}:{password}");
            return Convert.ToBase64String(byteArray);
        }

        /// <summary>
        /// Decodes the authentication header.
        /// </summary>
        /// <param name="encoded">The encoded.</param>
        /// <returns></returns>
        public static Tuple<string, string> DecodeAuthHeader(string encoded)
        {
            Encoding encoding = Encoding.GetEncoding("iso-8859-1");
            try
            {
                var decoded = encoding.GetString(Convert.FromBase64String(encoded));
                int indexOf = decoded.IndexOf(":");
                var username = decoded.Substring(0, indexOf);
                var password = decoded.Substring(indexOf + 1);
                Tuple<string, string> credentials = new Tuple<string, string>(username, password);
                return credentials;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Googles the safe browing.
        /// </summary>
        /// <param name="apiKey">The API key.</param>
        /// <param name="urls">The urls.</param>
        /// <param name="clientId">The client identifier.</param>
        /// <param name="clientVersion">The client version.</param>
        /// <returns></returns>
        public static async Task<GoogleSecuritySafebrowsingV4FindThreatMatchesResponse> GoogleSafeBrowing(string apiKey, string[] urls, string clientId = "dotnet-client", string clientVersion = "1.0.0", HttpMessageHandler? handler = null)
        {
            GoogleSecuritySafebrowsingV4ThreatEntry[] entries = new GoogleSecuritySafebrowsingV4ThreatEntry[urls.Length];
            for (int i = 0; i < urls.Length; i++)
                entries[i] = new GoogleSecuritySafebrowsingV4ThreatEntry { Url = urls[i] };

            var body = new GoogleSecuritySafebrowsingV4FindThreatMatchesRequest()
            {
                Client = new GoogleSecuritySafebrowsingV4ClientInfo
                {
                    ClientId = clientId,
                    ClientVersion = clientVersion
                },
                ThreatInfo = new GoogleSecuritySafebrowsingV4ThreatInfo()
                {
                    ThreatTypes = new string[] { "Malware", "Social_Engineering", "Unwanted_Software", "Potentially_Harmful_Application" },
                    PlatformTypes = new string[] { "Any_Platform" },
                    ThreatEntryTypes = new string[] { "URL" },
                    ThreatEntries = entries
                }
            };
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
            var client = CreateRestClient(Constants.GOOGLE_SAFE_BROWSING, handler);
            var request = new RestRequest($"v4/threatMatches:find");
            request.AddStringBody(JsonSerializer.Serialize(body, jsonOptions), ContentType.Json);
            request.AddQueryParameter("key", apiKey);
            var response = await client.PostAsync<GoogleSecuritySafebrowsingV4FindThreatMatchesResponse>(request);
            return response;
        }

        /// <summary>
        /// Ips the quality score.
        /// </summary>
        /// <param name="apiKey">The API key.</param>
        /// <param name="url">The URL.</param>
        /// <returns></returns>
        public static async Task<IpQualityScoreResponse> IpQualityScore(string apiKey, string url, HttpMessageHandler? handler = null)
        {
            var client = CreateRestClient(Constants.IP_QUALITY_SCORE, handler);
            var request = new RestRequest($"json/url/{apiKey}/{Uri.EscapeDataString(url)}");
            await Task.FromResult(0);
            var response = await client.PostAsync<IpQualityScoreResponse>(request);
            return response;
        }

        /// <summary>
        /// Generates the password.
        /// </summary>
        /// <returns></returns>
        public static async Task<string> GeneratePasswordAsync()
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
            var bytes = RandomNumberGenerator.GetBytes(10);
            var password = new string(bytes.Select(b => chars[b % chars.Length]).ToArray());
            await Task.FromResult(0);
            return _regex.Replace(password, "9");
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="password"></param>
        /// <returns></returns>
        /// <![CDATA[Taken from http://stackoverflow.com/questions/212510/what-is-the-easiest-way-to-encrypt-a-password-when-i-save-it-to-the-registry]]>
        public static async Task<string> EncrypPasswordAsync(string password, string salt = "cTNyf9@rxHVyKjQ%")
        {
            string saltedPassword = password + salt;
            byte[] data = Encoding.ASCII.GetBytes(saltedPassword);
            data = SHA256.HashData(data);
            await Task.FromResult(0);
            return Encoding.ASCII.GetString(data);
        }
    }
}
