using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CACInfoDTO
    {
        public string Subject { get; set; }
        public string Issuer { get; set; }
        public string CerticateAsString { get; set; }
        public string DodIdNumber { get; set; }
        public string UserName { get; set; }
        public string TempEmail { get; set; }
    }
}
