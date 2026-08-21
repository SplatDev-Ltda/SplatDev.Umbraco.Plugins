namespace SplatDev.Umbraco.Plugins.RdpManager.Models
{
    public class RdpConnection
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; } = 3389;
        public string? Username { get; set; }
        public string? Domain { get; set; }
        public string? Notes { get; set; }
        public int ColorDepth { get; set; } = 32;
        public bool FullScreen { get; set; } = true;
        public int Width { get; set; } = 1920;
        public int Height { get; set; } = 1080;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
