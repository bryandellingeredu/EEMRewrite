using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public static class StringExtensions
    {
        // Custom extension method to handle null, empty, or whitespace strings
        public static string CoalesceWhitespace(this string primary, string fallback) =>
            !string.IsNullOrWhiteSpace(primary) ? primary : fallback;
    }
}
