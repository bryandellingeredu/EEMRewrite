using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Core
{
    public static class TimeZoneHelper
{
    public static DateTime? ToLocalTime(DateTime? value)
    {
        if (value != null)
        {
            return TimeZoneInfo.ConvertTime(value.Value, TimeZoneInfo.Local);
        }
        else
        {
            return null;
        }
    }
}
}