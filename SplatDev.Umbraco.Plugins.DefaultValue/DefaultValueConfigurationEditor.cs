using Umbraco.Cms.Core.IO;
using Umbraco.Cms.Core.PropertyEditors;

namespace SplatDev.Umbraco.Plugins.DefaultValue;

public class DefaultValueConfigurationEditor : ConfigurationEditor<DefaultValueConfiguration>
{
    public DefaultValueConfigurationEditor(IIOHelper ioHelper) : base(ioHelper)
    {
#if NET10_0_OR_GREATER
        Fields.Add(new ConfigurationField
        {
            Key = "dValue",
            PropertyName = "Default Value",
        });
#else
        Fields.Add(new ConfigurationField
        {
            Key = "dValue",
            Name = "Default Value",
            View = "requiredfield",
            Description = "The value this property is given.",
        });
#endif
    }
}
