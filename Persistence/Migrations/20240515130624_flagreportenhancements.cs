using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class flagreportenhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "FlagBliss",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "FlagLectureEast",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "FlagLectureWest",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "FlagRoomOther",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "FlagRoomOtherText",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FlagSetUp",
                table: "HostingReports",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FlagBliss",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "FlagLectureEast",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "FlagLectureWest",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "FlagRoomOther",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "FlagRoomOtherText",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "FlagSetUp",
                table: "HostingReports");
        }
    }
}
