using IntelliTect.Coalesce.AuditLogging;

namespace MyCompany.MyProject.Data.Models;

[Edit(DenyAll)]
[Delete(DenyAll)]
[Create(DenyAll)]
public class AuditLog : DefaultAuditLog
{

}