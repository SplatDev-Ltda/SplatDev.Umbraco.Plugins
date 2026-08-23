namespace SplatDev.Umbraco.DataTypes.BrazilStates;

/// <summary>
/// The list this data type offers, in one place.
/// </summary>
/// <remarks>
/// Kept outside the version fork so Umbraco 13 and Umbraco 17 cannot drift apart. They
/// already had: the Umbraco 17 branch of this package was an empty stub with a TODO, so
/// installing it on 17 created no data type at all while 13 worked.
/// </remarks>
public static class BrazilStateNames
{
    public static readonly string[] All =
    [
        "Acre",
        "Alagoas",
        "Amapá",
        "Amazonas",
        "Bahia",
        "Ceará",
        "Distrito Federal",
        "Espírito Santo",
        "Goiás",
        "Maranhão",
        "Mato Grosso",
        "Mato Grosso do Sul",
        "Minas Gerais",
        "Pará",
        "Paraíba",
        "Paraná",
        "Pernambuco",
        "Piauí",
        "Rio de Janeiro",
        "Rio Grande do Norte",
        "Rio Grande do Sul",
        "Rondônia",
        "Roraima",
        "Santa Catarina",
        "São Paulo",
        "Sergipe",
        "Tocantins"
    ];
}
