using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Person
    {
        public Guid Id { get; set; }
        public int PersonID { get; set; }
        public string PositionTitle { get; set; }
        public string RankAbbreviation { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string BuildingNumber { get; set; }
        public string RoomNumber { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Organization { get; set; }

    }
}
