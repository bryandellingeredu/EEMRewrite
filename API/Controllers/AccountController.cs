using API.DTOs;
using API.Services;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers
{


    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly TokenService _tokenService;

        public AccountController(UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            TokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        [AllowAnonymous]
        [HttpPost("signInGraphUser")]
        public async Task<ActionResult<UserDto>> Login(RegisterDto Dto)
        {
            var user = await _userManager.FindByEmailAsync(Dto.Email);
            if (user == null)
            {
                if (await _userManager.Users.AnyAsync(x => x.Email == Dto.Email))
                {
                    ModelState.AddModelError("email", "Email taken");
                    return ValidationProblem();
                }
                if (await _userManager.Users.AnyAsync(x => x.UserName == Dto.UserName))
                {
                    ModelState.AddModelError("userName", "User name taken");
                    return ValidationProblem();
                }

                user = new AppUser
                {
                    DisplayName = Dto.DisplayName,
                    Email = Dto.Email,
                    UserName = Dto.UserName

                };

                var result = await _userManager.CreateAsync(user, Dto.Password);
                if (result.Succeeded)
                {
                    await SetRefreshToken(user);
                    return CreateUserObject(user);
                }
                return BadRequest("problem registering user");
            }
            else
            {
                var result = await _signInManager.CheckPasswordSignInAsync(user, Dto.Password, false);
                if (result.Succeeded)
                {
                    await SetRefreshToken(user);
                    return CreateUserObject(user);
                }
                return Unauthorized();
            }

        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null) return Unauthorized();
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (result.Succeeded)
            {
                await SetRefreshToken(user);
                return  CreateUserObject(user);
            }
            return Unauthorized();

        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDTO)
        {
            if (await _userManager.Users.AnyAsync(x => x.Email == registerDTO.Email))
            {
                ModelState.AddModelError("email", "Email taken");
                return ValidationProblem();
            }
            if (await _userManager.Users.AnyAsync(x => x.UserName == registerDTO.UserName))
            {
                ModelState.AddModelError("userName", "User name taken");
                return ValidationProblem();
            }

            var user = new AppUser
            {
                DisplayName = registerDTO.DisplayName,
                Email = registerDTO.Email,
                UserName = registerDTO.UserName

            };

            var result = await _userManager.CreateAsync(user, registerDTO.Password);
            if (result.Succeeded)
            {
                await SetRefreshToken(user);
                return CreateUserObject(user);
            }
            return BadRequest("problem registering user");
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser() =>
          CreateUserObject(
           await _userManager.Users
           .FirstOrDefaultAsync(
               x => x.Email == User.FindFirstValue(ClaimTypes.Email)));

        [Authorize]
        [HttpPost("refreshToken")]
        public async Task<ActionResult<UserDto>> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var user = await _userManager.Users.Include(r => r.RefreshTokens)
                .FirstOrDefaultAsync(x => x.UserName == User.FindFirstValue(ClaimTypes.Name));

            if (user == null) return Unauthorized();

            var oldToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken);

            if (oldToken != null && !oldToken.IsActive) return Unauthorized();

            if (oldToken != null) oldToken.Revoked = DateTime.UtcNow;

            return CreateUserObject(user);

        }

        private async Task SetRefreshToken(AppUser user)
        {
            var refreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshTokens.Add(refreshToken);
            await _userManager.UpdateAsync(user);
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTimeOffset.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
        }
        private UserDto CreateUserObject(AppUser user)
        {
            return new UserDto
            {
                DisplayName = user.DisplayName,
                Image = null,
                Token = _tokenService.CreateToken(user),
                UserName = user.UserName
            };
        }
    }
}

