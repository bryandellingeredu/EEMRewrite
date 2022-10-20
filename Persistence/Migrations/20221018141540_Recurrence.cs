using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    public partial class Recurrence : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RecurrenceId",
                table: "Activities",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Recurrences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Sunday = table.Column<bool>(type: "boolean", nullable: false),
                    Monday = table.Column<bool>(type: "boolean", nullable: false),
                    Tuesday = table.Column<bool>(type: "boolean", nullable: false),
                    Wednesday = table.Column<bool>(type: "boolean", nullable: false),
                    Thursday = table.Column<bool>(type: "boolean", nullable: false),
                    Friday = table.Column<bool>(type: "boolean", nullable: false),
                    Saturday = table.Column<bool>(type: "boolean", nullable: false),
                    Interval = table.Column<string>(type: "text", nullable: true),
                    DayOfMonth = table.Column<string>(type: "text", nullable: true),
                    WeekOfMonth = table.Column<string>(type: "text", nullable: true),
                    WeekdayOfMonth = table.Column<string>(type: "text", nullable: true),
                    IntervalStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IntervalEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IncludeWeekends = table.Column<bool>(type: "boolean", nullable: false),
                    DaysRepeating = table.Column<string>(type: "text", nullable: true),
                    WeeksRepeating = table.Column<string>(type: "text", nullable: true),
                    MonthsRepeating = table.Column<string>(type: "text", nullable: true),
                    WeekInterval = table.Column<string>(type: "text", nullable: true),
                    WeekendsIncluded = table.Column<string>(type: "text", nullable: true),
                    WeeklyRepeatType = table.Column<string>(type: "text", nullable: true),
                    MonthlyRepeatType = table.Column<string>(type: "text", nullable: true),
                    MonthlyDayType = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recurrences", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_RecurrenceId",
                table: "Activities",
                column: "RecurrenceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Recurrences_RecurrenceId",
                table: "Activities",
                column: "RecurrenceId",
                principalTable: "Recurrences",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Recurrences_RecurrenceId",
                table: "Activities");

            migrationBuilder.DropTable(
                name: "Recurrences");

            migrationBuilder.DropIndex(
                name: "IX_Activities_RecurrenceId",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RecurrenceId",
                table: "Activities");
        }
    }
}
