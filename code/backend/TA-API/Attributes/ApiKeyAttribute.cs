using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TA_API.Attributes
{
    public class ApiKeyAttribute : Attribute, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var configuration = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var apiKey = configuration["ApiKey"];

            if (string.IsNullOrEmpty(apiKey))
            {
                context.Result = new StatusCodeResult(500);
                return;
            }

            if (!context.HttpContext.Request.Headers.TryGetValue("X-API-Key", out var extractedApiKey))
            {
                context.Result = new UnauthorizedObjectResult(new { error = "API Key is missing. Please provide X-API-Key header." });
                return;
            }

            if (!apiKey.Equals(extractedApiKey.ToString(), StringComparison.Ordinal))
            {
                context.Result = new UnauthorizedObjectResult(new { error = "Invalid API Key." });
                return;
            }

            await next();
        }
    }
}

