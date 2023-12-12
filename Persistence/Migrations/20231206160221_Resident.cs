using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Resident : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "StudentCalendarDistanceGroup1",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StudentCalendarDistanceGroup2",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StudentCalendarDistanceGroup3",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StudentCalendarResident",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StudentCalendarDistanceGroup1",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarDistanceGroup2",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarDistanceGroup3",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarResident",
                table: "Activities");
        }
    }
}
