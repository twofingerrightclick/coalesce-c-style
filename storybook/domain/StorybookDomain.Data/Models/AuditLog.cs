using IntelliTect.Coalesce.AuditLogging;

namespace StorybookDomain.Data.Models;

[Edit(SecurityPermissionLevels.DenyAll)]
[Delete(SecurityPermissionLevels.DenyAll)]
[Create(SecurityPermissionLevels.DenyAll)]
public class AuditLog : DefaultAuditLog
{
}
