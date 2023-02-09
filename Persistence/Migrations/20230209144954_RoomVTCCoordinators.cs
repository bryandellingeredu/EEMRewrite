using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RoomVTCCoordinators : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DelegateDisplayName",
                table: "RoomDelegates",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RoomVTCCoordinators",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VTCCoordinatorDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VTCCoordinatorEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RoomEmail = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomVTCCoordinators", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RoomVTCCoordinators");

            migrationBuilder.DropColumn(
                name: "DelegateDisplayName",
                table: "RoomDelegates");
        }
    }
}
