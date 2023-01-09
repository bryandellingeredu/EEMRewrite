﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Persistence;

#nullable disable

namespace Persistence.Migrations
{
    [DbContext(typeof(DataContext))]
    [Migration("20230103151841_HostingReport")]
    partial class HostingReport
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.11")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder, 1L, 1);

            modelBuilder.Entity("Domain.Activity", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("ActionOfficer")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ActionOfficerPhone")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("AdditionalVTCInfo")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("AllDayEvent")
                        .HasColumnType("bit");

                    b.Property<bool>("AmbassadorRequested")
                        .HasColumnType("bit");

                    b.Property<string>("ApprovedByOPS")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("AutomationComments")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("AutomationCopiers")
                        .HasColumnType("bit");

                    b.Property<bool>("AutomationPC")
                        .HasColumnType("bit");

                    b.Property<bool>("AutomationProjection")
                        .HasColumnType("bit");

                    b.Property<bool>("AutomationTaping")
                        .HasColumnType("bit");

                    b.Property<bool>("AutomationVTC")
                        .HasColumnType("bit");

                    b.Property<bool>("CSLDirectorateCSL")
                        .HasColumnType("bit");

                    b.Property<bool>("CSLDirectorateDSW")
                        .HasColumnType("bit");

                    b.Property<bool>("CSLDirectorateDTI")
                        .HasColumnType("bit");

                    b.Property<bool>("CSLDirectorateFellows")
                        .HasColumnType("bit");

                    b.Property<bool>("CSLDirectorateOPS")
                        .HasColumnType("bit");

                    b.Property<bool>("CSLDirectorateSLFG")
                        .HasColumnType("bit");

                    b.Property<bool>("CSMRequested")
                        .HasColumnType("bit");

                    b.Property<Guid>("CategoryId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("Catering")
                        .HasColumnType("bit");

                    b.Property<bool>("CateringArea18")
                        .HasColumnType("bit");

                    b.Property<bool>("CateringArea22")
                        .HasColumnType("bit");

                    b.Property<bool>("CateringAreaArdennes")
                        .HasColumnType("bit");

                    b.Property<bool>("CateringBreakArea18")
                        .HasColumnType("bit");

                    b.Property<bool>("CateringBreakArea22")
                        .HasColumnType("bit");

                    b.Property<string>("CateringComments")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("CheckedForOpsec")
                        .HasColumnType("bit");

                    b.Property<bool>("CofsRequested")
                        .HasColumnType("bit");

                    b.Property<string>("Color")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("CommandantRequested")
                        .HasColumnType("bit");

                    b.Property<string>("CommunicationComments")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CommunicationSupport")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("CommunityEvent")
                        .HasColumnType("bit");

                    b.Property<string>("CoordinatorDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("CoordinatorEmail")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("CopyToUSAHECCalendar")
                        .HasColumnType("bit");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("CreatedBy")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("DTI")
                        .HasColumnType("bit");

                    b.Property<bool>("DeanRequested")
                        .HasColumnType("bit");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("DialInNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("DistantTechPhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("DptCmdtRequested")
                        .HasColumnType("bit");

                    b.Property<bool>("Education")
                        .HasColumnType("bit");

                    b.Property<string>("EducationalCategory")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("End")
                        .HasColumnType("datetime2");

                    b.Property<string>("EventClearanceLevel")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EventLookup")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("FaxClassification")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("G5Calendar")
                        .HasColumnType("bit");

                    b.Property<string>("G5Organization")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("GOSESInAttendance")
                        .HasColumnType("bit");

                    b.Property<string>("GarrisonCategory")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Hyperlink")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("HyperlinkDescription")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IMC")
                        .HasColumnType("bit");

                    b.Property<DateTime?>("LastUpdatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("LastUpdatedBy")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("MFP")
                        .HasColumnType("bit");

                    b.Property<bool>("MarketingRequest")
                        .HasColumnType("bit");

                    b.Property<string>("NumberAttending")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid?>("OrganizationId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("OtherComments")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PAX")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("ParkingPasses")
                        .HasColumnType("bit");

                    b.Property<string>("ParkingSpaces")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("ParticipationCmdt")
                        .HasColumnType("bit");

                    b.Property<bool>("ParticipationDir")
                        .HasColumnType("bit");

                    b.Property<bool>("ParticipationForeign")
                        .HasColumnType("bit");

                    b.Property<bool>("ParticipationGO")
                        .HasColumnType("bit");

                    b.Property<string>("PhoneNumberForRoom")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PocketCalLessonNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PocketCalNonAcademicEvent")
                        .HasColumnType("bit");

                    b.Property<string>("PocketCalNotes")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PocketCalPresenter")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PocketCalPresenterOrg")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PocketCalWeek")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PrimaryLocation")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("ProvostRequested")
                        .HasColumnType("bit");

                    b.Property<Guid?>("RecurrenceId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("RecurrenceInd")
                        .HasColumnType("bit");

                    b.Property<bool>("Registration")
                        .HasColumnType("bit");

                    b.Property<string>("RegistrationLocation")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Report")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RequestorPOCContactInfo")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("RoomRequirement1")
                        .HasColumnType("bit");

                    b.Property<bool>("RoomRequirement2")
                        .HasColumnType("bit");

                    b.Property<bool>("RoomRequirement3")
                        .HasColumnType("bit");

                    b.Property<bool>("RoomRequirementBasement")
                        .HasColumnType("bit");

                    b.Property<string>("RoomSetUp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoomSetUpInstructions")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("SSLCategories")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("SecurityAfterDutyAccess")
                        .HasColumnType("bit");

                    b.Property<bool>("SecurityBadgeIssue")
                        .HasColumnType("bit");

                    b.Property<string>("SecurityComments")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("SeniorAttendeeNameRank")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("SiteIDDistantEnd")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("Start")
                        .HasColumnType("datetime2");

                    b.Property<string>("SuppliesComments")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Title")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Transportation")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("TransportationComments")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Type")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("USAHECCalendarCategory")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("USAHECDirectorate")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("USAHECFacilityReservationType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("VTC")
                        .HasColumnType("bit");

                    b.Property<string>("VTCClassification")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("VTCStatus")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.HasIndex("OrganizationId");

                    b.HasIndex("RecurrenceId");

                    b.ToTable("Activities");
                });

            modelBuilder.Entity("Domain.AppUser", b =>
                {
                    b.Property<string>("Id")
                        .HasMaxLength(225)
                        .HasColumnType("nvarchar(225)");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<string>("Bio")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("DisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("bit");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex")
                        .HasFilter("[NormalizedUserName] IS NOT NULL");

                    b.ToTable("AspNetUsers", (string)null);
                });

            modelBuilder.Entity("Domain.Category", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("IMCColor")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IncludeInIMC")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RouteName")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("Domain.HostingReport", b =>
                {
                    b.Property<Guid>("Id")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("EscortOfficer")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EscortOfficerPhone")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("GuestOfficePhone")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("GuestRank")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("GuestTitle")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("HostedLocationAHEC")
                        .HasColumnType("bit");

                    b.Property<bool>("HostedLocationCCR")
                        .HasColumnType("bit");

                    b.Property<bool>("HostedLocationCollinsHall")
                        .HasColumnType("bit");

                    b.Property<bool>("HostedLocationRootHall")
                        .HasColumnType("bit");

                    b.Property<bool>("HostedLocationWWA")
                        .HasColumnType("bit");

                    b.Property<bool>("OfficeCallWithCommandant")
                        .HasColumnType("bit");

                    b.Property<string>("PurposeOfVisit")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("HostingReports");
                });

            modelBuilder.Entity("Domain.Location", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Locations");
                });

            modelBuilder.Entity("Domain.Organization", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Organizations");
                });

            modelBuilder.Entity("Domain.Recurrence", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("DayOfMonth")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("DaysRepeating")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("Friday")
                        .HasColumnType("bit");

                    b.Property<bool>("IncludeWeekends")
                        .HasColumnType("bit");

                    b.Property<string>("Interval")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("IntervalEnd")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("IntervalStart")
                        .HasColumnType("datetime2");

                    b.Property<bool>("Monday")
                        .HasColumnType("bit");

                    b.Property<string>("MonthlyDayType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("MonthlyRepeatType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("MonthsRepeating")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("Saturday")
                        .HasColumnType("bit");

                    b.Property<bool>("Sunday")
                        .HasColumnType("bit");

                    b.Property<bool>("Thursday")
                        .HasColumnType("bit");

                    b.Property<bool>("Tuesday")
                        .HasColumnType("bit");

                    b.Property<bool>("Wednesday")
                        .HasColumnType("bit");

                    b.Property<string>("WeekInterval")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("WeekOfMonth")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("WeekdayOfMonth")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("WeekendsIncluded")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("WeeklyRepeatType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("WeeksRepeating")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Recurrences");
                });

            modelBuilder.Entity("Domain.RefreshToken", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<string>("AppUserId")
                        .HasColumnType("nvarchar(225)");

                    b.Property<DateTime>("Expires")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("Revoked")
                        .HasColumnType("datetime2");

                    b.Property<string>("Token")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("AppUserId");

                    b.ToTable("RefreshToken");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasMaxLength(225)
                        .HasColumnType("nvarchar(225)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex")
                        .HasFilter("[NormalizedName] IS NOT NULL");

                    b.ToTable("AspNetRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("nvarchar(225)");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(225)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasMaxLength(225)
                        .HasColumnType("nvarchar(225)");

                    b.Property<string>("ProviderKey")
                        .HasMaxLength(225)
                        .HasColumnType("nvarchar(225)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(225)");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(225)");

                    b.Property<string>("RoleId")
                        .HasColumnType("nvarchar(225)");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(225)");

                    b.Property<string>("LoginProvider")
                        .HasMaxLength(112)
                        .HasColumnType("nvarchar(112)");

                    b.Property<string>("Name")
                        .HasMaxLength(112)
                        .HasColumnType("nvarchar(112)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens", (string)null);
                });

            modelBuilder.Entity("Domain.Activity", b =>
                {
                    b.HasOne("Domain.Category", "Category")
                        .WithMany("Activities")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Domain.Organization", "Organization")
                        .WithMany("Activities")
                        .HasForeignKey("OrganizationId");

                    b.HasOne("Domain.Recurrence", "Recurrence")
                        .WithMany("Activities")
                        .HasForeignKey("RecurrenceId");

                    b.Navigation("Category");

                    b.Navigation("Organization");

                    b.Navigation("Recurrence");
                });

            modelBuilder.Entity("Domain.HostingReport", b =>
                {
                    b.HasOne("Domain.Activity", "Activity")
                        .WithOne("HostingReport")
                        .HasForeignKey("Domain.HostingReport", "Id");

                    b.Navigation("Activity");
                });

            modelBuilder.Entity("Domain.RefreshToken", b =>
                {
                    b.HasOne("Domain.AppUser", "AppUser")
                        .WithMany("RefreshTokens")
                        .HasForeignKey("AppUserId");

                    b.Navigation("AppUser");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("Domain.AppUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("Domain.AppUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Domain.AppUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("Domain.AppUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Domain.Activity", b =>
                {
                    b.Navigation("HostingReport");
                });

            modelBuilder.Entity("Domain.AppUser", b =>
                {
                    b.Navigation("RefreshTokens");
                });

            modelBuilder.Entity("Domain.Category", b =>
                {
                    b.Navigation("Activities");
                });

            modelBuilder.Entity("Domain.Organization", b =>
                {
                    b.Navigation("Activities");
                });

            modelBuilder.Entity("Domain.Recurrence", b =>
                {
                    b.Navigation("Activities");
                });
#pragma warning restore 612, 618
        }
    }
}
