using SplatDev.Umbraco.NPoco.Repositories;

using Umbraco.Cms.Core.Models;

namespace SplatDev.Umbraco.NPoco.Notifications
{
    public class ActionCompletedEvent
    {
        private static readonly Guid SuperUserKey = new("1E70F841-C261-413B-ABB2-2D68CDB96094");

        public int Id { get; set; }

        public IBaseEntity? Entity { get; set; }

        public AuditType AuditType { get; set; }

        public Guid UserId { get; set; } = SuperUserKey;

        public string? Message = string.Empty;

        public bool Log { get; set; }
    }

    public class UniqueActionCompletedEvent<T> where T : class
    {
        private static readonly Guid SuperUserKey = new("1E70F841-C261-413B-ABB2-2D68CDB96094");

        public KeyValuePair<int, int> Id { get; set; }

        public T? Entity { get; set; }

        public AuditType AuditType { get; set; }

        public Guid UserId { get; set; } = SuperUserKey;

        public string? Message = string.Empty;

        public bool Log { get; set; }
    }
}
