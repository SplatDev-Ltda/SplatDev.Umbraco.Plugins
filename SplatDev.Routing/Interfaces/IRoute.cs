namespace SplatDev.Routing.Interfaces
{
    /// <summary>
    /// A conventional route discovered by <c>MapSplatDevRoutes</c>.
    /// </summary>
    public interface IRoute
    {
        string RouteAlias { get; }

        /// <summary>
        /// Cannot start with /
        /// </summary>
        string Url { get; }

        string Controller { get; }

        string Action { get; }

        object Defaults { get; }
    }
}
