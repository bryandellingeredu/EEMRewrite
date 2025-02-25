using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class dvnotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DistinguishedVisitorAttending",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DistinguishedVisitorAttendingNotificationSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DistinguishedVisitorNotificationToExecServices",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DistinguishedVisitorNotificationToExecServicesNotificationSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DistinguishedVisitorAttending",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DistinguishedVisitorAttendingNotificationSent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DistinguishedVisitorNotificationToExecServices",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DistinguishedVisitorNotificationToExecServicesNotificationSent",
                table: "Activities");
        }
    }
}
