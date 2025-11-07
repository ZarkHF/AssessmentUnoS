using Microsoft.EntityFrameworkCore;
using Serilog;
using TA_API.Services.Data;

var builder = WebApplication.CreateBuilder(args);
{
    builder.Host.UseSerilog((ctx, lc) => lc.WriteTo.Console());
    builder.Services.AddDbContext<AssessmentDbContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("AssessmentDB")));
    builder.Services.AddControllers();
    builder.Services.AddHttpClient();
    
    // Add CORS - Allow any origin for development
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAngularApp", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    });
}
var app = builder.Build();
{
    app.UseSerilogRequestLogging();
    
    // Use CORS before MapControllers
    app.UseCors("AllowAngularApp");
    
    app.MapControllers();
    app.MapGet("/", () => "Technical Assessment API");
    app.MapGet("/lbhealth", () => "Technical Assessment API");
}
app.Run();
