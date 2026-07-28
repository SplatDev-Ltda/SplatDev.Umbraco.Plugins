namespace SplatDev.Routing
{
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Routing;
    using Microsoft.Extensions.DependencyInjection;
    using SplatDev.Routing.Interfaces;
    using System;
    using System.Linq;
    using System.Reflection;

    public static class RouteServiceExtensions
    {
        /// <summary>
        /// Scans the provided assemblies for IRoute implementations and registers each as a conventional route.
        /// Routes are instantiated via DI (<see cref="ActivatorUtilities.CreateInstance(IServiceProvider, Type)"/>)
        /// so their constructors can accept registered services.
        /// </summary>
        /// <param name="endpoints">The endpoint route builder.</param>
        /// <param name="assemblies">Assemblies to scan. At least one assembly must be provided.</param>
        /// <exception cref="ArgumentNullException">Thrown if <paramref name="assemblies"/> is null.</exception>
        /// <exception cref="ArgumentException">Thrown if no assemblies are provided.</exception>
        public static IEndpointRouteBuilder MapSplatDevRoutes(this IEndpointRouteBuilder endpoints, params Assembly[] assemblies)
        {
            if (assemblies == null)
                throw new ArgumentNullException(nameof(assemblies));
            if (assemblies.Length == 0)
                throw new ArgumentException("At least one assembly must be provided to scan for routes.", nameof(assemblies));

            foreach (var assembly in assemblies)
            {
                var routeTypes = assembly.GetTypes()
                    .Where(t => typeof(IRoute).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);

                foreach (var routeType in routeTypes)
                {
                    var route = (IRoute)ActivatorUtilities.CreateInstance(endpoints.ServiceProvider, routeType);
                    endpoints.MapControllerRoute(
                        name: route.RouteAlias,
                        pattern: route.Url,
                        defaults: route.Defaults ?? new { controller = route.Controller, action = route.Action }
                    );
                }
            }

            return endpoints;
        }
    }
}
