using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SyncMigrationNotification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SyncToCalendarNotifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CommunityEvent = table.Column<bool>(type: "bit", nullable: false),
                    MFP = table.Column<bool>(type: "bit", nullable: false),
                    IMC = table.Column<bool>(type: "bit", nullable: false),
                    CopiedToacademic = table.Column<bool>(type: "bit", nullable: false),
                    CopiedToasep = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTocommandGroup = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTocommunity = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTocsl = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTocio = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTogarrison = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTogeneralInterest = table.Column<bool>(type: "bit", nullable: false),
                    CopiedToholiday = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTopksoi = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTosocialEventsAndCeremonies = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTossiAndUsawcPress = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTossl = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTotrainingAndMiscEvents = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTousahec = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTousahecFacilitiesUsage = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTovisitsAndTours = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTosymposiumAndConferences = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTobattlerhythm = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTostaff = table.Column<bool>(type: "bit", nullable: false),
                    CopiedTostudentCalendar = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SyncToCalendarNotifications", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SyncToCalendarNotifications");
        }
    }
}
