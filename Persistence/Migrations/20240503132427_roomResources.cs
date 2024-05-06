using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class roomResources : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RoomResourceNipr",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RoomResourceNotApplicable",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RoomResourceNtg",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RoomResourceNts",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RoomResourceOther",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RoomResourceOtherText",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RoomResourceRen",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RoomResourceSipr",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RoomResourceNipr",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomResourceNotApplicable",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomResourceNtg",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomResourceNts",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomResourceOther",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomResourceOtherText",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomResourceRen",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RoomResourceSipr",
                table: "Activities");
        }
    }
}
