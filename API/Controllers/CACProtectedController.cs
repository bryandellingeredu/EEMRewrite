using Microsoft.AspNetCore.Mvc;
using Application.Categories;
using MediatR;
using Domain;
using Microsoft.AspNetCore.Identity;
using Application.Interfaces;
using Infrastructucture.Security;

namespace API.Controllers
{
    public class CACProtectedController : BaseApiController
    {
        private readonly ICACAccessor _cacAccessor;
        public CACProtectedController(ICACAccessor cacAccessor) => _cacAccessor = cacAccessor;  
            
        [HttpGet]
        public async Task<IActionResult> GetCacProtectedStuff()
        {
            if (!_cacAccessor.IsCACAuthenticated()) return Unauthorized("Not CAC Authenticated");
            return HandleResult(await Mediator.Send(new List.Query()));
        }
    }
}
