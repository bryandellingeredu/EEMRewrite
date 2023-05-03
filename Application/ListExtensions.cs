using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application
{
    public static class ListExtensions
    {
        public static IEnumerable<List<T>> SplitIntoGroups<T>(this List<T> list, int groupSize)
        {
            for (int i = 0; i < list.Count; i += groupSize)
            {
                yield return list.GetRange(i, Math.Min(groupSize, list.Count - i));
            }
        }
    }
}
