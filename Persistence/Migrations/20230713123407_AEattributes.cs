using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AEattributes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EnlistedAideAcknowledged",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EnlistedAideAlcohol",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnlistedAideCooking",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnlistedAideDietaryRestrictions",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EnlistedAideEvent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EnlistedAideFundingType",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnlistedAideGuestCount",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnlistedAideNumOfBartenders",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnlistedAideNumOfServers",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnlistedAideSupportNeeded",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnlistedAideVenue",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnlistedAideAcknowledged",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideAlcohol",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideCooking",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideDietaryRestrictions",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideEvent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideFundingType",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideGuestCount",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideNumOfBartenders",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideNumOfServers",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideSupportNeeded",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EnlistedAideVenue",
                table: "Activities");
        }
    }
}
