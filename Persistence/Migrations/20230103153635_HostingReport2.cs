using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class HostingReport2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HostingReports_Activities_Id",
                table: "HostingReports");

            migrationBuilder.AddColumn<Guid>(
                name: "ActivityId",
                table: "HostingReports",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_HostingReports_ActivityId",
                table: "HostingReports",
                column: "ActivityId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_HostingReports_Activities_ActivityId",
                table: "HostingReports",
                column: "ActivityId",
                principalTable: "Activities",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HostingReports_Activities_ActivityId",
                table: "HostingReports");

            migrationBuilder.DropIndex(
                name: "IX_HostingReports_ActivityId",
                table: "HostingReports");

            migrationBuilder.DropColumn(
                name: "ActivityId",
                table: "HostingReports");

            migrationBuilder.AddForeignKey(
                name: "FK_HostingReports_Activities_Id",
                table: "HostingReports",
                column: "Id",
                principalTable: "Activities",
                principalColumn: "Id");
        }
    }
}
