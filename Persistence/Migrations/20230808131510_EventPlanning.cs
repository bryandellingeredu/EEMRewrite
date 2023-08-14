using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EventPlanning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CopiedTocio",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningCIORequirementsComments",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningCellPhones",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningClassification",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningExternalEventName",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningExternalEventPOCContactInfo",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningExternalEventPOCName",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningGovLaptops",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningNetworkNIPR",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningNetworkNTG",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningNetworkNTS",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningNetworkREN",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningNetworkSIPR",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningNetworkWireless",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningPAX",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningPersonalLaptops",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningServers",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningStatus",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningTablets",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CopiedTocio",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningCIORequirementsComments",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningCellPhones",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningClassification",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningExternalEventName",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningExternalEventPOCContactInfo",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningExternalEventPOCName",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningGovLaptops",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNetworkNIPR",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNetworkNTG",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNetworkNTS",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNetworkREN",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNetworkSIPR",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNetworkWireless",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningPAX",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningPersonalLaptops",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningServers",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningStatus",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningTablets",
                table: "Activities");
        }
    }
}
