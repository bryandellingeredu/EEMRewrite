using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class EmailGroup
    {
        public Guid Id {get; set;}
        public string Name{get; set;}
        public IEnumerable<EmailGroupEmailGroupMemberJunction> EmailGroupMembers {get; set;}
    }
}