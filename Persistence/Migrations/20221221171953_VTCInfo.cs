using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class VTCInfo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdditionalVTCInfo",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DialInNumber",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DistantTechPhoneNumber",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "GOSESInAttendance",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RequestorPOCContactInfo",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeniorAttendeeNameRank",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SiteIDDistantEnd",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VTCClassification",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VTCStatus",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalVTCInfo",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DialInNumber",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DistantTechPhoneNumber",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "GOSESInAttendance",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RequestorPOCContactInfo",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "SeniorAttendeeNameRank",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "SiteIDDistantEnd",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "VTCClassification",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "VTCStatus",
                table: "Activities");
        }
    }
}
