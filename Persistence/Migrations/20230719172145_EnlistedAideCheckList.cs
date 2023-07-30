using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnlistedAideCheckList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EnlistedAideCheckLists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActivityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlcoholEstimate = table.Column<bool>(type: "bit", nullable: false),
                    SendToLegalForApproval = table.Column<bool>(type: "bit", nullable: false),
                    PreparePRAForm = table.Column<bool>(type: "bit", nullable: false),
                    PrepareGuestList = table.Column<bool>(type: "bit", nullable: false),
                    Prepare4843GuestList = table.Column<bool>(type: "bit", nullable: false),
                    MenuReviewedByPrincipal = table.Column<bool>(type: "bit", nullable: false),
                    OrderAlcohol = table.Column<bool>(type: "bit", nullable: false),
                    GFEBS = table.Column<bool>(type: "bit", nullable: false),
                    GatherIce = table.Column<bool>(type: "bit", nullable: false),
                    SweepAndMop = table.Column<bool>(type: "bit", nullable: false),
                    HighTopsAndTables = table.Column<bool>(type: "bit", nullable: false),
                    PolishSilver = table.Column<bool>(type: "bit", nullable: false),
                    CleanCutlery = table.Column<bool>(type: "bit", nullable: false),
                    CleanPlates = table.Column<bool>(type: "bit", nullable: false),
                    CleanServiceItems = table.Column<bool>(type: "bit", nullable: false),
                    NapkinsPressed = table.Column<bool>(type: "bit", nullable: false),
                    NapkinsRolled = table.Column<bool>(type: "bit", nullable: false),
                    FoodPrep = table.Column<bool>(type: "bit", nullable: false),
                    Dust = table.Column<bool>(type: "bit", nullable: false),
                    Cook = table.Column<bool>(type: "bit", nullable: false),
                    Coffee = table.Column<bool>(type: "bit", nullable: false),
                    IceBeverages = table.Column<bool>(type: "bit", nullable: false),
                    Sterno = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnlistedAideCheckLists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EnlistedAideCheckLists_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EnlistedAideCheckLists_ActivityId",
                table: "EnlistedAideCheckLists",
                column: "ActivityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EnlistedAideCheckLists");
        }
    }
}
