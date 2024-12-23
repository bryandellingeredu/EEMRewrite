﻿using Microsoft.AspNetCore.Mvc;
using Application.Categories;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    public class CategoriesController : BaseApiController
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetCategories() =>
      HandleResult(await Mediator.Send(new List.Query()));
    }
}
