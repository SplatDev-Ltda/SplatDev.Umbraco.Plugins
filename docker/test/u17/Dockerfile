# =============================================================================
# SplatDev Umbraco 17 Test Baseline — Optimized Multi-stage Docker Build
# Uses NuGet packages instead of building 123 plugins from source.
# Build context: repo root (docker build -f docker/test/u17/Dockerfile .)
# Typical build time: ~10-15 min (vs 2+ hours with source builds)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: .NET restore + publish (NuGet-based — no frontend build needed)
# ---------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

WORKDIR /src

# Copy project file first so NuGet restore is a separate cached layer
COPY test-environments/Umbraco17.Baseline/Umbraco17.Baseline.csproj .
RUN dotnet restore Umbraco17.Baseline.csproj

# Copy remaining source files
COPY test-environments/Umbraco17.Baseline/appsettings.json .
COPY test-environments/Umbraco17.Baseline/Program.cs .

RUN dotnet publish Umbraco17.Baseline.csproj -c Release -o /app/publish --no-restore

# ---------------------------------------------------------------------------
# Stage 2: Runtime image with ASP.NET 10 + Node + Playwright/Chromium
# ---------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

ENV ASPNETCORE_URLS=http://0.0.0.0:5000 \
    ASPNETCORE_ENVIRONMENT=Development \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_NOLOGO=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22 (required by Playwright)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright + Chromium browser + system dependencies
RUN npx -y playwright@latest install --with-deps chromium

WORKDIR /app

COPY --from=build /app/publish .

# Copy built plugin App_Plugins (dist/ files with Lit 3 dashboard components)
# This overlays the published output with locally-built frontend assets
COPY SplatDev.Umbraco.Plugins.*/App_Plugins/ /app/wwwroot/App_Plugins/

# Copy shared E2E test suite + Playwright config
COPY docker/test/e2e/ /app/e2e/
RUN cd /app/e2e && npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts 2>/dev/null || true

RUN mkdir -p \
    /app/umbraco/Data \
    /output/screenshots \
    /output/videos \
    /output/test-results \
    /output/playwright-report

COPY docker/test/u17/scripts/test-runner.sh /app/test-runner.sh
RUN chmod +x /app/test-runner.sh

EXPOSE 5000

HEALTHCHECK --interval=20s --timeout=5s --start-period=120s --retries=6 \
    CMD curl -sf http://127.0.0.1:5000/umbraco || exit 1

ENTRYPOINT ["dotnet", "Umbraco17.Baseline.dll"]
