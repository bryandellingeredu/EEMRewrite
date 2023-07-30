using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class EnlistedAideCheckList
    {
        public Guid Id { get; set; }
        public Guid ActivityId { get; set; }
        public Activity Activity { get; set; }
        public bool AlcoholEstimate { get; set; }
        public bool PrepareLegalReview {get; set;}
        public bool SendToLegalForApproval { get; set; }
        public bool PreparePRAForm { get; set; }    
        public bool PrepareGuestList { get; set; }
        public bool Prepare4843GuestList { get; set; }
        public bool PrepareMenu { get; set; }
        public bool MenuReviewedByPrincipal { get; set; }
        public bool OrderAlcohol { get; set; }
        public bool GFEBS { get; set; }
        public bool GatherIce { get; set; }
        public bool SweepAndMop { get; set; }
        public bool HighTopsAndTables { get; set; }
        public bool PolishSilver { get; set; }
        public bool CleanCutlery { get; set; }
        public bool CleanPlates { get; set; }
        public bool CleanServiceItems { get; set; }
        public bool NapkinsPressed { get; set; }
        public bool NapkinsRolled { get; set; }
        public bool FoodPrep { get; set; }
        public bool Dust { get; set; }
        public bool Cook { get; set; }
        public bool Coffee { get; set; }
        public bool IceBeverages { get; set; }
        public bool Sterno { get; set; }
        public bool FoodShopping {get; set;}
        public bool TentSetUp {get; set;}

    }
}
