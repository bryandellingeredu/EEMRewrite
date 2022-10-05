using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class ActivityRoom2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoordinatorEmail",
                table: "Activities",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoordinatorName",
                table: "Activities",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventLookup",
                table: "Activities",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ActivityRooms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    ActivityId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityRooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActivityRooms_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActivityRooms_ActivityId",
                table: "ActivityRooms",
                column: "ActivityId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityRooms");

            migrationBuilder.DropColumn(
                name: "CoordinatorEmail",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CoordinatorName",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "EventLookup",
                table: "Activities");
        }
    }
}
