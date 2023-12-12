using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ResidentMandatory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "StudentCalendarDistanceGroup1Mandatory",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StudentCalendarDistanceGroup2Mandatory",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StudentCalendarDistanceGroup3Mandatory",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StudentCalendarResidentMandatory",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StudentCalendarDistanceGroup1Mandatory",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarDistanceGroup2Mandatory",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarDistanceGroup3Mandatory",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarResidentMandatory",
                table: "Activities");
        }
    }
}
