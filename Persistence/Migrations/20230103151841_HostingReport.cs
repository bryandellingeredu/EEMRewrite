using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class HostingReport : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HostingReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PurposeOfVisit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OfficeCallWithCommandant = table.Column<bool>(type: "bit", nullable: false),
                    EscortOfficer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EscortOfficerPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HostedLocationRootHall = table.Column<bool>(type: "bit", nullable: false),
                    HostedLocationCollinsHall = table.Column<bool>(type: "bit", nullable: false),
                    HostedLocationAHEC = table.Column<bool>(type: "bit", nullable: false),
                    HostedLocationCCR = table.Column<bool>(type: "bit", nullable: false),
                    HostedLocationWWA = table.Column<bool>(type: "bit", nullable: false),
                    GuestRank = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GuestTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GuestOfficePhone = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HostingReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HostingReports_Activities_Id",
                        column: x => x.Id,
                        principalTable: "Activities",
                        principalColumn: "Id");
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HostingReports");
        }
    }
}
