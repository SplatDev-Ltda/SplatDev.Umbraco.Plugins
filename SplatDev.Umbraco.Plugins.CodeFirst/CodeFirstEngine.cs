namespace SplatDev.Umbraco.Plugins.CodeFirst
{
    using Microsoft.Win32.SafeHandles;

    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reflection;
    using System.Runtime.InteropServices;

    using Umbraco.Cms.Core;
    using Umbraco.Cms.Core.Models;
    using Umbraco.Cms.Core.PropertyEditors;
    using Umbraco.Cms.Core.Services;

    using SplatDev.Umbraco.Plugins.CodeFirst.Attributes;
    using SplatDev.Umbraco.Plugins.CodeFirst.Enums;
    using SplatDev.Umbraco.Plugins.CodeFirst.Helpers;
    using SplatDev.Umbraco.Plugins.CodeFirst.Interfaces;
    using SplatDev.Umbraco.Plugins.CodeFirst.Models;
    using SplatDev.Umbraco.Plugins.CodeFirst.Services;
    using UmbracoCms.Plugins;
    using UmbracoCms.Plugins.MemberGroups.Helpers;
    using UmbracoCms.Plugins.MemberGroups.Interfaces;
    using UmbracoCms.Plugins.MemberGroups.Services;
    using UmbracoCms.Plugins.MemberGroups.Users;

    [Obsolete("SplatDev.Umbraco.Plugins.CodeFirst is deprecated. Use SplatDev.Umbraco.Plugins.Yaml2Schema instead. This package is maintained for backwards compatibility only.")]
    public class CodeFirstEngine : IDisposable
    {
        #region Private Properties
        private readonly IDataTypeService dataTypeService;
        // TODO: DI wiring needed - IUmbracoDatabase replaced by NPoco.IDatabase via ICoreScopeProvider in Umbraco 13+
        private readonly NPoco.IDatabase? umbracoDatabase;
        private readonly IAuditService auditService;
        private readonly IContentService contentService;
        private readonly IContentTypeService contentTypeService;
        private readonly IFileService fileService;
        private readonly ILocalizationService localizationService;
        private readonly IMediaService mediaService;
        private readonly IMemberTypeService memberTypeService;
#if !NET10_0_OR_GREATER
        private readonly IMacroService macroService;
#endif
        private readonly IUserService userService;
        private readonly PropertyEditorCollection propertyEditorCollection;
        private readonly Assembly assembly;
        private readonly NodeHelpers nodeHelper;
        private readonly UmbracoCms.Plugins.MemberGroups.Services.MemberGroupService memberGroupService;
        #endregion

        #region Message Texts
        private const string ISSUE_ORDERING = "There was an issue while ordering the {0}, make sure to check the CreateOrder property on each {0}";
        private const string COMPLETED = "{0} Completed";
        private const string NOTHING_TO_COMPLETE = "No {0} to complete";
        private const string UPDATED = "has been updated";
        private const string EXECUTE = "Execute";
        private const string PROCESS = "Process";
        private const string COPIED_AND_CREATED = "has been copied and created";
        private const string MISSING_REQUIRED = "required but missing";
        #endregion

        #region Dependency Injection Ctors

        // TODO: MembershipHelper removed in Umbraco 13+. Replace with IMemberManager from Umbraco.Cms.Core.Security.
        // TODO: ILogger should be ILogger<CodeFirstEngine> in Umbraco 13+.
        // TODO: Umbraco.Web.Composing.Current.Services static accessor replaced by DI - inject all services as constructor parameters.
#pragma warning disable CS0618
        public CodeFirstEngine(
            IDataTypeService dataTypeService,
            IAuditService auditService,
            IContentService contentService,
            IContentTypeService contentTypeService,
            IFileService fileService,
            ILocalizationService localizationService,
            IMediaService mediaService,
            IMemberTypeService memberTypeService,
#if !NET10_0_OR_GREATER
            IMacroService macroService,
#endif
            IUserService userService,
            PropertyEditorCollection propertyEditorCollection,
            Microsoft.Extensions.Logging.ILogger<CodeFirstEngine> logger,
            string assembly = "")
        {
            this.assembly = string.IsNullOrEmpty(assembly) ? Assembly.GetCallingAssembly() : Assembly.Load(assembly);
            this.memberGroupService = new UmbracoCms.Plugins.MemberGroups.Services.MemberGroupService();
            this.nodeHelper = new NodeHelpers(
                auditService, contentService, contentTypeService, localizationService,
                null, logger);
            this.propertyEditorCollection = propertyEditorCollection;
            this.contentService = contentService;
            this.contentTypeService = contentTypeService;
            this.localizationService = localizationService;
            this.mediaService = mediaService;
            this.memberTypeService = memberTypeService;
#if !NET10_0_OR_GREATER
            this.macroService = macroService;
#endif
            this.fileService = fileService;
            this.dataTypeService = dataTypeService;
            this.userService = userService;
            this.auditService = auditService;
            this.umbracoDatabase = null;
        }
#pragma warning restore CS0618
        #endregion

        #region Database
        public virtual string PostDatabaseTablesExecutes()
        {
            const string METHOD_NAME = "Post Database Tables";
            List<PostDbCreation> types = assembly.GetInherited<PostDbCreation>().ToList();
            if (types.Count > 0)
            {
                foreach (var t in types)
                {
                    var type = t.GetType();
                    var instance = Activator.CreateInstance(type);
                    var get = type.GetMethod(EXECUTE);
                    get!.Invoke(instance, null);
                }
                return string.Format(COMPLETED, METHOD_NAME);
            }
            else
            {
                return string.Format(NOTHING_TO_COMPLETE, METHOD_NAME);
            }
        }

        public string SetNvarcharMax(IEnumerable<PropertyInfo> columns, string tableName)
        {
            const string METHOD_NAME = "Post Database Tables";

            string nvarcharMaxColumns = string.Empty;
            if (columns.Any())
            {
                foreach (var column in columns)
                {
                    nvarcharMaxColumns += SetNvarcharMax(column, tableName) + ", ";
                }
                return string.Format(COMPLETED, METHOD_NAME);
            }
            else
            {
                return string.Format(NOTHING_TO_COMPLETE, METHOD_NAME);
            }

        }

        private string SetNvarcharMax(PropertyInfo column, string tableName)
        {
            string METHOD_NAME;
            try
            {
                METHOD_NAME = "Set Column to Nvarchar";
                umbracoDatabase!.Execute($"ALTER TABLE [{tableName}] ALTER COLUMN [{column.Name}] NVARCHAR(MAX)");
                return string.Format(COMPLETED, METHOD_NAME);
            }
            catch (Exception)
            {
                // NOTE: SqlServerCe is no longer supported in Umbraco 13+. Fallback removed.
                METHOD_NAME = "Set Column to Nvarchar fallback";
                return string.Format(NOTHING_TO_COMPLETE, METHOD_NAME);
            }
        }
        #endregion

        #region Data Types
        /// <summary>
        /// Creates new Custom Data Types from Reflection
        /// </summary>
        /// <returns>String Results from Creation</returns>
        public virtual string CustomDataTypes()
        {
            List<ICustomDataType> types = assembly.GetInherited<ICustomDataType>().ToList();
            if (types?.Count > 0)
            {
                int containerId = -1;

                foreach (var t in types)
                {
                    var type = ((Type)t).GetInstance();
                    var name = type.GetProperty(Constants.DataType.Name).Value<string>();
                    var exists = dataTypeService.GetByEditorAlias(name) != null;

                    if (!exists)
                    {
                        var alias = type.GetProperty(Constants.DataType.Alias).Value<string>();
                        var propertiEditorAlias = type.GetProperty(Constants.DataType.PropertyEditorAlias).Value<string>();
                        var containerName = type.GetProperty(Constants.DataType.Container).Value<string>();
                        var assets = type.GetProperty(Constants.DataType.AssetList).Value<IAssets>();

                        var container = dataTypeService.GetContainers(containerName, 1).FirstOrDefault();

                        if (container == null)
                        {
                            var dataTypeContainer = dataTypeService.CreateContainer(containerId, Guid.NewGuid(), containerName);

                            if (dataTypeContainer.Success)
                                containerId = dataTypeContainer.Result!.Entity!.Id;
                        }
                        else
                        {
                            containerId = container.Id;
                        }

                        IDataType? dataType = null;

                        var created = propertyEditorCollection.TryGet(propertiEditorAlias, out IDataEditor? editor);
                        if (created)
                        {
                            dataType = new DataType(editor!, dataTypeService)
                            {
                                Name = name
                            };
                            dataTypeService.Save(dataType);

                            auditService.Add(AuditType.Save, -1, dataType.Id, Constants.DataType.OBJECT_TYPE, $"{Constants.DataType.OBJECT_TYPE} {name} {UPDATED}");
                        }
                        else
                        {
                            auditService.Add(AuditType.New, -1, dataType?.Id ?? -1, Constants.DataType.OBJECT_TYPE, $"{Constants.DataType.OBJECT_TYPE} {name} {COPIED_AND_CREATED}");
                            // will need to restart the app, in order to force a refresh to attempt to create the data type again
                            if (!IISHelpers.RestartApplicationPool())
                                IISHelpers.ForceWebConfigRefresh();
                        }
                    }
                }
                return string.Format(COMPLETED, Constants.DataType.OBJECT_TYPE);
            }
            return string.Format(NOTHING_TO_COMPLETE, Constants.DataType.OBJECT_TYPE); ;
        }

        #endregion

        #region Content
        /// <summary>
        /// Creates new Content Nodes
        /// </summary>
        /// <returns>String Results from Creation</returns>
        public virtual string ContentNodes()
        {
            List<IContentNode> nodes = assembly.GetInherited<IContentNode>().ToList();

            if (nodes?.Count > 0)
            {
                var orderedNodes = nodes.OrderByCreateOrderProperty();

                foreach (var node in orderedNodes)
                {
                    var nodeName = node.GetProperty(Constants.ContentNode.Name).Value<string>();
                    var nodeAlias = node.GetProperty(Constants.ContentNode.DocumentTypeAlias).Value<string>();
                    var docType = node.GetProperty(Constants.ContentNode.DocumentType).Value<IDocumentType>();

                    if (docType == null && string.IsNullOrEmpty(nodeAlias)) throw new MissingMemberException("Either DocumentTypeAlias or DocumentType is required");

                    var attribute = docType?.GetType().GetCustomAttribute<DocumentTypeAttribute>(false);
                    var documentTypeAlias = docType == null ? nodeAlias : attribute!.Value<string>("Alias");

                    int? parentNodeId = node.GetProperty(Constants.ContentNode.ParentNodeId).Value<int?>();
                    var parentNodeAlias = node.GetProperty(Constants.ContentNode.ParentNodeAlias).Value<string>();
                    var parentNodeName = node.GetProperty(Constants.ContentNode.ParentNodeName).Value<string>();

                    IContent? parent = null;

                    if (parentNodeId.HasValue) parent = contentService.GetById(parentNodeId.Value);
                    else if (!string.IsNullOrEmpty(parentNodeAlias))
                    {
                        parent = nodeHelper.GetNodeOfType(parentNodeAlias, parentNodeName);
                    }

                    var parentId = parent != null ? parent.Id : -1;
                    var parentUdi = nodeHelper.GetNodeUdi(parentId);
                    IContent? thisNode = null;

                    if (contentService.CountChildren(parentId, documentTypeAlias) > 0)
                    {
                        thisNode = nodeHelper.GetDescendantsOfType(documentTypeAlias, parentId).SingleOrDefault(x => x.Name!.Equals(nodeName) && x.ContentType.Alias.Equals(documentTypeAlias));
                        thisNode = thisNode ?? contentService.CreateContent(nodeName, parentUdi, documentTypeAlias);
                    }
                    else
                    {
                        thisNode = contentService.CreateContent(nodeName, parentUdi, documentTypeAlias);
                    }

                    foreach (var property in node.GetType().GetProperties())
                    {
                        var instance = property.DeclaringType!.GetInstance();
                        if (property.GetCustomAttribute<ContentNodePropertyAttributes>() != null)
                        {
                            if (property.GetCustomAttribute<ContentNodePropertyAttributes>().Value<string>(Constants.ContentNode.DocumentTypePropertyAlias) != null &&
                                thisNode.HasProperty(property.GetCustomAttribute<ContentNodePropertyAttributes>().Value<string>(Constants.ContentNode.DocumentTypePropertyAlias)))
                            {
                                thisNode.SetValue(property.GetCustomAttribute<ContentNodePropertyAttributes>().Value<string>(Constants.ContentNode.DocumentTypePropertyAlias), instance.GetProperty(property.Name).Value());
                            }
                        }
                    }

                    contentService.Save(thisNode);
                }
                return "Content Nodes Created";
            }
            return "No Content Nodes to Create";
        }

        /// <summary>
        /// Copy contents from Assembly into Specified Folders
        /// </summary>
        /// <returns>String Results from Creation</returns>
        public virtual string CopyContent()
        {
            var list = GetListOfAssets(AssetTypes.All);

            if (list?.Count > 0)
            {
                //Copy physical files to destination
                assembly.ExtractAsset(list);

                return "Content Copied";
            }
            return "No Content to copy";
        }

        /// <summary>
        /// Creates templates in Umbraco
        /// </summary>
        /// <returns></returns>
        public virtual string Templates()
        {
            var list = GetListOfAssets(AssetTypes.Template);
            if (list?.Count > 0)
            {
                //create templates in Umbraco
                foreach (var template in list)
                {
                    if (fileService.GetTemplate(template.Alias) == null)
                    {
                        //then create the template
                        Template newTemplate = new Template(template.Name, template.Alias);
                        fileService.SaveTemplate(newTemplate);
                    }
                }
                return "Templates Created";
            }
            return "No templates to create";
        }

        /// <summary>
        /// Creates Templates from Reflection
        /// </summary>
        /// <param name="resourceType"></param>
        /// <returns>String Results from Creation</returns>
        private List<Asset> GetListOfAssets(AssetTypes resourceType)
        {
            var assetsList = assembly.GetInherited<IAssets>();
            var list = new List<Asset>();
            foreach (var type in assetsList)
            {
                var instance = type.GetType().GetInstance();
                var resources = instance.GetProperty("Resources").ValueCollection<Asset>();
                if (resources != null)
                {
                    foreach (var resource in resources)
                    {
                        if (resource.AssetType == resourceType || resourceType == AssetTypes.All)
                            list.Add(resource);
                    }
                }
            }
            return list;
        }

        #endregion

        #region Document Types
        /// <summary>
        /// Creates new Document Types from Reflection
        /// </summary>
        /// <returns>String Results from Creation</returns>
        public virtual string DocumentTypes()
        {
            List<IDocumentType> documentTypes = assembly.GetInherited<IDocumentType>().ToList();

            if (documentTypes?.Count > 0)
            {
                int containerId = -1;
                IDocumentType[]? orderedDocumentTypes = null;

                try
                {
                    orderedDocumentTypes = documentTypes.OrderByCreateOrderProperty();
                }
                catch (ArgumentException)
                {
                    throw new Exception(string.Format(ISSUE_ORDERING, Constants.DocumentType.OBJECT_TYPE));
                }

                foreach (var documentType in orderedDocumentTypes)
                {
                    var type = documentType.GetType();
                    var attribute = type.GetCustomAttribute<DocumentTypeAttribute>(false);
                    var level = attribute.Value<int?>(Constants.DocumentType.ContainerLevel);
                    ContentType docType;

                    var name = attribute.Value<string>(Constants.DocumentType.Container);
                    var container = contentTypeService.GetContainers(name, level ?? 1).FirstOrDefault();

                    if (container == null)
                    {
                        var newcontainer = contentTypeService.CreateContainer(level ?? -1, Guid.NewGuid(), name);

                        if (newcontainer.Success)
                            containerId = newcontainer.Result!.Entity!.Id;
                    }
                    else
                    {
                        containerId = container.Id;
                    }

                    var alias = attribute.Value<string>(Constants.DocumentType.Alias);
                    var exists = contentTypeService.GetAll().Any(x => x.Alias == alias);

                    if (!exists)
                    {
                        docType = new ContentType(containerId);
                    }
                    else
                    {
                        docType = (ContentType)contentTypeService.Get(alias)!;
                    }


                    //http://refreshwebsites.co.uk/blog/umbraco-document-types-explained-in-60-seconds/
                    //https://our.umbraco.org/forum/developers/api-questions/43278-programmatically-creating-a-document-type

                    docType.Name = attribute.Value<string>(Constants.DocumentType.Name);
                    docType.Alias = alias;
                    docType.AllowedAsRoot = attribute.Value<bool>(Constants.DocumentType.AllowAtRoot);
                    docType.Description = attribute.Value<string>(Constants.DocumentType.Description);
                    docType.Icon = attribute.Value<string>(Constants.DocumentType.Icon);
                    docType.SortOrder = attribute.Value<int>(Constants.DocumentType.SortOrder);

                    var children = documentType.GetProperty(Constants.DocumentType.Children).ValueCollection<IDocumentType>();
                    if (children != null)
                    {
                        List<ContentTypeSort> ids = new List<ContentTypeSort>();
                        foreach (var child in children)
                        {
                            string _alias = child.GetType().GetCustomAttribute<DocumentTypeAttribute>(false).Value<string>(Constants.DocumentType.Alias);
                            var content = contentTypeService.Get(_alias);
                            ids.Add(new ContentTypeSort(content!.Id, content.SortOrder));
                            //TODO: change logic to create child if it does not exist
                        }
                        docType.AllowedContentTypes = ids;
                    }

                    //Set templates for document type
                    var templates = documentType.GetProperty(Constants.DocumentType.TemplatesAliases).ValueCollection<string>();
                    var stronglyTypedTemplates = new List<ITemplate>();

                    if (templates != null)
                    {
                        foreach (var template in templates)
                        {
                            var t = fileService.GetTemplate(template);
                            if (t != null) stronglyTypedTemplates.Add(t);
                        }
                    }

                    if (stronglyTypedTemplates.Count > 0)
                    {
                        docType.AllowedTemplates = stronglyTypedTemplates;
                        docType.SetDefaultTemplate(stronglyTypedTemplates[0]);
                    }

                    //Set  Document Type Properties
                    var documentTypeProperties = documentType.GetProperty(Constants.DocumentType.Properties).Value<IDocumentTypeProperties>()?.GetType();
                    if (documentTypeProperties != null)
                    {
                        PropertiesHelpers.AddProperties<DocumentTypePropertyAttributesAttribute>(documentTypeProperties.GetAllProperties(), docType, dataTypeService);
                    }
                    contentTypeService.Save(docType);
                }

                return string.Format(COMPLETED, Constants.DocumentType.OBJECT_TYPE);
            }
            return string.Format(NOTHING_TO_COMPLETE, Constants.DocumentType.OBJECT_TYPE);
        }
        #endregion

        #region Media
        /// <summary>
        /// Creates Media Items from Reflection
        /// </summary>
        /// <returns>String Results from Creation</returns>
        public virtual string Media()
        {
            List<IMediaNode> types = assembly.GetInherited<IMediaNode>().ToList();
            if (types.Count > 0)
            {
                foreach (var type in types)
                {
                    var mediaNode = type.GetType().GetInstance<IMediaNode>();
                    mediaNode.Stream = AssetHelpers.GetStream(assembly, mediaNode.Name, "Content.Media");
                    switch (mediaNode.MediaType)
                    {
                        case Default.MediaTypes.Alias.Folder:
                            MediaHelpers.AddFolder(mediaNode.Name, mediaNode.ParentNode.Value, mediaService);
                            break;
                        case Default.MediaTypes.Alias.Custom:
                            MediaHelpers.CreateMedia(mediaNode.Stream, mediaNode.Name, mediaNode.CustomMediaTypeAlias, mediaNode.ParentNode.Value, mediaService);
                            break;
                        case Default.MediaTypes.Alias.Image:
                        case Default.MediaTypes.Alias.File:
                        default:
                            var parentId = mediaNode.ParentNode ?? -1;
                            var level = mediaNode.Level ?? 1;
                            if (!string.IsNullOrEmpty(mediaNode.ParentNodeAlias))
                            {
                                var parent = mediaService.GetByLevel(level).SingleOrDefault(x => x.Name == mediaNode.ParentNodeName);
                                if (parent == null)
                                {
                                    parentId = MediaHelpers.AddFolder(mediaNode.ParentNodeName, parentId, mediaService);
                                }
                                else
                                {
                                    parentId = parent.Id;
                                }
                            }
                            MediaHelpers.CreateMedia(mediaNode.Stream, mediaNode.Name, mediaNode.MediaType, parentId, mediaService);
                            break;
                    }
                }
                return string.Format(COMPLETED, Constants.MediaType.OBJECT_TYPE);
            }
            else
            {
                return string.Format(NOTHING_TO_COMPLETE, Constants.MediaType.OBJECT_TYPE); ;
            }
        }

        /// <summary>
        /// Creates new Media Types from Reflection
        /// </summary>
        /// <returns>String Results from Creation</returns>
        public virtual string MediaTypes()
        {
            List<Interfaces.IMediaType> types = assembly.GetInherited<Interfaces.IMediaType>().ToList();
            if (types.Count > 0)
            {
                foreach (var type in types)
                {
                    var mediaType = type.GetType().GetInstance<Interfaces.IMediaType>();
                    MediaHelpers.AddMediaType(mediaType, mediaType.PropertyGroupName, dataTypeService, null);
                }
                return string.Format(COMPLETED, Constants.MediaType.OBJECT_TYPE);
            }
            else
            {
                return string.Format(NOTHING_TO_COMPLETE, Constants.MediaType.OBJECT_TYPE); ;
            }
        }
        #endregion

        #region Members
        public virtual string MemberGroups()
        {
            List<Interfaces.IMemberGroup> types = assembly.GetInherited<Interfaces.IMemberGroup>().ToList();
            if (types.Count > 0)
            {
                foreach (var memberGroup in types)
                {
                    var m = memberGroup.GetType().GetInstance<Interfaces.IMemberGroup>();
                    memberGroupService?.SaveMemberGroup(m.GroupName);
                }
                return string.Format(COMPLETED, Constants.MemberGroup.OBJECT_TYPE);
            }
            else
            {
                return string.Format(NOTHING_TO_COMPLETE, Constants.MemberGroup.OBJECT_TYPE);
            }
        }

        /// <summary>
        /// Creates new Member from Reflection
        /// </summary>
        /// <returns>String Results from Creation</returns>
        public virtual string Members()
        {
            List<Interfaces.IMember> types = assembly.GetInherited<Interfaces.IMember>().ToList();
            if (types.Count > 0)
            {
                foreach (var member in types)
                {
                    var m = member.GetType().GetInstance<Interfaces.IMember>();

                    if (m.Type == null && string.IsNullOrEmpty(m.TypeAlias)) throw new MissingMemberException($"{Constants.Member.Type} or {Constants.Member.TypeAlias} {MISSING_REQUIRED}");
                    var typeAlias = m.Type == null ? m.TypeAlias : m.Type.MemberTypeAlias;

                    if (m.Group == null && string.IsNullOrEmpty(m.GroupName)) throw new MissingMemberException($"{Constants.Member.Group} or {Constants.Member.GroupName} {MISSING_REQUIRED}");
                    var groupName = m.Group == null ? m.GroupName : m.Group.GroupName;

                    memberGroupService?.RegisterMember(m.Name, m.Email, m.Password, typeAlias, groupName, m.Username);

                    var mm = memberGroupService?.GetByEmail(m.Email);

                    foreach (var property in m.Properties.GetType().GetProperties())
                    {
                        if (property.GetCustomAttribute<MemberNodePropertyAttribute>() != null)
                        {
                            var propName = property.GetCustomAttribute<MemberNodePropertyAttribute>().Value<string>(Constants.Member.MemberTypePropertyAlias);
                            if (propName != null && mm != null && mm.HasProperty(propName))
                            {
                                mm.SetValue(propName, m.Properties.GetType().GetProperty(property.Name)!.Value());
                            }
                        }
                    }

                    if (mm != null) memberGroupService?.SaveMember(mm);
                }
                return string.Format(COMPLETED, Constants.Member.OBJECT_TYPE);
            }
            else
            {
                return string.Format(NOTHING_TO_COMPLETE, Constants.Member.OBJECT_TYPE);
            }
        }

        /// <summary>
        /// Creates new Member Types from Reflection
        /// </summary>
        /// <returns>String Results from Creation</returns>
        public virtual string MemberTypes()
        {
            List<Interfaces.IMemberType> types = assembly.GetInherited<Interfaces.IMemberType>().ToList();
            if (types.Count > 0)
            {
                foreach (var memberType in types)
                {
                    var m = memberType.GetType().GetInstance<Interfaces.IMemberType>();
                    if (memberGroupService != null && !memberGroupService.MemberTypeExists(m.MemberTypeAlias))
                    {
                        memberGroupService.SaveMemberType(m.ParentGroupAlias, m.MemberTypeAlias, m.MemberTypeName, m.Description, m.Icon);
                    }
                    //Set member Properties
                    var mType = memberTypeService.GetAll()?.Single(x => x.Alias == m.MemberTypeAlias);

                    if (mType != null)
                    {
                        var memberProperties = m.Properties.GetType()?.GetAllProperties();
                        PropertiesHelpers.AddMemberProperties<MemberPropertyAttributesAttribute>(memberProperties, mType, dataTypeService);
                    }
                    memberGroupService?.SaveMemberType(mType);
                }
                return string.Format(COMPLETED, Constants.MemberType.OBJECT_TYPE);
            }
            else
            {
                return string.Format(NOTHING_TO_COMPLETE, Constants.MemberType.OBJECT_TYPE);
            }
        }
        #endregion

        #region Macros
        public virtual string Macros()
        {
#if !NET10_0_OR_GREATER
            List<Interfaces.IMacro> types = assembly.GetInherited<Interfaces.IMacro>().ToList();
            if (types.Count > 0)
            {
                foreach (var type in types)
                {
                    var macro = type.GetType().GetInstance<Interfaces.IMacro>();
                    MacroHelpers.CreateMacro(macroService, macro);
                }
                return string.Format(COMPLETED, Constants.Macros.OBJECT_TYPE);
            }
            return string.Format(NOTHING_TO_COMPLETE, Constants.Macros.OBJECT_TYPE);
#else
            return "Macros are not supported in Umbraco 17+";
#endif
        }
        #endregion

        #region Users
        /// <summary>
        /// Creates new Users from Reflection
        /// </summary>
        /// <returns>String Results from Creation</returns>
        public virtual string Users()
        {
            List<IUser> users = assembly.GetInherited<IUser>().ToList();
            if (users?.Count > 0)
            {
                foreach (var user in users)
                {
                    var username = user.GetProperty(Constants.User.Username).Value<string>();

                    if (!userService.Exists(username))
                    {
                        var name = user.GetProperty(Constants.User.Name).Value<string>();
                        var pwd = user.GetProperty(Constants.User.Password).Value<string>();
                        var email = user.GetProperty(Constants.User.Email).Value<string>();
                        var userType = user.GetProperty(Constants.User.Group).Value<UserTypes>();
                        var startContentNodeAlias = user.GetProperty(Constants.User.StartContentNodeAlias).Value<string>();
                        var startContentNodeName = user.GetProperty(Constants.User.StartContentNodeName).Value<string>();
                        var startMediaNodeName = user.GetProperty(Constants.User.StartMediaNodeName).Value<string>();
                        var group = userService.GetUserGroupByAlias(userType.GroupToString());

                        var newUser = memberGroupService!.CreateUser(new Plugins.MemberGroups.Models.User
                        {
                            Name = name,
                            Password = pwd,
                            Email = email,
                            Group = group!.Name
                        });
                        userService.Save(newUser);

                        var userContentRoot = nodeHelper.GetNodeOfType(startContentNodeAlias, startContentNodeName);
                        var userMediaRoot = MediaHelpers.GetFolderId(startMediaNodeName);

                        newUser.StartContentIds = new int[] { userContentRoot!.Id };
                        newUser.StartMediaIds = new int[] { userMediaRoot };
                    }
                }
                return string.Format(COMPLETED, Constants.User.OBJECT_TYPE);
            }
            return string.Format(NOTHING_TO_COMPLETE, Constants.User.OBJECT_TYPE);
        }
        #endregion

        #region Dictionary
        public virtual string CreateDictionaries()
        {
            List<Interfaces.IDictionaryItem> types = assembly.GetInherited<Interfaces.IDictionaryItem>().ToList();
            if (types?.Count > 0)
            {
                foreach (var item in types)
                {
                    var keyString = item.GetProperty(Constants.DictionaryItem.Key).Value<string>();
                    var value = item.GetProperty(Constants.DictionaryItem.Value).Value<string>();
                    var parentKey = item.GetProperty(Constants.DictionaryItem.ParentKey)?.Value<string>();
                    var dicItem = localizationService.GetDictionaryItemByKey(keyString) ?? new DictionaryItem(keyString);

                    var lang = localizationService.GetLanguageByIsoCode(item.GetProperty(Constants.DictionaryItem.LanguageCode).Value<string>());
                    if (lang == null)
                    {
                        lang = new Language(item.GetProperty(Constants.DictionaryItem.LanguageCode).Value<string>());
                        localizationService.Save(lang);
                    }

                    List<IDictionaryTranslation> translations = new List<IDictionaryTranslation>();
                    foreach (var translation in item.GetProperty(Constants.DictionaryItem.Translations).Value<Dictionary<string, string>>() ?? new Dictionary<string, string>())
                    {
                        var translationLanguage = localizationService.GetLanguageByIsoCode(translation.Key);
                        if (translationLanguage == null)
                        {
                            translationLanguage = new Language(translation.Key);
                            localizationService.Save(translationLanguage);
                        }
                        var trans = new DictionaryTranslation(translationLanguage, translation.Value);
                        translations.Add(trans);
                    }
                    dicItem.Translations = translations;
                    if (!string.IsNullOrEmpty(parentKey))
                    {
                        var parentGuid = localizationService.GetDictionaryItemByKey(parentKey)?.GetUdi().Guid;
                        if (parentGuid != null)
                        {
                            dicItem.ParentId = parentGuid;
                        }
                    }
                    localizationService.AddOrUpdateDictionaryValue(dicItem, lang, value);
                    localizationService.Save(dicItem);
                }
                return string.Format(COMPLETED, Constants.DictionaryItem.OBJECT_TYPE);
            }
            return string.Format(NOTHING_TO_COMPLETE, Constants.DictionaryItem.OBJECT_TYPE);
        }
        #endregion

        #region Post Setup Changes

        public virtual string PostSetupChanges()
        {
            const string METHOD_NAME = "Post Setup Changes";
            List<IPostSetupChange> changes = assembly.GetInherited<IPostSetupChange>().ToList();
            if (changes?.Count > 0)
            {
                foreach (var type in changes)
                {
                    var t = type.GetType();
                    var instance = t.GetInstance();
                    var get = t.GetMethod(PROCESS, BindingFlags.InvokeMethod);
                    get!.Invoke(instance, null);
                }
                return string.Format(COMPLETED, METHOD_NAME);
            }
            return string.Format(NOTHING_TO_COMPLETE, METHOD_NAME);
        }
        #endregion

        #region Dispose
        private readonly SafeHandle handle = new SafeFileHandle(IntPtr.Zero, true);
        private bool disposed = false;
        /// <summary>
        /// Dispose Method
        /// </summary>
        public void Dispose()
        {
            // Dispose of unmanaged resources.
            Dispose(true);
            // Suppress finalization.
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposed)
                return;

            if (disposing)
            {
                handle.Dispose();
            }

            disposed = true;
        }

        #endregion
    }
}
