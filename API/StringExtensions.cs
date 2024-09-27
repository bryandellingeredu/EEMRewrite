namespace API
{
    public static class StringExtensions
    {
        // Custom extension method to handle null, empty, or whitespace strings
        public static string CoalesceWhitespace(this string primary, string fallback) =>
            !string.IsNullOrWhiteSpace(primary) ? primary : fallback;
    }
}
