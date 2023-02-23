using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CopyToAttriubtes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CopiedToacademic",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedToasep",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTochapel",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTocommandGroup",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTocommunity",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTocomplementary",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTocsl",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTogarrison",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTogeneralInterest",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedToholiday",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTopksoi",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTosocialEventsAndCeremonies",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTossiAndUsawcPress",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTossl",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTotrainingAndMiscEvents",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTousahec",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTousahecFacilitiesUsage",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedTovisitsAndTours",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "CopiedToweeklyPocket",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CopiedToacademic",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedToasep",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTochapel",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTocommandGroup",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTocommunity",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTocomplementary",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTocsl",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTogarrison",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTogeneralInterest",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedToholiday",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTopksoi",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTosocialEventsAndCeremonies",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTossiAndUsawcPress",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTossl",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTotrainingAndMiscEvents",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTousahec",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTousahecFacilitiesUsage",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedTovisitsAndTours",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CopiedToweeklyPocket",
                table: "Activities");
        }
    }
}
