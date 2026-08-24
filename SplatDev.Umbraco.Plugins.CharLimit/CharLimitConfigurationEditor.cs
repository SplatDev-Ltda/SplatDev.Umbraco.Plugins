using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.IO;

namespace SplatDev.Umbraco.Plugins.CharLimit;

public class CharLimitConfigurationEditor : ConfigurationEditor<CharLimitConfiguration>
{
    public CharLimitConfigurationEditor(IIOHelper ioHelper) : base(ioHelper)
    {
        // "limit" is the key the Umbraco 7/8 plugin used and is listed first so it is the
        // one an editor sets; "maxChars" stays for data types configured against this
        // package's 1.x releases.
#if NET10_0_OR_GREATER
        Fields.Add(new ConfigurationField
        {
            Key = "limit",
            PropertyName = "Number of Characters",
        });
        Fields.Add(new ConfigurationField
        {
            Key = "maxChars",
            PropertyName = "Max Characters (legacy)",
        });
        Fields.Add(new ConfigurationField
        {
            Key = "showCountdown",
            PropertyName = "Show Countdown",
        });
        Fields.Add(new ConfigurationField
        {
            Key = "textareaThreshold",
            PropertyName = "Multi-line From",
        });
#else
        Fields.Add(new ConfigurationField { Key = "limit", Name = "Number of Characters", View = "number", Description = "The maximum number of characters allowed." });
        Fields.Add(new ConfigurationField { Key = "maxChars", Name = "Max Characters (legacy)", View = "number", Description = "Used only when Number of Characters is empty." });
        Fields.Add(new ConfigurationField { Key = "showCountdown", Name = "Show Countdown", View = "boolean" });
        Fields.Add(new ConfigurationField { Key = "textareaThreshold", Name = "Multi-line From", View = "number", Description = "Show a multi-line box once the limit reaches this many characters. 0 disables it." });
#endif
    }
}
