using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class WeeklyPocket : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PocketCalLessonNumber",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PocketCalNonAcademicEvent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PocketCalNotes",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PocketCalPresenter",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PocketCalPresenterOrg",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PocketCalWeek",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PocketCalLessonNumber",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "PocketCalNonAcademicEvent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "PocketCalNotes",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "PocketCalPresenter",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "PocketCalPresenterOrg",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "PocketCalWeek",
                table: "Activities");
        }
    }
}
