# Umbraco 17 plugin-testing instance.
#
# The template version MUST stay pinned. Without the `::17.6.0` pin this installs
# whatever Umbraco.Templates is latest at build time, which is how this instance
# silently drifted to Umbraco 18.0.2 (SPL-3497). Umbraco 17 and 18 are both .NET 10,
# so the drift is invisible from the target framework — nothing fails loudly, plugins
# just get "verified" against the wrong major.
#
# Bump deliberately, and confirm afterwards with:
#   GET /umbraco/management/api/v1/server/information
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
RUN dotnet new install Umbraco.Templates::17.6.0
WORKDIR /src
# NB: `dotnet new umbraco` has no --version flag; the installed template pins the version.
RUN dotnet new umbraco --name U17Testing --force
WORKDIR /src/U17Testing

# Install the SplatDev plugins from a local feed so they can be exercised before (or
# without) being published to NuGet. Drop .nupkg files into u17/local-packages/.
COPY local-packages/ /local-packages/
RUN dotnet nuget add source /local-packages --name local-plugins

# Every plugin that supports this target framework, as a single props file rather than a
# `dotnet add package` per plugin: each of those triggers its own restore, which across
# ~95 packages turns a two-minute build into an hours-long one. MSBuild picks up
# Directory.Build.props from the project directory automatically, so one restore covers
# the lot. Regenerate with tools/../make-props.py when the plugin set changes.
COPY plugins.props /src/U17Testing/Directory.Build.props

RUN dotnet restore
RUN dotnet build -c Release --no-restore
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish ./
RUN mkdir -p /app/umbraco /app/App_Data /app/wwwroot/App_Plugins && chown -R app:app /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:8080/ || exit 1
USER app
ENTRYPOINT ["dotnet", "U17Testing.dll"]
