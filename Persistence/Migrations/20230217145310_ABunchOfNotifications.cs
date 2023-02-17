using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ABunchOfNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ForeignVisitorNotificationSent",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HostingReportApprovalNotificationSent",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "OfficeCallWithCommandantNotificationSent",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ParkingRequirementsNotificationSent",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ForeignVisitorNotificationSent",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "HostingReportApprovalNotificationSent",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "OfficeCallWithCommandantNotificationSent",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ParkingRequirementsNotificationSent",
                table: "HostingReports");
        }
    }
}
