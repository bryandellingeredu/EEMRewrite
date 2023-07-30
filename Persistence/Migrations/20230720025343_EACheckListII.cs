using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EACheckListII : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "FoodShopping",
                table: "EnlistedAideCheckLists",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PrepareLegalReview",
                table: "EnlistedAideCheckLists",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PrepareMenu",
                table: "EnlistedAideCheckLists",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "TentSetUp",
                table: "EnlistedAideCheckLists",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FoodShopping",
                table: "EnlistedAideCheckLists");

            migrationBuilder.DropColumn(
                name: "PrepareLegalReview",
                table: "EnlistedAideCheckLists");

            migrationBuilder.DropColumn(
                name: "PrepareMenu",
                table: "EnlistedAideCheckLists");

            migrationBuilder.DropColumn(
                name: "TentSetUp",
                table: "EnlistedAideCheckLists");
        }
    }
}
