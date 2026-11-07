using Projects;

var builder = DistributedApplication.CreateBuilder(args);

// SQLite runs in the web process; no database container or migration process is needed.
builder.AddProject<MyCompany_MyProject_Web>("app")
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();

builder.Build().Run();
