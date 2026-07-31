# =============================================================================
# SplatDev Playwright Runner — glibc-based screenshot and E2E container
#
# Uses the official Microsoft Playwright image (Ubuntu 24.04 Noble / glibc).
# This container connects to umbraco13 and umbraco17 over a Docker network;
# it does NOT embed an Umbraco runtime.
#
# Build context: repo root
#   docker build -f docker/test/playwright-runner/Dockerfile .
#
# See docker-compose.test.yml for the full stack.
# =============================================================================

FROM mcr.microsoft.com/playwright:v1.60.0-noble

# Install curl (needed for healthcheck polling in entry script)
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy e2e package files and install dependencies
COPY docker/test/e2e/package.json docker/test/e2e/package-lock.json* /app/e2e/
RUN cd /app/e2e && npm ci --ignore-scripts

# Copy full e2e suite (scripts + tests + playwright config)
COPY docker/test/e2e/ /app/e2e/

# Copy runner entry scripts
COPY docker/test/playwright-runner/scripts/ /app/scripts/
RUN chmod +x /app/scripts/*.sh

# Output directory (bind-mounted from host via docker-compose)
RUN mkdir -p /output/screenshots/u13 /output/screenshots/u17 /output/test-results

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD pgrep -f run-screenshots || exit 1

USER pwuser
CMD ["/app/scripts/run-screenshots.sh"]
