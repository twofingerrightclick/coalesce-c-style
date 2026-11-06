using MyCompany.MyProject.Data.Coalesce;
using IntelliTect.Coalesce.TypeDefinition;
using IntelliTect.Coalesce.AuditLogging;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.ValueGeneration;
using System.Linq.Expressions;
using System.Security.Cryptography;

namespace MyCompany.MyProject.Data;

[Coalesce]
public class AppDbContext
    : DbContext
    , IDataProtectionKeyContext
    , IAuditLogDbContext<AuditLog>
{
    public bool SuppressAudit { get; set; } = false;


    public AppDbContext() { }

    public AppDbContext(DbContextOptions options) : base(options) { }

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<AuditLogProperty> AuditLogProperties => Set<AuditLogProperty>();



    public DbSet<Widget> Widgets => Set<Widget>();

    [InternalUse]
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder
        .UseStamping<TrackingBase>((entity, user) => entity.SetTracking(user))
        .UseCoalesceAuditLogging<AuditLog>(x => x
            .WithAugmentation<AuditOperationContext>()
            .ConfigureAudit(config =>
            {
                static string ShaString(byte[]? bytes) => bytes is null ? "" : "SHA1:" + Convert.ToBase64String(SHA1.HashData(bytes));

                config
                    .FormatType<byte[]>(ShaString)
                    .Exclude<DataProtectionKey>()
                    .ExcludeProperty<TrackingBase>(x => new { x.CreatedById, x.CreatedOn, x.ModifiedById, x.ModifiedOn })
                ;
            })
        )
        ;
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Remove cascading deletes.
        HashSet<Type> allowedCascadePrincipals = [];
        HashSet<Type> allowedCascadeDependents = [
        ];

        foreach (var relationship in builder.Model
            .GetEntityTypes()
            .SelectMany(e => e.GetForeignKeys())
            .Where(fk => !allowedCascadePrincipals.Contains(fk.PrincipalEntityType.ClrType)
                && !allowedCascadeDependents.Contains(fk.DeclaringEntityType.ClrType)))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }


    }

}
