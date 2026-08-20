using System.IO;
using System.Linq;
using SplatDev.Umbraco.Plugins.Yaml2Schema.Services;
using Xunit;

namespace SplatDev.Umbraco.Plugins.Yaml2Schema.Tests
{
    /// <summary>
    /// Parsing of content nested more than one level deep.
    /// </summary>
    /// <remarks>
    /// This gap was found when SplatDev.Umbraco.Plugins.Yaml2Schema.Tests was added to
    /// SplatDev.Core.sln and ran for the first time. WebProjectConfigTests asserted a
    /// "blog" child with nested articles that the shipped demo config does not contain,
    /// and the integration test that claims to cover nesting asserts the root has no
    /// children and then appends one in memory — which tests List.Add, not the parser.
    /// </remarks>
    public class NestedContentParsingTests
    {
        private readonly string _path = Path.Combine(
            AppContext.BaseDirectory, "fixtures", "nested-content.yml");

        [Fact]
        public void ParseYaml_ReadsGrandchildContent()
        {
            Assert.True(File.Exists(_path), $"Fixture not found: {_path}");
            var umbraco = new YamlParser().ParseYaml(_path).Umbraco;

            var home = Assert.Single(umbraco.Content);
            var blog = Assert.Single(home.Children);
            Assert.Equal("blog", blog.Alias);

            Assert.Equal(2, blog.Children.Count);
            Assert.Equal(new[] { "firstPost", "secondPost" },
                blog.Children.Select(c => c.Alias).ToArray());
        }

        [Fact]
        public void ParseYaml_KeepsPerItemFlagsOnGrandchildren()
        {
            var umbraco = new YamlParser().ParseYaml(_path).Umbraco;
            var posts = umbraco.Content[0].Children[0].Children;

            Assert.True(posts.Single(p => p.Alias == "firstPost").Published);
            Assert.False(posts.Single(p => p.Alias == "secondPost").Published);
        }
    }
}
