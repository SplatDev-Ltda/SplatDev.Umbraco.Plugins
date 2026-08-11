using System.Reflection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.Yaml2Schema.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace SplatDev.Umbraco.Themes.Base.Composers;

/// <summary>
/// Composer that registers the Base Theme initialization handler.
/// On first startup, extracts the embedded YAML schema to disk and installs
/// data types, document types, and templates into Umbraco.
/// </summary>
public sealed class BaseThemeComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddNotificationAsyncHandler<UmbracoApplicationStartedNotification, BaseThemeInitializationHandler>();
    }
}

/// <summary>
/// Handles <see cref="UmbracoApplicationStartedNotification"/> to install the Base Theme schema
/// from an embedded YAML file. Runs once per installation; subsequent starts are skipped
/// when the <c>.done</c> sentinel file is present.
/// </summary>
internal sealed class BaseThemeInitializationHandler
    : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
{
    private const string ThemeFolder = "base";
    private const string YamlResourceName = "SplatDev.Umbraco.Themes.Base.Config.umbraco.yml";
    private const string YamlFileName = "umbraco.yml";
    private const string DoneFileName = "umbraco.yml.done";

    private readonly YamlParser _yamlParser;
    private readonly DataTypeCreator _dataTypeCreator;
    private readonly DocumentTypeCreator _documentTypeCreator;
    private readonly TemplateCreator _templateCreator;
    private readonly IRuntimeState _runtimeState;
    private readonly IHostEnvironment _hostEnvironment;
    private readonly ILogger<BaseThemeInitializationHandler> _logger;

    public BaseThemeInitializationHandler(
        YamlParser yamlParser,
        DataTypeCreator dataTypeCreator,
        DocumentTypeCreator documentTypeCreator,
        TemplateCreator templateCreator,
        IRuntimeState runtimeState,
        IHostEnvironment hostEnvironment,
        ILogger<BaseThemeInitializationHandler> logger)
    {
        _yamlParser = yamlParser ?? throw new ArgumentNullException(nameof(yamlParser));
        _dataTypeCreator = dataTypeCreator ?? throw new ArgumentNullException(nameof(dataTypeCreator));
        _documentTypeCreator = documentTypeCreator ?? throw new ArgumentNullException(nameof(documentTypeCreator));
        _templateCreator = templateCreator ?? throw new ArgumentNullException(nameof(templateCreator));
        _runtimeState = runtimeState ?? throw new ArgumentNullException(nameof(runtimeState));
        _hostEnvironment = hostEnvironment ?? throw new ArgumentNullException(nameof(hostEnvironment));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task HandleAsync(
        UmbracoApplicationStartedNotification notification,
        CancellationToken cancellationToken)
    {
        // Only run when Umbraco is fully installed and running — skip during installer/upgrade.
        if (_runtimeState.Level != global::Umbraco.Cms.Core.RuntimeLevel.Run)
        {
            _logger.LogInformation(
                "BaseThemeInitializationHandler: Skipping — runtime level is {Level} (requires Run).",
                _runtimeState.Level);
            return;
        }

        var themeDir = Path.Combine(
            _hostEnvironment.ContentRootPath, "config", "themes", ThemeFolder);

        var yamlPath = Path.Combine(themeDir, YamlFileName);
        var donePath = Path.Combine(themeDir, DoneFileName);

        // Guard: if the .done sentinel already exists, the schema has been installed.
        if (File.Exists(donePath))
        {
            _logger.LogInformation(
                "BaseThemeInitializationHandler: Schema already installed (sentinel found at '{DonePath}'). Skipping.",
                donePath);
            return;
        }

        _logger.LogInformation(
            "BaseThemeInitializationHandler: Starting Base Theme schema installation.");

        try
        {
            // Ensure the target directory exists.
            Directory.CreateDirectory(themeDir);

            // Extract the embedded YAML to disk (overwrite if a previous partial run left it).
            await ExtractEmbeddedYamlAsync(yamlPath, cancellationToken);

            // Parse the YAML schema definition.
            _logger.LogInformation(
                "BaseThemeInitializationHandler: Parsing YAML from '{YamlPath}'.", yamlPath);

            var yamlRoot = _yamlParser.ParseYaml(yamlPath);

            if (yamlRoot?.Umbraco is null)
            {
                _logger.LogWarning(
                    "BaseThemeInitializationHandler: YAML parsed but root 'umbraco' key is missing or empty. Aborting.");
                return;
            }

            // 1. Create data types.
            if (yamlRoot.Umbraco.DataTypes?.Count > 0)
            {
                _logger.LogInformation(
                    "BaseThemeInitializationHandler: Creating {Count} data type(s).",
                    yamlRoot.Umbraco.DataTypes.Count);
                _dataTypeCreator.CreateDataTypes(yamlRoot.Umbraco.DataTypes);
            }

            // 2. Create document types (element types first, then pages).
            if (yamlRoot.Umbraco.DocumentTypes?.Count > 0)
            {
                _logger.LogInformation(
                    "BaseThemeInitializationHandler: Creating {Count} document type(s).",
                    yamlRoot.Umbraco.DocumentTypes.Count);
                _documentTypeCreator.CreateDocumentTypes(
                    yamlRoot.Umbraco.DocumentTypes,
                    yamlRoot.Umbraco.DataTypes);
            }

            // 3. Create templates.
            if (yamlRoot.Umbraco.Templates?.Count > 0)
            {
                _logger.LogInformation(
                    "BaseThemeInitializationHandler: Creating {Count} template(s).",
                    yamlRoot.Umbraco.Templates.Count);
                _templateCreator.CreateTemplates(yamlRoot.Umbraco.Templates);
            }

            // 4. Link templates to document types now that both sides exist.
            if (yamlRoot.Umbraco.DocumentTypes?.Count > 0)
            {
                _logger.LogInformation(
                    "BaseThemeInitializationHandler: Linking templates to document types.");
                _documentTypeCreator.LinkTemplatesToDocumentTypes(yamlRoot.Umbraco.DocumentTypes);
            }

            // 5. Resolve any Block List element type references.
            if (yamlRoot.Umbraco.DataTypes?.Count > 0)
            {
                _dataTypeCreator.LinkBlockListElementTypes(yamlRoot.Umbraco.DataTypes);
            }

            _logger.LogInformation(
                "BaseThemeInitializationHandler: Schema installation completed successfully.");

            // Rename the YAML to .done so this handler is skipped on subsequent startups.
            File.Move(yamlPath, donePath, overwrite: true);

            _logger.LogInformation(
                "BaseThemeInitializationHandler: Sentinel created at '{DonePath}'.", donePath);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // Log and carry on rather than rethrow. This runs from
            // UmbracoApplicationStartedNotification, so an exception here does not just
            // abandon the seeding - it fails application startup and takes the whole site
            // down, backoffice included. A theme that cannot install its schema should
            // leave the site running and say so in the log.
            //
            // Seen for real: the shipped YAML gives 'basePage' two compositions that each
            // define a 'heroImage' property, Umbraco rejects the duplicate alias with
            // InvalidCompositionException, and every other plugin on the site went down
            // with it.
            //
            // No sentinel is written, so a corrected schema still installs on next start.
            _logger.LogError(
                ex,
                "BaseThemeInitializationHandler: schema installation failed; the site will "
                + "continue without the Base Theme schema. It will be retried on the next start.");
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// Extracts the embedded <c>Config/umbraco.yml</c> resource to <paramref name="targetPath"/>.
    /// </summary>
    private static async Task ExtractEmbeddedYamlAsync(string targetPath, CancellationToken cancellationToken)
    {
        var assembly = Assembly.GetExecutingAssembly();
        using var resourceStream = assembly.GetManifestResourceStream(YamlResourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{YamlResourceName}' not found in assembly '{assembly.FullName}'. " +
                "Ensure Config/umbraco.yml is marked as EmbeddedResource in the project file.");

        await using var fileStream = new FileStream(
            targetPath,
            FileMode.Create,
            FileAccess.Write,
            FileShare.None,
            bufferSize: 4096,
            useAsync: true);

        await resourceStream.CopyToAsync(fileStream, cancellationToken);
    }
}
