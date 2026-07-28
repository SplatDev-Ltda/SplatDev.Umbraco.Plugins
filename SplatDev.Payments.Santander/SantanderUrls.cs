namespace SplatDev.Payments.Santander;

/// <summary>Composes absolute product URLs: (product BaseUrl override ?? global BaseUrl) + BasePath + path.</summary>
public static class SantanderUrls
{
    public static string Compose(SantanderApiOptions options, SantanderProductOptions product, string path = "")
    {
        var host = string.IsNullOrWhiteSpace(product.BaseUrl) ? options.BaseUrl : product.BaseUrl;
        return host.TrimEnd('/') + product.BasePath + path;
    }
}
