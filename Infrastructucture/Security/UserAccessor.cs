using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Persistence.Migrations;

namespace Infrastructucture.Security
{
   public class UserAccessor : IUserAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly string _connectionString;
        public UserAccessor(IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _connectionString = configuration.GetConnectionString("CompassConnection");
        }



        public string GetStudentType(string emailAddress)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
               string sql = "SELECT TOP 1 [Type] FROM [USAWCPersonnel].[EEM].[RepDep] WHERE TRIM(LOWER([Email])) = LOWER(TRIM(@Email))";
                SqlCommand command = new SqlCommand(sql, connection);
              command.Parameters.AddWithValue("@Email", emailAddress);
             //  command.Parameters.AddWithValue("@Email", "erik.a.keim.mil@armywarcollege.edu");   //Resident
             //  command.Parameters.AddWithValue("@Email", "debbie.lipscomb.mil@armywarcollege.edu");   //DL24
              // command.Parameters.AddWithValue("@Email", "jeanine.l.frazier.mil@armywarcollege.edu");   //DL25


                try
                {
                    connection.Open();
                    var result = command.ExecuteScalar();

                    return result?.ToString();
                }
                catch (Exception ex)
                {
                    // Handle exceptions here
                    throw;
                }
            }
        }

        public string GetUsername()
        {
            return _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Name);
        }
    
    }
}
