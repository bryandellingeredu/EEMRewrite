using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RoomDelegateGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
           /* migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "RoomDelegates",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .OldAnnotation("SqlServer:Identity", "1, 1");*/

                migrationBuilder.DropPrimaryKey(
                name: "PK_RoomDelegates",
                 table: "RoomDelegates");

                   migrationBuilder.DropColumn(
                    name: "Id",
                    table: "RoomDelegates");

              migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "RoomDelegates",
                type: "uniqueidentifier",
                nullable: false);
                }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "RoomDelegates",
                type: "int",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier")
                .Annotation("SqlServer:Identity", "1, 1");
        }
    }
}
