using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EmailGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EmailGroupMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailGroupMembers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailGroupEmailGroupMemberJunctions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmailGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmailGroupMemberId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailGroupEmailGroupMemberJunctions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmailGroupEmailGroupMemberJunctions_EmailGroupMembers_EmailGroupMemberId",
                        column: x => x.EmailGroupMemberId,
                        principalTable: "EmailGroupMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EmailGroupEmailGroupMemberJunctions_EmailGroups_EmailGroupId",
                        column: x => x.EmailGroupId,
                        principalTable: "EmailGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmailGroupEmailGroupMemberJunctions_EmailGroupId",
                table: "EmailGroupEmailGroupMemberJunctions",
                column: "EmailGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_EmailGroupEmailGroupMemberJunctions_EmailGroupMemberId",
                table: "EmailGroupEmailGroupMemberJunctions",
                column: "EmailGroupMemberId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailGroupEmailGroupMemberJunctions");

            migrationBuilder.DropTable(
                name: "EmailGroupMembers");

            migrationBuilder.DropTable(
                name: "EmailGroups");
        }
    }
}
