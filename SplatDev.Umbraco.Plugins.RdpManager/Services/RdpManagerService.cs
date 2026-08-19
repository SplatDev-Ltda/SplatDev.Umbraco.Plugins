using Microsoft.EntityFrameworkCore;

using SplatDev.Umbraco.Plugins.RdpManager.Models;

namespace SplatDev.Umbraco.Plugins.RdpManager.Services
{
    public class RdpManagerService(RdpManagerDbContext dbContext) : IRdpManagerService
    {
        private readonly RdpManagerDbContext _dbContext = dbContext;

        public async Task<IEnumerable<RdpConnection>> GetAllAsync()
        {
            return await _dbContext.RdpConnections
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<RdpConnection?> GetByIdAsync(int id)
        {
            return await _dbContext.RdpConnections.FindAsync(id);
        }

        public async Task<RdpConnection> CreateAsync(RdpConnection connection)
        {
            connection.CreatedAt = DateTime.UtcNow;
            _dbContext.RdpConnections.Add(connection);
            await _dbContext.SaveChangesAsync();
            return connection;
        }

        public async Task<RdpConnection?> UpdateAsync(RdpConnection connection)
        {
            var existing = await _dbContext.RdpConnections.FindAsync(connection.Id);
            if (existing is null)
                return null;

            existing.Name = connection.Name;
            existing.Host = connection.Host;
            existing.Port = connection.Port;
            existing.Username = connection.Username;
            existing.Domain = connection.Domain;
            existing.Notes = connection.Notes;
            existing.ColorDepth = connection.ColorDepth;
            existing.FullScreen = connection.FullScreen;
            existing.Width = connection.Width;
            existing.Height = connection.Height;

            _dbContext.RdpConnections.Update(existing);
            await _dbContext.SaveChangesAsync();
            return existing;
        }

        public async Task DeleteAsync(int id)
        {
            var connection = await _dbContext.RdpConnections.FindAsync(id);
            if (connection is not null)
            {
                _dbContext.RdpConnections.Remove(connection);
                await _dbContext.SaveChangesAsync();
            }
        }

        public async Task<RdpResult> SaveAsync(RdpConnection connection)
        {
            if (string.IsNullOrWhiteSpace(connection.Name))
                return RdpResult.Fail("Give the connection a name.");

            if (string.IsNullOrWhiteSpace(connection.Host))
                return RdpResult.Fail("Enter a host name or IP address.");

            if (connection.Port is < 1 or > 65535)
                return RdpResult.Fail($"Port {connection.Port} is outside the valid range 1-65535.");

            if (connection.Width < 640 || connection.Height < 480)
                return RdpResult.Fail("Resolution must be at least 640x480.");

            // 15, 16, 24 and 32 are the only depths mstsc accepts; anything else makes the
            // client fall back silently, which looks like the setting was ignored.
            if (connection.ColorDepth is not (15 or 16 or 24 or 32))
                return RdpResult.Fail("Colour depth must be 15, 16, 24 or 32.");

            var clash = await _dbContext.RdpConnections
                .FirstOrDefaultAsync(c => c.Name == connection.Name && c.Id != connection.Id);
            if (clash is not null)
                return RdpResult.Fail($"Another connection is already called \"{connection.Name}\".");

            if (connection.Id > 0)
            {
                var updated = await UpdateAsync(connection);
                return updated is null
                    ? RdpResult.Fail("That connection no longer exists.")
                    : RdpResult.Ok(updated, $"\"{updated.Name}\" saved.");
            }

            var created = await CreateAsync(connection);
            return RdpResult.Ok(created, $"\"{created.Name}\" created.");
        }

        public async Task<RdpResult> RemoveAsync(int id)
        {
            var existing = await _dbContext.RdpConnections.FindAsync(id);
            if (existing is null)
                return RdpResult.Fail("That connection no longer exists.");

            await DeleteAsync(id);
            return RdpResult.Ok(existing, $"\"{existing.Name}\" deleted.");
        }

        public async Task<string> GenerateRdpContentAsync(int id)
        {
            var connection = await _dbContext.RdpConnections.FindAsync(id)
                ?? throw new KeyNotFoundException($"RDP connection with id {id} not found.");

            var fullScreenInt = connection.FullScreen ? 1 : 0;
            var lines = new List<string>
            {
                $"full address:s:{connection.Host}:{connection.Port}",
                $"screen mode id:i:{fullScreenInt + 1}",
                $"desktopwidth:i:{connection.Width}",
                $"desktopheight:i:{connection.Height}",
                $"session bpp:i:{connection.ColorDepth}",
                "compression:i:1",
                "keyboardhook:i:2",
                "audiocapturemode:i:0",
                "videoplaybackmode:i:1",
                "connection type:i:7",
                "networkautodetect:i:1",
                "bandwidthautodetect:i:1",
                "displayconnectionbar:i:1",
                "enableworkspacereconnect:i:0",
                "disable wallpaper:i:0",
                "allow font smoothing:i:0",
                "allow desktop composition:i:0",
                "disable full window drag:i:1",
                "disable menu anims:i:1",
                "disable themes:i:0",
                "disable cursor setting:i:0",
                "bitmapcachepersistenable:i:1",
                "audiomode:i:0",
                "redirectprinters:i:1",
                "redirectcomports:i:0",
                "redirectsmartcards:i:1",
                "redirectclipboard:i:1",
                "redirectposdevices:i:0",
                "autoreconnection enabled:i:1",
                "authentication level:i:2",
                "prompt for credentials:i:0",
                "negotiate security layer:i:1",
                "remoteapplicationmode:i:0",
                "alternate shell:s:",
                "shell working directory:s:",
                "gatewayhostname:s:",
                "gatewayusagemethod:i:4",
                "gatewaycredentialssource:i:4",
                "gatewayprofileusagemethod:i:0",
                "promptcredentialonce:i:0",
                "gatewaybrokeringtype:i:0",
                "use redirection server name:i:0",
                "rdgiskdcproxy:i:0",
                "kdcproxyname:s:"
            };

            if (!string.IsNullOrWhiteSpace(connection.Username))
            {
                var userWithDomain = string.IsNullOrWhiteSpace(connection.Domain)
                    ? connection.Username
                    : $"{connection.Domain}\\{connection.Username}";
                lines.Add($"username:s:{userWithDomain}");
            }

            if (!string.IsNullOrWhiteSpace(connection.Notes))
            {
                lines.Add($"description:s:{connection.Notes}");
            }

            return string.Join("\r\n", lines) + "\r\n";
        }
    }
}
