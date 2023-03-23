using CsvHelper.Configuration;

namespace Application.ImportLegacyData
{
    public class LegacyEEMDataMap : ClassMap<LegacyEEMData>
    {
        public LegacyEEMDataMap()
        {
            Map(m => m.Title).Name("Title");
            Map(m => m.Start).Name("Start Time");
            Map(m => m.End).Name("End Time");
            Map(m => m.Resources).Name("Resources-");
            Map(m => m.ActionOfficer).Name("Action Officer");
            Map(m => m.LeadOrg).Name("Lead Org");
            Map(m => m.SubCalendar).Name("Sub Calendar");
            Map(m => m.ActionOfficerPhone).Name("Action Officer Duty Phone");
            Map(m => m.EventDetails).Name("Event Details");
            Map(m => m.Location).Name("Location");
            Map(m => m.AllDayEvent).Name("All Day Event").TypeConverter<BooleanConverter>();
            Map(m => m.IMC).Name("IMC").TypeConverter<BooleanConverter>();
            Map(m => m.CateringBreakArea22).Name("22nd Break Area").TypeConverter<BooleanConverter>();
            Map(m => m.CateringBreakArea18).Name("18th Break Area").TypeConverter<BooleanConverter>();
            Map(m => m.CheckedForOpsec).Name("Checked For OPSEC").TypeConverter<BooleanConverter>();
            Map(m => m.CommunityEvent).Name("Community Event?").TypeConverter<BooleanConverter>();
            Map(m => m.CopiedToUSAHECCalendar).Name("Copy to USAHEC Calendar").TypeConverter<BooleanConverter>();
            Map(m => m.CSLDirectorate).Name("CSL Directorate");
            Map(m => m.GarrisonCategory).Name("Garrison Category");
            Map(m => m.GOSESInAttendance).Name("GO/SES in Attendance").TypeConverter<BooleanConverter>();
            Map(m => m.GarrisonCategory).Name("USAHEC Calendar Category");
            Map(m => m.EducationalCategory).Name("Educational Categories");
            Map(m => m.EventClearanceLevel).Name("Event Clearance Level");
            Map(m => m.MarketingRequest).Name("Marketing Request").TypeConverter<BooleanConverter>();
            Map(m => m.MFP).Name("MFP").TypeConverter<BooleanConverter>();
            Map(m => m.SSLCategories).Name("SSL Categories");
            Map(m => m.Education).Name("Supports Education and/or Simulation").TypeConverter<BooleanConverter>();
            Map(m => m.ApprovedByOPS).Name("Approved by OPS");
        }
    }
}
