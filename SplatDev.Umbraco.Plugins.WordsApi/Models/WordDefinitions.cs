namespace SplatDev.Umbraco.Plugins.WordsApi.Models
{
    public class WordDefinitions
    {
        public string Word { get; set; } = string.Empty;
        public DefinitionDetails[] Definitions { get; set; } = Array.Empty<DefinitionDetails>();

        public class DefinitionDetails
        {
            public string Definition { get; set; } = string.Empty;
            public string PartOfSpeech { get; set; } = string.Empty;
        }

    }
}
