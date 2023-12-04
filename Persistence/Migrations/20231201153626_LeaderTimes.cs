using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class LeaderTimes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AmbassadorEnd",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AmbassadorStart",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CSMEnd",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CSMStart",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CofsEnd",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CofsStart",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CommandantEnd",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CommandantStart",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeanEnd",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeanStart",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DptCmdtEnd",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DptCmdtStart",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProvostEnd",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProvostStart",
                table: "Activities",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AmbassadorEnd",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "AmbassadorStart",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSMEnd",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CSMStart",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CofsEnd",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CofsStart",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CommandantEnd",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CommandantStart",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DeanEnd",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DeanStart",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DptCmdtEnd",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "DptCmdtStart",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ProvostEnd",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ProvostStart",
                table: "Activities");
        }
    }
}
