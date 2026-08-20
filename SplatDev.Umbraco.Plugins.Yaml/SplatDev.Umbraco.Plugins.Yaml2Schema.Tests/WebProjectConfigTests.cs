using Xunit;
using System.IO;
using System.Linq;
using SplatDev.Umbraco.Plugins.Yaml2Schema.Services;
using SplatDev.Umbraco.Plugins.Yaml2Schema.Models;

namespace SplatDev.Umbraco.Plugins.Yaml2Schema.Tests
{
    /// <summary>
    /// Smoke tests that parse the actual web project YAML config and verify its structure.
    /// The file is linked in the .csproj as fixtures/web-config.yml.
    /// </summary>
    public class WebProjectConfigTests
    {
        private readonly string _webConfigPath = Path.Combine(
            AppContext.BaseDirectory, "fixtures", "web-config.yml");

        private UmbracoConfig Parse()
        {
            Assert.True(File.Exists(_webConfigPath), $"Web config fixture not found: {_webConfigPath}");
            return new YamlParser().ParseYaml(_webConfigPath).Umbraco;
        }

        // ── Structure ─────────────────────────────────────────────────────────

        [Fact]
        public void WebConfig_ShouldParseWithoutError()
        {
            var result = Parse();
            Assert.NotNull(result);
        }

        [Fact]
        public void WebConfig_ShouldHaveDataTypes()
        {
            var result = Parse();
            Assert.NotNull(result.DataTypes);
            Assert.NotEmpty(result.DataTypes);
        }

        [Fact]
        public void WebConfig_ShouldHaveTwoDataTypes()
        {
            var result = Parse();
            Assert.Equal(2, result.DataTypes.Count);
        }

        [Fact]
        public void WebConfig_DataTypeAliasesAreCorrect()
        {
            var result = Parse();
            var aliases = result.DataTypes.Select(dt => dt.Alias).ToList();
            Assert.Contains("textString", aliases);
            Assert.Contains("richText", aliases);
        }

        [Fact]
        public void WebConfig_ShouldHaveTwoDocumentTypes()
        {
            var result = Parse();
            Assert.Equal(2, result.DocumentTypes.Count);
        }

        [Fact]
        public void WebConfig_DocumentTypesHaveTabsAndProperties()
        {
            var result = Parse();
            foreach (var dt in result.DocumentTypes)
            {
                Assert.NotEmpty(dt.Tabs);
                Assert.All(dt.Tabs, tab => Assert.NotEmpty(tab.Properties));
            }
        }

        [Fact]
        public void WebConfig_ShouldHaveTwoTemplates()
        {
            var result = Parse();
            Assert.Equal(2, result.Templates.Count);
        }

        [Fact]
        public void WebConfig_TemplateAliasesAreCorrect()
        {
            var result = Parse();
            var aliases = result.Templates.Select(t => t.Alias).ToList();
            Assert.Contains("page", aliases);
            Assert.Contains("article", aliases);
        }

        // ── Content ───────────────────────────────────────────────────────────

        [Fact]
        public void WebConfig_ShouldHaveOneRootContentItem()
        {
            var result = Parse();
            Assert.Single(result.Content);
        }

        [Fact]
        public void WebConfig_RootContentIsHome()
        {
            var result = Parse();
            var home = result.Content[0];
            Assert.Equal("home", home.Alias);
            Assert.Equal("Home", home.Name);
            Assert.True(home.Published);
        }

        [Fact]
        public void WebConfig_HomeHasChildren()
        {
            var result = Parse();
            var home = result.Content[0];
            Assert.NotEmpty(home.Children);
        }

        [Fact]
        public void WebConfig_HomeChildIsAbout()
        {
            var result = Parse();
            var about = result.Content[0].Children.FirstOrDefault(c => c.Alias == "about");
            Assert.NotNull(about);
            Assert.Equal("About", about!.Name);
        }

        // ── No REMOVE/UPDATE flags in the web config ──────────────────────────

        [Fact]
        public void WebConfig_NoDataTypesHaveRemoveOrUpdateFlags()
        {
            var result = Parse();
            Assert.All(result.DataTypes, dt =>
            {
                Assert.False(dt.Remove);
                Assert.False(dt.Update);
            });
        }
    }
}
