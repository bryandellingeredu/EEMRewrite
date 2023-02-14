using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class foreignVisitorAttributes2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalForeignGuestInformation",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ClassificationOfInformationReleased",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CountryOfGuest",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "TypeOfVisit",
                table: "Activities");

            migrationBuilder.AddColumn<string>(
                name: "AdditionalForeignGuestInformation",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClassificationOfInformationReleased",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CountryOfGuest",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TypeOfVisit",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalForeignGuestInformation",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ClassificationOfInformationReleased",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "CountryOfGuest",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "TypeOfVisit",
                table: "HostingReports");

            migrationBuilder.AddColumn<string>(
                name: "AdditionalForeignGuestInformation",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClassificationOfInformationReleased",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CountryOfGuest",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TypeOfVisit",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
