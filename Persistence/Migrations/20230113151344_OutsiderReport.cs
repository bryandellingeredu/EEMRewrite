using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class OutsiderReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OutsiderNumOfPeople",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OutsiderReportDV",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OutsiderReportDirectorate",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OutsiderReportEngagement",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OutsiderReportPOC",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OutsiderReportStatus",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OutsiderReportUSAWCGraduate",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReportType",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OutsiderNumOfPeople",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "OutsiderReportDV",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "OutsiderReportDirectorate",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "OutsiderReportEngagement",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "OutsiderReportPOC",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "OutsiderReportStatus",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "OutsiderReportUSAWCGraduate",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ReportType",
                table: "HostingReports");
        }
    }
}
