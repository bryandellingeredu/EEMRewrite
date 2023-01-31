using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RequestedNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AmbassadorRequestedNotificationSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CSMRequestedNotificationSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CofsRequestedNotificationSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CommandantRequestedNotificationSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DeanRequestedNotificationSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DptCmdtRequestedNotificationSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ProvostRequestedNotificationSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmbassadorRequestedNotificationSent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSMRequestedNotificationSent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CofsRequestedNotificationSent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CommandantRequestedNotificationSent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DeanRequestedNotificationSent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DptCmdtRequestedNotificationSent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ProvostRequestedNotificationSent",
                table: "Activities");
        }
    }
}
