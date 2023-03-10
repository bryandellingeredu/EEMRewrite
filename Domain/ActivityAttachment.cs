using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class ActivityAttachment
    {
         public Guid Id { get; set; }
         public Guid ActivityAttachmentGroupId {get; set;}
         public byte[] BinaryData {get; set;}
         public string FileName {get;  set;}
         public string FileType {get; set;}

    }
}