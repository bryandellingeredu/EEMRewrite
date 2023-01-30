using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain
{
    public class EmailGroupEmailGroupMemberJunction
    {
        public Guid Id {get; set;}
        public Guid EmailGroupId {get; set;}
        public EmailGroup EmailGroup {get; set;}
        public Guid EmailGroupMemberId {get; set;}
        public EmailGroupMember EmailGroupMember {get; set;}

    }
}