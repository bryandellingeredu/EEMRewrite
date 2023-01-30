using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class EmailGroupMember
    {
        public Guid Id {get; set;}
        public string Email {get; set;}
        public string DisplayName {get; set;}
        public IEnumerable<EmailGroupEmailGroupMemberJunction> EmailGroups {get; set;}

    }
}