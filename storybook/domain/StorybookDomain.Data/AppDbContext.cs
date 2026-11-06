using IntelliTect.Coalesce.AuditLogging;

namespace StorybookDomain.Data;

[Coalesce]
public class AppDbContext(DbContextOptions options) : DbContext(options), IAuditLogDbContext<AuditLog>
{
    public bool SuppressAudit { get; set; }

    public DbSet<Person> People => Set<Person>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<PersonTag> PersonTags => Set<PersonTag>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<AuditLogProperty> AuditLogProperties => Set<AuditLogProperty>();
}
