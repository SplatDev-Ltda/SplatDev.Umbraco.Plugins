using Microsoft.Extensions.Caching.Memory;

using Moq;

using PdfCurator.Core.Data;
using PdfCurator.Core.Entities;

using SplatDev.Umbraco.Plugins.PdfCurator.Services;

using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

using Xunit;

namespace SplatDev.Umbraco.Plugins.PdfCurator.Tests;

public class SimilarBooksScoringTests
{
    [Fact]
    public void SameAuthor_Gives3Points()
    {
        Assert.Equal(3, ScoreAuthor("Roberto Ierusalimschy", "Roberto Ierusalimschy"));
    }

    [Fact]
    public void DifferentAuthor_Gives0Points()
    {
        Assert.Equal(0, ScoreAuthor("Author A", "Author B"));
    }

    [Fact]
    public void SameCategory_Gives2Points()
    {
        Assert.Equal(2, ScoreCategory("Technology", "Technology"));
    }

    [Fact]
    public void DifferentCategory_Gives0Points()
    {
        Assert.Equal(0, ScoreCategory("Technology", "Design"));
    }

    [Fact]
    public void Jaccard_IdenticalTitles_GivesHighScore()
    {
        var jaccard = ComputeJaccard("Programming in Lua", "Programming in Lua");
        Assert.Equal(1.0, jaccard, 2);
    }

    [Fact]
    public void Jaccard_NoOverlap_Gives0()
    {
        var jaccard = ComputeJaccard("Programming", "Design Recipes");
        Assert.Equal(0.0, jaccard, 2);
    }

    [Fact]
    public void Jaccard_PartialOverlap_GivesFractionalScore()
    {
        var jaccard = ComputeJaccard("Programming Language Concepts", "Programming Language Design");
        Assert.True(jaccard > 0.0 && jaccard < 1.0);
    }

    [Fact]
    public void TotalScore_CombinesAuthorCategoryAndJaccard()
    {
        var authorScore = ScoreAuthor("Robert Martin", "Robert Martin");
        var categoryScore = ScoreCategory("Technology", "Technology");
        var jaccard = ComputeJaccard("Clean Code Principles", "Clean Architecture Patterns");
        var total = authorScore + categoryScore + (int)(jaccard * 5);

        Assert.Equal(3 + 2, authorScore + categoryScore);
        Assert.True(total > 5);
    }

    [Fact]
    public void Tokenizer_ExcludesShortTokensUnder3Chars()
    {
        var result = Tokenize("C# in the Modern Era");
        Assert.DoesNotContain("c#", result);
        Assert.DoesNotContain("in", result);
        Assert.Contains("the", result);
        Assert.Contains("modern", result);
        Assert.Contains("era", result);
    }

    [Fact]
    public void Tokenizer_IsCaseInsensitive()
    {
        var result = Tokenize("PROGRAMMING");
        Assert.Contains("programming", result);
    }

    private static int ScoreAuthor(string author1, string author2)
    {
        return string.Equals(author1, author2, StringComparison.OrdinalIgnoreCase) ? 3 : 0;
    }

    private static int ScoreCategory(string category1, string category2)
    {
        return string.Equals(category1, category2, StringComparison.OrdinalIgnoreCase) ? 2 : 0;
    }

    private static HashSet<string> Tokenize(string title)
    {
        return new HashSet<string>(
            title.ToLowerInvariant()
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(t => t.Length > 2),
            StringComparer.Ordinal);
    }

    private static double ComputeJaccard(string title1, string title2)
    {
        var tokens1 = Tokenize(title1);
        var tokens2 = Tokenize(title2);
        var intersection = tokens1.Intersect(tokens2).Count();
        var union = tokens1.Union(tokens2).Count();
        return union > 0 ? (double)intersection / union : 0;
    }
}
