using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.EmailGroups
{
    public class EmailGroupMemberDTO
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }
        public List<EmailGroupDTO> EmailGroups { get; set; } 
    }
}
