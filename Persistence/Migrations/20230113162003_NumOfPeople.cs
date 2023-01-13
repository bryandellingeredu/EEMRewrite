using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NumOfPeople : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OutsiderNumOfPeople",
                table: "HostingReports",
                newName: "OutsiderReportNumOfPeople");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OutsiderReportNumOfPeople",
                table: "HostingReports",
                newName: "OutsiderNumOfPeople");
        }
    }
}
