BEGIN TRANSACTION;
GO

ALTER TABLE [Activities] ADD [SetUpTime] nvarchar(max) NULL;
GO

ALTER TABLE [Activities] ADD [TearDownTime] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250213161759_setup', N'8.0.0');
GO

COMMIT;
GO

