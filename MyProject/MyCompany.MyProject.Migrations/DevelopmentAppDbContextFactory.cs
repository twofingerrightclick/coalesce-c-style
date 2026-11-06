using MyCompany.MyProject.Data;
using IntelliTect.Coalesce.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.DependencyInjection;

namespace MyCompany.MyProject.Migrations;

public class DevelopmentAppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // This is only used by the EF Core CLI tooling (`dotnet ef`).
        // It shouldn't ever be used in code where it might end up running in production.

        return new ServiceCollection()
            .AddMigrationDbContext(DevelopmentConnectionStringLocator.Find())
            .BuildServiceProvider()
            .GetRequiredService<AppDbContext>();
    }
}
