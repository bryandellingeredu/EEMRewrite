using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class SyncToCalendarNotification
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string StudentType { get; set; }
        public bool CommunityEvent { get; set; }
        public bool MFP { get; set; }
        public bool IMC { get; set; }
        public bool CopiedToacademic { get; set; }
        public bool CopiedToasep { get; set; }
        public bool CopiedTocommandGroup { get; set; }
        public bool CopiedTocommunity { get; set; }
        public bool CopiedTospouse { get; set; }
        public bool CopiedTocsl { get; set; }
        public bool CopiedTocio { get; set; }
        public bool CopiedTogarrison { get; set; }
        public bool CopiedTointernationalfellows {get; set;}
        public bool CopiedTogeneralInterest { get; set; }
        public bool CopiedToholiday { get; set; }
        public bool CopiedTopksoi { get; set; }
        public bool CopiedTosocialEventsAndCeremonies { get; set; }
        public bool CopiedTossiAndUsawcPress { get; set; }
        public bool CopiedTossl { get; set; }
        public bool CopiedTotrainingAndMiscEvents { get; set; }
        public bool CopiedTousahec { get; set; }
        public bool CopiedTousahecFacilitiesUsage { get; set; }
        public bool CopiedTovisitsAndTours { get; set; }
        public bool CopiedTosymposiumAndConferences { get; set; }
        public bool CopiedTobattlerhythm { get; set; }
        public bool CopiedTostaff { get; set; }
        public bool CopiedTostudentCalendar { get; set; }
        public bool CopiedToexec {get; set;}
    }
}
