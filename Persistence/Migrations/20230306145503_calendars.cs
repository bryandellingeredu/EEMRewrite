using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class calendars : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CopiedTocomplementary",
                table: "Activities",
                newName: "CopiedTostaff");

            migrationBuilder.RenameColumn(
                name: "CopiedTochapel",
                table: "Activities",
                newName: "CopiedTobattlerhythm");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CopiedTostaff",
                table: "Activities",
                newName: "CopiedTocomplementary");

            migrationBuilder.RenameColumn(
                name: "CopiedTobattlerhythm",
                table: "Activities",
                newName: "CopiedTochapel");
        }
    }
}
