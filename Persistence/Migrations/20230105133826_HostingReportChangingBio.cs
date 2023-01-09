using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class HostingReportChangingBio : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BioAttached",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "BioPending",
                table: "HostingReports");

            migrationBuilder.AddColumn<string>(
                name: "BioAttachedOrPending",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BioAttachedOrPending",
                table: "HostingReports");

            migrationBuilder.AddColumn<bool>(
                name: "BioAttached",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "BioPending",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
