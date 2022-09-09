using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Graph;

namespace API.Controllers
{

    public class GraphUsersController : BaseApiController
    {
        private readonly IConfiguration _config;

        public GraphUsersController(IConfiguration config)
        {
            _config = config;
        }

            [HttpGet]
        public async Task<IActionResult> GetGraphUsers()
        {
            Settings s = new Settings();
            var settings = s.LoadSettings(_config);
            GraphHelper.InitializeGraph(settings,(info, cancel) =>  Task.FromResult(0));     
            var result = await GraphHelper.GetUsersAsync();
            return Ok(result);
        }

    }
}
