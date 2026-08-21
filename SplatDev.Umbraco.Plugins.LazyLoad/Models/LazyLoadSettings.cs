namespace SplatDev.Umbraco.Plugins.LazyLoad.Models;

public class LazyLoadSettings
{
    public bool Enabled { get; set; } = true;
    public string Placeholder { get; set; } = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
    public bool LazyLoadIframes { get; set; } = true;
}
