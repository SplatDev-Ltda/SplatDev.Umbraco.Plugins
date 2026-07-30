namespace SplatDev.Umbraco.Plugins.PdfCurator.Models;

public class PdfCuratorOptions
{
    public const string SectionName = "PdfCurator";

    public string ApiBase { get; set; } = "/umbraco/pdfcurator/api/v1";

    public string LibraryRoot { get; set; } = "wwwroot/uploads/pdfs";
}
