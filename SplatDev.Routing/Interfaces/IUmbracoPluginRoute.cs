namespace SplatDev.Routing.Interfaces
{
    /// <summary>
    /// A route served by an Umbraco plugin controller, which additionally needs to know
    /// where it hangs in the content tree.
    /// </summary>
    /// <remarks>
    /// These three members used to sit on <see cref="IRoute"/>, which meant every route —
    /// including ones with nothing to do with Umbraco — had to implement them.
    /// </remarks>
    public interface IUmbracoPluginRoute : IRoute
    {
        int? RootId { get; }

        string RootAlias { get; }

        bool IsPluginController { get; }
    }
}
