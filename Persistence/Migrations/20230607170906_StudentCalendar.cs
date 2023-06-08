using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class StudentCalendar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CopiedTostudentCalendar",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StudentCalendarMandatory",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "StudentCalendarNotes",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentCalendarPresenter",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentCalendarUniform",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CopiedTostudentCalendar",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarMandatory",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarNotes",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarPresenter",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "StudentCalendarUniform",
                table: "Activities");
        }
    }
}
