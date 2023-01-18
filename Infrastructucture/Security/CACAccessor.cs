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

        public CACInfoDTO GetCacInfo()
        {
            bool isLocal = _httpContextAccessor.HttpContext.Request.Host.Value.StartsWith("localhost");
            CACInfoDTO cacInfo = new CACInfoDTO();
            if (isLocal)
            {
                cacInfo.Subject = "CN=DELLINGER.BRYAN.DAVID.1254595116, OU=USA, OU=PKI, OU=DoD, O=U.S. Government, C=US";
                cacInfo.Issuer = "CN=DOD ID CA-59, OU=PKI, OU=DoD, O=U.S. Government, C=US";
                var subjectArray = cacInfo.Subject.Split(',');
                var cnArray = subjectArray[0].Split('.');
                cacInfo.DodIdNumber = cnArray[^1];
                cacInfo.CerticateAsString = "[Subject]\\r\\n  CN=DELLINGER.BRYAN.DAVID.1254595116, OU=USA, OU=PKI, OU=DoD, O=U.S. Government, C=US\\r\\n\\r\\n[Issuer]\\r\\n  CN=DOD ID CA-59, OU=PKI, OU=DoD, O=U.S. Government, C=US\\r\\n\\r\\n[Serial Number]\\r\\n  1DDA55\\r\\n\\r\\n[Not Before]\\r\\n  7/21/2021 8:00:00 PM\\r\\n\\r\\n[Not After]\\r\\n  7/21/2024 7:59:59 PM\\r\\n\\r\\n[Thumbprint]\\r\\n  2DCCDA299AE61EBD37074BD3047AAFF537D4E299\\r\\n";
                var namePiece = subjectArray[0];
                string replacestring = @"""subject"": CN=";
                namePiece = namePiece.Replace(replacestring, "");
                namePiece = namePiece.Replace("CN=", "");
                namePiece = namePiece.Replace("." + cacInfo.DodIdNumber, "");
                cacInfo.TempEmail = namePiece + "@army.mil";
                namePiece = namePiece.Replace(".", " ");
                cacInfo.UserName = namePiece;
            }
            else
            {
                var cert = _httpContextAccessor.HttpContext.Connection.ClientCertificate;
                if (cert != null && !String.IsNullOrEmpty(cert.Subject))
                {
                    cacInfo.Subject = cert.Subject;
                    cacInfo.Issuer = cert.Issuer;
                    var subjectArray = cert.Subject.Split(',');
                    var cnArray = subjectArray[0].Split('.');
                    cacInfo.DodIdNumber = cnArray[^1];
                    cacInfo.CerticateAsString = cert.ToString();
                    var namePiece = subjectArray[0];
                    string replacestring = @"""subject"": CN=";
                    namePiece = namePiece.Replace(replacestring, "");
                    namePiece = namePiece.Replace("CN=", "");
                    namePiece = namePiece.Replace("." + cacInfo.DodIdNumber, "");
                    cacInfo.TempEmail = namePiece + "@army.mil";
                    namePiece = namePiece.Replace(".", " ");
                    cacInfo.UserName = namePiece;
                }
            }
            return cacInfo;
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
