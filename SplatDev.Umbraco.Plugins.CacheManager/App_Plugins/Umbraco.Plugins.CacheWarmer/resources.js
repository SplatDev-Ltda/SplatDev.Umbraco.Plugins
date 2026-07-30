angular.module("umbraco.resources").factory("cacheResources", function ($http) {
    const baseAuthApiUrl = "/umbraco/backoffice/api/CacheWarmer/";
    function clearCache() {
        return $http.post(`${baseAuthApiUrl}ClearCache`, null, { timeout: 360 * 1000 });
    }

    function refreshCache() {
        return $http.post(`${baseAuthApiUrl}RefreshCache`, null, { timeout: 360 * 1000 });
    }

    function getLatestTask() {
        return $http.get(`${baseAuthApiUrl}GetLastTask`, { timeout: 360 * 1000 });
    }

    function getStats() {
        return $http.get(`${baseAuthApiUrl}GetStatistics`, { timeout: 360 * 1000 });
    }

    function getNotFound() {
        return $http.get(`${baseAuthApiUrl}GetUrlNotFound`, { timeout: 360 * 1000 });
    }

    return {
        clearCache,
        refreshCache,
        getLatestTask,
        getNotFound,
        getStats
    }
})