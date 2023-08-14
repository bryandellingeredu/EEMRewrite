using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EventPlanningResources : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EventPlanningNotifyPOC",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningNumOfBYADS",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningNumOfMonitors",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningNumOfPC",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningNumOfPeripherals",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningNumOfPrinters",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventPlanningNumOfVOIPs",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventPlanningNotifyPOC",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNumOfBYADS",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNumOfMonitors",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNumOfPC",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNumOfPeripherals",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNumOfPrinters",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventPlanningNumOfVOIPs",
                table: "Activities");
        }
    }
}
