using System.Text.RegularExpressions;

namespace SplatDev.Cache;

public static class PatternMatcher
{
    public static Regex GlobToRegex(string pattern, bool caseInsensitive = true)
    {
        var escaped = Regex.Escape(pattern)
            .Replace("\\*", ".*")
            .Replace("\\?", ".");

        var regex = "^" + escaped + "$";

        var options = RegexOptions.Compiled | RegexOptions.Singleline;
        if (caseInsensitive)
        {
            options |= RegexOptions.IgnoreCase;
        }

        return new Regex(regex, options);
    }

    public static bool IsMatch(string input, string pattern, bool caseInsensitive = true)
    {
        return GlobToRegex(pattern, caseInsensitive).IsMatch(input);
    }
}
