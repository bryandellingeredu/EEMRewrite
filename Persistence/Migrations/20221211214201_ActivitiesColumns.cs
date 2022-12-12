using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class ActivitiesColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AmbassadorRequested",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ApprovedByOPS",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AutomationComments",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AutomationCopiers",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AutomationPC",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AutomationProjection",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AutomationTaping",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CSLDirectorateCSL",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CSLDirectorateDSW",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CSLDirectorateDTI",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CSLDirectorateFellows",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CSLDirectorateOPS",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CSLDirectorateSLFG",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CSMRequested",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Catering",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CateringArea18",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CateringArea22",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CateringAreaArdennes",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CateringBreakArea18",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CateringBreakArea22",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CateringComments",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CommandantRequested",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CommunicationComments",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommunicationSupport",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CommunityEvent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DTI",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DeanRequested",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DptCmdtRequested",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Education",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EducationalCategory",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventClearanceLevel",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FaxClassification",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IMC",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MFP",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OtherComments",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PAX",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ParkingPasses",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ParticipationCmdt",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ParticipationDir",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ParticipationForeign",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ParticipationGO",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ProvostRequested",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Registration",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationLocation",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Report",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RoomRequirement1",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RoomRequirement2",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RoomRequirement3",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RoomRequirementBasement",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "SecurityAfterDutyAccess",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "SecurityBadgeIssue",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SecurityComments",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SuppliesComments",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Transportation",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransportationComments",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmbassadorRequested",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ApprovedByOPS",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "AutomationComments",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "AutomationCopiers",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "AutomationPC",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "AutomationProjection",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "AutomationTaping",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSLDirectorateCSL",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSLDirectorateDSW",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSLDirectorateDTI",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSLDirectorateFellows",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSLDirectorateOPS",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSLDirectorateSLFG",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSMRequested",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Catering",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CateringArea18",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CateringArea22",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CateringAreaArdennes",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CateringBreakArea18",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CateringBreakArea22",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CateringComments",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CommandantRequested",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CommunicationComments",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CommunicationSupport",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CommunityEvent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DTI",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DeanRequested",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DptCmdtRequested",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Education",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EducationalCategory",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventClearanceLevel",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "FaxClassification",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "IMC",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "MFP",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "OtherComments",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "PAX",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ParkingPasses",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ParticipationCmdt",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ParticipationDir",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ParticipationForeign",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ParticipationGO",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ProvostRequested",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Registration",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RegistrationLocation",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Report",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomRequirement1",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomRequirement2",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomRequirement3",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomRequirementBasement",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "SecurityAfterDutyAccess",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "SecurityBadgeIssue",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "SecurityComments",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "SuppliesComments",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Transportation",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "TransportationComments",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Activities");
        }
    }
}
