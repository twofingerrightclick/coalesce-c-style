using MyCompany.MyProject.Data;
using MyCompany.MyProject.Data.Auth;
using MyCompany.MyProject.Web;
using IntelliTect.Coalesce;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc;

CoalesceOptions.PreventAspNetBrowserRefresh();

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // Explicit declaration prevents ASP.NET Core from erroring if wwwroot doesn't exist at startup:
    WebRootPath = "wwwroot"
});

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile("appsettings.localhost.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();


builder.AddServiceDefaults();

#region Configure Services

var services = builder.Services;

services.AddDbContext<AppDbContext>(options => options
    .UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), opt => opt
        .EnableRetryOnFailure()
        .UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
        .MigrationsAssembly("MyCompany.MyProject.Migrations")
    )
    // Ignored because it interferes with the construction of Coalesce IncludeTrees via .Include()
    .ConfigureWarnings(warnings => warnings.Ignore(CoreEventId.NavigationBaseIncludeIgnored))
);

services.AddCoalesce<AppDbContext>();
services.AddDataProtection().PersistKeysToDbContext<AppDbContext>();
services.AddMvc();


services.AddScoped<SecurityService>();




#endregion

#region Configure HTTP Pipeline

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    app.UseViteDevelopmentServer(c =>
    {
        c.DevServerPort = 22268;
        c.PackageManagerCommand = "pnpm";
    });

    app.MapCoalesceSecurityOverview("coalesce-security");

    // TODO: Dummy authentication for initial development.
    // Replace this with a proper authentication scheme like
    // Windows Authentication, or an OIDC provider, or something else.
    // If you wanted to use ASP.NET Core Identity, you're recommended
    // to keep the "--Identity" parameter to the Coalesce template enabled.
    app.Use(async (context, next) =>
    {
        Claim[] claims = [new Claim(ClaimTypes.Name, "developmentuser")];

        var identity = new ClaimsIdentity(claims, "dummy-auth");
        context.User = new ClaimsPrincipal(identity);

        await next.Invoke();
    });
    // End Dummy Authentication.
}

app.UseAuthentication();
app.UseAuthorization();

app.UseViteStaticFiles();
app.UseNoCacheResponseHeader();
app.UseAppVersionHeader();

app.MapDefaultEndpoints();
app.MapRazorPages();
app.MapDefaultControllerRoute();

// API fallback to prevent serving SPA fallback to 404 hits on API endpoints.
app.Map("/api/{**any}", () => Results.NotFound());

app.MapFallbackToController("Index", "Home");

#endregion

#region Launch

// Initialize/migrate database.
using (var scope = app.Services.CreateScope())
{
    var serviceScope = scope.ServiceProvider;

    // Run database migrations.
    using var db = serviceScope.GetRequiredService<AppDbContext>();
    db.Database.SetCommandTimeout(TimeSpan.FromMinutes(10));
    db.Database.Migrate();

    ActivatorUtilities.GetServiceOrCreateInstance<DatabaseSeeder>(serviceScope).Seed();
}

app.Run();
#endregion