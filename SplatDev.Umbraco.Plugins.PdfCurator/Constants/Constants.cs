namespace SplatDev.Umbraco.Plugins
{
    public static class Constants
    {
        public const string SectionAlias = "PdfCurator.Section";
        public const string ApiBaseRoute = "umbraco/pdfcurator/api/v1";

        public static class Imports
        {
            public const string DEFAULT_IMPORT_FOLDER = "wwwroot\\uploads\\pdfs";
            public const string IMPORT_APP_SETTING = "Imports";
            public const string DONE_FOLDER = "wwwroot\\ebooks";
        }
    }
}
