using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class Attachment
    {
         public int Id { get; set; }
         public byte[] BinaryData {get; set;}
         public string FileName {get;  set;}
         public string FileType {get; set;}

    }
}