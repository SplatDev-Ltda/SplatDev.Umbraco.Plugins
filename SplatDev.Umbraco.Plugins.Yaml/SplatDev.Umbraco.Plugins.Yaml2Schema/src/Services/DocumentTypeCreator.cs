using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Strings;
using Microsoft.Extensions.Logging;
using SplatDev.Umbraco.Plugins.Yaml2Schema.Models;

// ITemplateService is a Umbraco 14+ API. Umbraco 13 uses IFileService for templates.

namespace SplatDev.Umbraco.Plugins.Yaml2Schema.Services
{
    public class DocumentTypeCreator
    {
        private readonly IContentTypeService _contentTypeService;
        private readonly IDataTypeService _dataTypeService;
#if NET8_0
        // Umbraco 13: template resolution goes through IFileService
        private readonly IFileService _fileService;
#else
        // Umbraco 14+ / 17: dedicated ITemplateService
        private readonly ITemplateService _templateService;
#endif
        private readonly IShortStringHelper _shortStringHelper;
        private readonly ILogger<DocumentTypeCreator>? _logger;

        public DocumentTypeCreator(
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService,
#if NET8_0
            IFileService fileService,
#else
            ITemplateService templateService,
#endif
            IShortStringHelper shortStringHelper,
            ILogger<DocumentTypeCreator>? logger = null)
        {
            _contentTypeService = contentTypeService ?? throw new ArgumentNullException(nameof(contentTypeService));
            _dataTypeService = dataTypeService ?? throw new ArgumentNullException(nameof(dataTypeService));
#if NET8_0
            _fileService = fileService ?? throw new ArgumentNullException(nameof(fileService));
#else
            _templateService = templateService ?? throw new ArgumentNullException(nameof(templateService));
#endif
            _shortStringHelper = shortStringHelper ?? throw new ArgumentNullException(nameof(shortStringHelper));
            _logger = logger;
        }

        public void CreateDocumentTypes(List<YamlDocumentType> documentTypes, List<YamlDataType> dataTypes = null)
        {
            if (documentTypes == null)
            {
                throw new ArgumentNullException(nameof(documentTypes));
            }

            // Build alias -> name map so properties can reference DataTypes by YAML alias
            var dataTypeNameByAlias = dataTypes?
                .Where(d => !string.IsNullOrEmpty(d.Alias) && !string.IsNullOrEmpty(d.Name))
                .GroupBy(d => d.Alias, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.First().Name, StringComparer.OrdinalIgnoreCase)
                ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            var processedAliases = new HashSet<string>();

            foreach (var yamlDocType in documentTypes)
            {
                try
                {
                    // Skip if alias has already been processed in this batch
                    if (processedAliases.Contains(yamlDocType.Alias))
                    {
                        _logger?.LogWarning(
                            "DocumentType with alias '{Alias}' is a duplicate and will be skipped.",
                            yamlDocType.Alias
                        );
                        continue;
                    }

                    // [UPDATE] — update if exists, create if not found
                    if (yamlDocType.Update)
                    {
                        var toUpdate = _contentTypeService.Get(yamlDocType.Alias);
                        if (toUpdate != null)
                        {
                            UpdateDocumentType(toUpdate, yamlDocType, dataTypeNameByAlias);
                            _contentTypeService.Save(toUpdate);
                            _logger?.LogInformation(
                                "DocumentType '{Name}' with alias '{Alias}' updated.",
                                yamlDocType.Name, yamlDocType.Alias);
                            processedAliases.Add(yamlDocType.Alias);
                            continue;
                        }
                        // Not found — fall through to creation below
                        _logger?.LogInformation(
                            "DocumentType '{Alias}' not found during UPDATE; will create it.",
                            yamlDocType.Alias);
                    }

                    // [REMOVE] — delete the DocumentType if flagged
                    if (yamlDocType.Remove)
                    {
                        var toDelete = _contentTypeService.Get(yamlDocType.Alias);
                        if (toDelete != null)
                        {
                            _contentTypeService.Delete(toDelete, Constants.Security.SuperUserId);
                            _logger?.LogInformation(
                                "DocumentType '{Name}' with alias '{Alias}' removed.",
                                yamlDocType.Name, yamlDocType.Alias);
                        }
                        else
                        {
                            _logger?.LogDebug(
                                "DocumentType with alias '{Alias}' not found for removal. Skipping.",
                                yamlDocType.Alias);
                        }
                        processedAliases.Add(yamlDocType.Alias);
                        continue;
                    }

                    // Check if DocumentType already exists in the system
                    var existing = _contentTypeService.Get(yamlDocType.Alias);
                    if (existing != null)
                    {
                        _logger?.LogInformation(
                            "DocumentType with alias '{Alias}' already exists. Skipping.",
                            yamlDocType.Alias
                        );
                        processedAliases.Add(yamlDocType.Alias);
                        continue;
                    }

                    // Create new ContentType
                    var contentType = new ContentType(_shortStringHelper, -1)
                    {
                        Name = yamlDocType.Name,
                        Alias = yamlDocType.Alias,
                        Icon = yamlDocType.Icon ?? "icon-document",
                        Description = yamlDocType.Description ?? string.Empty,
                        AllowedAsRoot = yamlDocType.AllowAsRoot,
                        IsElement = yamlDocType.IsElement
                    };

                    // Add tabs and properties
                    foreach (var tab in yamlDocType.Tabs ?? [])
                    {
                        var tabAlias = _shortStringHelper.CleanStringForSafeAlias(tab.Name);
                        var contentTab = new PropertyGroup(false)
                        {
                            Name = tab.Name,
                            Alias = tabAlias,
                            SortOrder = tab.SortOrder
                        };

                        foreach (var property in tab.Properties)
                        {
                            var dtName = dataTypeNameByAlias.TryGetValue(property.DataType, out var mapped) ? mapped : property.DataType;
                            var dataType = _dataTypeService.GetDataType(dtName);
                            if (dataType == null)
                            {
                                _logger?.LogWarning(
                                    "DataType '{DataType}' not found. Skipping property '{PropertyAlias}' in DocumentType '{DocTypeAlias}'.",
                                    property.DataType,
                                    property.Alias,
                                    yamlDocType.Alias
                                );
                                continue;
                            }

                            var contentProp = new PropertyType(_shortStringHelper, dataType)
                            {
                                Alias = property.Alias,
                                Name = property.Name,
                                Mandatory = property.Required,
                                Description = property.Description,
                                SortOrder = property.SortOrder,
                                ValidationRegExp = property.ValidationRegExp ?? string.Empty
                            };

                            contentTab.PropertyTypes!.Add(contentProp);
                        }

                        contentType.PropertyGroups.Add(contentTab);
                    }

                    // Apply compositions (mixin types whose property groups are added to this type)
                    if (yamlDocType.Compositions?.Any() == true)
                    {
                        var compositionTypes = yamlDocType.Compositions
                            .Select(alias => _contentTypeService.Get(alias))
                            .Where(ct => ct != null)
                            .ToList();

                        foreach (var comp in compositionTypes)
                        {
                            contentType.AddContentType(comp!);
                        }

                        var missing = yamlDocType.Compositions.Except(
                            compositionTypes.Select(c => c!.Alias), StringComparer.OrdinalIgnoreCase).ToList();
                        foreach (var m in missing)
                            _logger?.LogWarning("Composition type '{Alias}' not found for DocumentType '{DocAlias}'. Skipping.", m, yamlDocType.Alias);
                    }

                    // Set allowed child types
                    if (yamlDocType.AllowedChildTypes?.Any() == true)
                    {
                        var childTypes = yamlDocType.AllowedChildTypes
                            .Select(alias => _contentTypeService.Get(alias))
                            .Where(ct => ct != null)
                            .ToList();

                        contentType.AllowedContentTypes = childTypes
#if NET10_0_OR_GREATER
                            .Select(ct => new ContentTypeSort(ct!.Key, 0, ct.Alias))
#else
                            .Select(ct => new ContentTypeSort(new Lazy<int>(() => ct!.Id), 0, ct!.Alias))
#endif
                            .ToList();
                    }

                    // Save the ContentType
                    _contentTypeService.Save(contentType);
                    processedAliases.Add(yamlDocType.Alias);

                    _logger?.LogInformation(
                        "DocumentType '{Name}' with alias '{Alias}' created successfully.",
                        yamlDocType.Name,
                        yamlDocType.Alias
                    );
                }
                catch (Exception ex)
                {
                    _logger?.LogError(
                        ex,
                        "Error creating DocumentType '{Name}' with alias '{Alias}'.",
                        yamlDocType.Name,
                        yamlDocType.Alias
                    );
                    throw;
                }
            }
        }

        public void LinkTemplatesToDocumentTypes(List<YamlDocumentType> documentTypes)
        {
            if (documentTypes == null) return;

            foreach (var yamlDocType in documentTypes)
            {
                var hasAllowed  = yamlDocType.AllowedTemplates?.Count > 0;
                var hasDefault  = !string.IsNullOrWhiteSpace(yamlDocType.DefaultTemplate);
                if (!hasAllowed && !hasDefault) continue;

                var contentType = _contentTypeService.Get(yamlDocType.Alias);
                if (contentType == null)
                {
                    _logger?.LogWarning(
                        "DocumentType '{Alias}' not found when linking templates. Skipping.",
                        yamlDocType.Alias);
                    continue;
                }

                // Collect all template aliases to resolve (allowed + default if not already listed)
                var aliases = (yamlDocType.AllowedTemplates ?? new List<string>()).ToList();
                if (hasDefault && !aliases.Contains(yamlDocType.DefaultTemplate!))
                    aliases.Add(yamlDocType.DefaultTemplate!);

                var resolvedTemplates = new List<ITemplate>();
                foreach (var alias in aliases)
                {
#if NET8_0
                    var template = _fileService.GetTemplate(alias);
#else
                    var template = _templateService.GetAsync(alias).GetAwaiter().GetResult();
#endif
                    if (template == null)
                    {
                        _logger?.LogWarning(
                            "Template '{TemplateAlias}' not found when linking to DocumentType '{DocAlias}'. Skipping.",
                            alias, yamlDocType.Alias);
                        continue;
                    }
                    resolvedTemplates.Add(template);
                }

                // Guard: only assign AllowedTemplates when at least one template was resolved.
                // Assigning an empty list would clear ALL existing template assignments on the
                // document type, which is destructive and almost never intentional.
                if (resolvedTemplates.Count == 0)
                {
                    _logger?.LogWarning(
                        "No templates could be resolved for DocumentType '{Alias}' — preserving existing template assignments.",
                        yamlDocType.Alias);
                    continue;
                }

                contentType.AllowedTemplates = resolvedTemplates;

                if (hasDefault)
                {
                    var defaultTemplate = resolvedTemplates.FirstOrDefault(t => t.Alias == yamlDocType.DefaultTemplate);
                    if (defaultTemplate != null)
                        contentType.SetDefaultTemplate(defaultTemplate);
                }

                _contentTypeService.Save(contentType);
                _logger?.LogInformation(
                    "Linked {Count} template(s) to DocumentType '{Alias}' (default: '{Default}').",
                    resolvedTemplates.Count, yamlDocType.Alias, yamlDocType.DefaultTemplate ?? "(none)");
            }
        }

        private void UpdateDocumentType(IContentType existing, YamlDocumentType yaml, Dictionary<string, string> dataTypeNameByAlias)
        {
            existing.Name = yaml.Name;
            existing.Icon = yaml.Icon ?? "icon-document";
            if (yaml.Description != null)
                existing.Description = yaml.Description;
            existing.AllowedAsRoot = yaml.AllowAsRoot;
            existing.IsElement = yaml.IsElement;

            // Merge tabs and properties — additive only, existing properties are never removed
            foreach (var tab in yaml.Tabs ?? [])
            {
                var tabAlias = _shortStringHelper.CleanStringForSafeAlias(tab.Name);
                var existingTab = existing.PropertyGroups.FirstOrDefault(g => g.Alias == tabAlias);

                if (existingTab == null)
                {
                    // Add the entire new tab
                    var newTab = new PropertyGroup(false) { Name = tab.Name, Alias = tabAlias, SortOrder = tab.SortOrder };
                    foreach (var property in tab.Properties)
                    {
                        var dtName = dataTypeNameByAlias.TryGetValue(property.DataType, out var mapped) ? mapped : property.DataType;
                        var dataType = _dataTypeService.GetDataType(dtName);
                        if (dataType == null)
                        {
                            _logger?.LogWarning(
                                "DataType '{DataType}' not found. Skipping property '{PropertyAlias}'.",
                                property.DataType, property.Alias);
                            continue;
                        }
                        newTab.PropertyTypes!.Add(new PropertyType(_shortStringHelper, dataType)
                        {
                            Alias = property.Alias,
                            Name = property.Name,
                            Mandatory = property.Required,
                            Description = property.Description,
                            SortOrder = property.SortOrder,
                            ValidationRegExp = property.ValidationRegExp ?? string.Empty
                        });
                    }
                    existing.PropertyGroups.Add(newTab);
                }
                else
                {
                    // Merge new properties into the existing tab; skip any whose
                    // alias already exists ANYWHERE on the ContentType (not just
                    // in the current tab).  Without the global check a property
                    // moved between tabs in a theme update will create a duplicate
                    // across two PropertyGroups, which causes an
                    // InvalidCompositionException on Save.
                    foreach (var property in tab.Properties)
                    {
                        if (existingTab.PropertyTypes?.Any(p => p.Alias == property.Alias) == true)
                            continue;

                        if (existing.PropertyTypes.Any(p => p.Alias == property.Alias))
                            continue;

                        var dtName = dataTypeNameByAlias.TryGetValue(property.DataType, out var mapped) ? mapped : property.DataType;
                        var dataType = _dataTypeService.GetDataType(dtName);
                        if (dataType == null)
                        {
                            _logger?.LogWarning(
                                "DataType '{DataType}' not found. Skipping property '{PropertyAlias}'.",
                                property.DataType, property.Alias);
                            continue;
                        }
                        existingTab.PropertyTypes!.Add(new PropertyType(_shortStringHelper, dataType)
                        {
                            Alias = property.Alias,
                            Name = property.Name,
                            Mandatory = property.Required,
                            Description = property.Description,
                            SortOrder = property.SortOrder,
                            ValidationRegExp = property.ValidationRegExp ?? string.Empty
                        });
                    }
                }
            }

            // Update allowed child types when explicitly provided
            if (yaml.AllowedChildTypes?.Any() == true)
            {
                var childTypes = yaml.AllowedChildTypes
                    .Select(alias => _contentTypeService.Get(alias))
                    .Where(ct => ct != null)
                    .ToList();

                existing.AllowedContentTypes = childTypes
#if NET10_0_OR_GREATER
                    .Select(ct => new ContentTypeSort(ct!.Key, 0, ct.Alias))
#else
                    .Select(ct => new ContentTypeSort(new Lazy<int>(() => ct!.Id), 0, ct!.Alias))
#endif
                    .ToList();
            }
        }
    }
}
