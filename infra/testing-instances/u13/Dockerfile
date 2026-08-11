FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
RUN dotnet new install Umbraco.Templates::13.7.0
WORKDIR /src
RUN dotnet new umbraco --name U13Testing --force
WORKDIR /src/U13Testing
RUN dotnet restore
RUN dotnet build -c Release --no-restore
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish ./
RUN mkdir -p /app/umbraco /app/App_Data /app/wwwroot/App_Plugins && chown -R app:app /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:8080/ || exit 1
USER app
ENTRYPOINT ["dotnet", "U13Testing.dll"]
