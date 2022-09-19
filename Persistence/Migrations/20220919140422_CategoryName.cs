using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class CategoryName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Text",
                table: "Categories");

            migrationBuilder.RenameColumn(
                name: "Value",
                table: "Categories",
                newName: "Name");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Categories",
                newName: "Value");

            migrationBuilder.AddColumn<string>(
                name: "Text",
                table: "Categories",
                type: "TEXT",
                nullable: true);
        }
    }
}
