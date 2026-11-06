using Projects;
using System.Runtime.InteropServices;
using static System.Runtime.InteropServices.RuntimeInformation;

var builder = DistributedApplication.CreateBuilder(args);

// Add SQL Server
var sqlDb = OperatingSystem.IsWindows() && OSArchitecture != Architecture.Arm64
    // Assume that localdb is available on Windows (non-ARM)
    ? builder.AddConnectionString("DefaultConnection")
    // Fall back to a container
    : builder.AddSqlServer("sql").WithLifetime(ContainerLifetime.Persistent).AddDatabase("db", nameof(MyCompany_MyProject_Web));

var migrations = builder.AddProject<MyCompany_MyProject_Migrations>("migrations")
    .WithReference(sqlDb, "DefaultConnection")
    .WaitFor(sqlDb)
    .WithParentRelationship(sqlDb);

var app = builder.AddProject<MyCompany_MyProject_Web>("app")
    .WithReference(sqlDb, "DefaultConnection")
    .WaitForCompletion(migrations)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();

builder.Build().Run();
