using Application.Core;
using Domain;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Application.Persons
{
    public class List
    {
        public class Query : IRequest<Result<List<Person>>> { }

        public class Handler : IRequestHandler<Query, Result<List<Person>>>
        {
            private readonly IConfiguration _config;
            public Handler(IConfiguration config)
            {
                _config = config;
            }
            public async Task<Result<List<Person>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var persons = new List<Person>();
                var connectionString = _config.GetConnectionString("USAWCPersonnelConnection");

                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync(cancellationToken);
                    var myQuery = @"
                        SELECT [PersonID]
                            ,[PositionTitle]
                            ,[RankAbbreviation]
                            ,[FirstName]
                            ,[LastName]
                            ,[BuildingNumber]
                            ,[RoomNumber]
                            ,CONCAT(CAST([AreaCode] AS VARCHAR(10)), '-', CAST([PhoneNumber] AS VARCHAR(20))) AS PhoneNumber
                            ,[Email]
                            ,[Organization]
                        FROM [USAWCPersonnel].[Person].[vwCampusLocater]";
                    // WHERE BuildingNumber IN ('650',  '651')";

                    using (var command = new SqlCommand(myQuery, connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync(cancellationToken))
                        {
                            while (await reader.ReadAsync(cancellationToken))
                            {
                                var person = new Person
                                {
                                    PersonID = reader.GetInt32(reader.GetOrdinal("PersonID")),
                                    PositionTitle = reader.IsDBNull(reader.GetOrdinal("PositionTitle")) ? null : reader.GetString(reader.GetOrdinal("PositionTitle")),
                                    RankAbbreviation = reader.IsDBNull(reader.GetOrdinal("RankAbbreviation")) ? null : reader.GetString(reader.GetOrdinal("RankAbbreviation")),
                                    FirstName = reader.IsDBNull(reader.GetOrdinal("FirstName")) ? null : reader.GetString(reader.GetOrdinal("FirstName")),
                                    LastName = reader.IsDBNull(reader.GetOrdinal("LastName")) ? null : reader.GetString(reader.GetOrdinal("LastName")),
                                    BuildingNumber = reader.IsDBNull(reader.GetOrdinal("BuildingNumber")) ? null : reader.GetString(reader.GetOrdinal("BuildingNumber")),
                                    RoomNumber = reader.IsDBNull(reader.GetOrdinal("RoomNumber")) ? null : reader.GetString(reader.GetOrdinal("RoomNumber")),
                                    PhoneNumber = reader.IsDBNull(reader.GetOrdinal("PhoneNumber")) ? null : reader.GetString(reader.GetOrdinal("PhoneNumber")),
                                    Email = reader.IsDBNull(reader.GetOrdinal("Email")) ? null : reader.GetString(reader.GetOrdinal("Email")),
                                    Organization = reader.IsDBNull(reader.GetOrdinal("Organization")) ? null : reader.GetString(reader.GetOrdinal("Organization"))
                                };
                                persons.Add(person);
                            }
                        }
                    }
                }
                return Result<List<Person>>.Success(persons);
            }
        }
    }
}