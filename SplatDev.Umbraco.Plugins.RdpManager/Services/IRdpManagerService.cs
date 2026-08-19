using SplatDev.Umbraco.Plugins.RdpManager.Models;

namespace SplatDev.Umbraco.Plugins.RdpManager.Services
{
    public interface IRdpManagerService
    {
        Task<IEnumerable<RdpConnection>> GetAllAsync();
        Task<RdpConnection?> GetByIdAsync(int id);
        Task<RdpConnection> CreateAsync(RdpConnection connection);
        Task<RdpConnection?> UpdateAsync(RdpConnection connection);
        Task DeleteAsync(int id);

        /// <summary>
        /// Creates or updates a connection, validating it first.
        /// </summary>
        /// <remarks>
        /// CreateAsync and UpdateAsync write whatever they are given. A blank host or a port
        /// outside 1-65535 produced a stored row that generated a .rdp file the client would
        /// refuse to open, with nothing anywhere to say why.
        /// </remarks>
        Task<RdpResult> SaveAsync(RdpConnection connection);

        /// <summary>Deletes a connection, reporting whether it existed.</summary>
        Task<RdpResult> RemoveAsync(int id);
        Task<string> GenerateRdpContentAsync(int id);
    }

    /// <summary>The outcome of a write, with a message meant for an editor.</summary>
    public sealed class RdpResult
    {
        public bool Success { get; init; }
        public string Message { get; init; } = string.Empty;
        public RdpConnection? Value { get; init; }

        public static RdpResult Ok(RdpConnection v, string m) =>
            new() { Success = true, Value = v, Message = m };

        public static RdpResult Fail(string m) => new() { Success = false, Message = m };
    }
}
