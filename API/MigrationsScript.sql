BEGIN TRANSACTION;
GO

ALTER TABLE [Activities] ADD [TeamOwner] nvarchar(max) NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240710124757_teamowner', N'8.0.0');
GO

COMMIT;
GO

