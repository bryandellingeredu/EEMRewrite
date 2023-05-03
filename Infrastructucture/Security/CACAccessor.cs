using Application.Core;
using Application.DTOs;
using Application.Interfaces;
using Azure.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructucture.Security
{
    public class CACAccessor : ICACAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CACAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetCacInfo()
        {
            string headerValue = _httpContextAccessor.HttpContext.Request.Headers["ArmyEmail"];

            if (!string.IsNullOrEmpty(headerValue))
            {
                return headerValue;
            }
            return String.Empty;
        }

        public bool IsCACAuthenticated()
        {
            string headerValue = _httpContextAccessor.HttpContext.Request.Headers["ArmyEmail"];

            if(!string.IsNullOrEmpty(headerValue)) {
                return true;
            }
            return false;


            /*
            var clientCerticate = _httpContextAccessor.HttpContext.Connection.ClientCertificate;
            if (clientCerticate == null || string.IsNullOrEmpty(clientCerticate.Subject))
            {
                //if there is no client certificate the user is not on a cac server
                return false;
            }
            var subjectArray = clientCerticate.Subject.Split(',');
            var cnArray = subjectArray[0].Split('.');
            var DodIdNumber = cnArray[^1];
            if (string.IsNullOrEmpty(DodIdNumber))
            {
                //the user does not have a Dod Id Number
                return false;
            }
            // make sure the user has an account in compass
            string selectTopics = "select count(*) from compassTable where DodId = @DodId";
            // Define the ADO.NET Objects
            var path = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");
            var builder = new ConfigurationBuilder();
            builder.AddJsonFile(path);
            var root = builder.Build();
            var connectionString = root.GetSection("ConnectionStrings").GetSection("CompassConnection").Value;
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand command = new SqlCommand(selectTopics, con);
                command.Parameters.AddWithValue("@DodId", DodIdNumber);
                con.Open();
                int numrows = (int)command.ExecuteScalar();
                if (numrows == 0)
                {
                    return false;
                }
            }
            return true;
            */
        }
    }
}
