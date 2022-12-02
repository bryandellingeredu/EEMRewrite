using Microsoft.AspNetCore.Mvc;
using Application.Categories;

namespace API.Controllers
{
    public class CategoriesController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetCategories() =>
      HandleResult(await Mediator.Send(new List.Query()));
    }
}
