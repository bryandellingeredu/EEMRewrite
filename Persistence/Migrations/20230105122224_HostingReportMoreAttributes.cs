using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class HostingReportMoreAttributes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AVSubmitted",
                table: "HostingReports",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Arrival",
                table: "HostingReports",
                type: "datetime2",
                nullable: true);

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

            migrationBuilder.AddColumn<DateTime>(
                name: "Departure",
                table: "HostingReports",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DietaryRestrictions",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FlagIsFor",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "FlagSupport",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "FlagType",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ForeignVisitor",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "GenerateItinerary",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "GiftRequirement",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestItinerary",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestName",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HostingReportStatus",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "LocalTransportationNeeded",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "LodgingArrangements",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LodgingLocation",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "MealRequestBreakfast",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MealRequestDinner",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MealRequestLunch",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "MealRequestOther",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ModeOfTravel",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParkingDetails",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ParkingRequirements",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PhotographSubmitted",
                table: "HostingReports",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TravelArrangementDetails",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TravelPartyAccomaniedBy",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UniformOfGuest",
                table: "HostingReports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ViosSupportAV",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ViosSupportPhotography",
                table: "HostingReports",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AVSubmitted",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "Arrival",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "BioAttached",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "BioPending",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "Departure",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "DietaryRestrictions",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "FlagIsFor",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "FlagSupport",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "FlagType",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ForeignVisitor",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "GenerateItinerary",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "GiftRequirement",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "GuestItinerary",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "GuestName",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "HostingReportStatus",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "LocalTransportationNeeded",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "LodgingArrangements",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "LodgingLocation",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "MealRequestBreakfast",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "MealRequestDinner",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "MealRequestLunch",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "MealRequestOther",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ModeOfTravel",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ParkingDetails",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ParkingRequirements",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "PhotographSubmitted",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "TravelArrangementDetails",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "TravelPartyAccomaniedBy",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "UniformOfGuest",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ViosSupportAV",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ViosSupportPhotography",
                table: "HostingReports");
        }
    }
}
