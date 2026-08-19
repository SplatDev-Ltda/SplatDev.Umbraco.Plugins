namespace SplatDev.Umbraco.Plugins.TwoFactor.Services;

/// <summary>
/// RFC 4648 Base32, the encoding authenticator apps use for TOTP shared secrets.
/// </summary>
internal static class Base32
{
    private const string Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    public static string Encode(ReadOnlySpan<byte> data)
    {
        if (data.IsEmpty) return string.Empty;

        // 8 output characters per 5 input bytes, rounded up.
        var result = new System.Text.StringBuilder((data.Length + 4) / 5 * 8);

        int buffer = 0, bitsLeft = 0;
        foreach (var b in data)
        {
            buffer = (buffer << 8) | b;
            bitsLeft += 8;
            while (bitsLeft >= 5)
            {
                result.Append(Alphabet[(buffer >> (bitsLeft - 5)) & 31]);
                bitsLeft -= 5;
            }
        }

        // Flush the remaining bits, left-aligned in the final group.
        if (bitsLeft > 0)
            result.Append(Alphabet[(buffer << (5 - bitsLeft)) & 31]);

        // Authenticator apps accept unpadded secrets, but pad to a multiple of 8 so the
        // value is valid Base32 for anything stricter that reads it back.
        while (result.Length % 8 != 0)
            result.Append('=');

        return result.ToString();
    }

    public static byte[] Decode(string encoded)
    {
        if (string.IsNullOrEmpty(encoded)) return Array.Empty<byte>();

        var trimmed = encoded.TrimEnd('=');
        var output = new List<byte>(trimmed.Length * 5 / 8);

        int buffer = 0, bitsLeft = 0;
        foreach (var c in trimmed)
        {
            var index = Alphabet.IndexOf(char.ToUpperInvariant(c));
            if (index < 0)
                throw new FormatException($"'{c}' is not a Base32 character.");

            buffer = (buffer << 5) | index;
            bitsLeft += 5;
            if (bitsLeft >= 8)
            {
                output.Add((byte)((buffer >> (bitsLeft - 8)) & 0xFF));
                bitsLeft -= 8;
            }
        }

        return output.ToArray();
    }
}
