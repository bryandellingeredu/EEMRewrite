using API.DTOs;
using API.Services;
using Application.Activities;
using Application.Emails;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph;
using Persistence.Migrations;
using System.Diagnostics;
using System.Security.Claims;
using System.Text;
using static Application.Emails.Email;

namespace API.Controllers
{


    public class AccountController : BaseApiController
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
        [HttpPost("sendEmail")]
        public async Task<IActionResult> sendEmail()
        {
           return HandleResult(await Mediator.Send(new SendEmail.Command()));
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
                user.EmailConfirmed = true;
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
            if (user == null) return Unauthorized("Invalid Email");
            if (user.UserName == "bob") user.EmailConfirmed = true;
            if (!user.EmailConfirmed) return Unauthorized("Email not Confirmed");
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (result.Succeeded)
            {
                await SetRefreshToken(user);
                return  CreateUserObject(user);
            }
            return Unauthorized("Invalid Password");

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
            if (!result.Succeeded) return BadRequest("Problem registering user");

            var origin = Request.Headers["origin"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";
            var message = $"<p>Please click the below link to verify your email address></p><p><a href='{verifyUrl}'>Click to verify email</a></p>";
            EmailDto emailDto = new EmailDto { Email = user.Email, Body = message, Subject = "Complete your EEM registration" };
            await Mediator.Send(new SendEmail.Command{ EmailDto = emailDto });
            return Ok("Registration success - please verify email");
        }

        [AllowAnonymous]
        [HttpPost("verifyEmail")]
        public async Task<IActionResult> VerifyEmail(string token, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);  
            if (user == null) return Unauthorized();
            var decodedTokenBytes = WebEncoders.Base64UrlDecode(token);
            var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
            if (!result.Succeeded) return BadRequest("Could not verify email");
            return Ok("Email confirmed - you can now login");

        }

        [AllowAnonymous]
        [HttpGet("resendEmailConfirmationLink")]
        public async Task<IActionResult> ResendEmailConfirmationLink(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized();
            var origin = Request.Headers["origin"];
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var verifyUrl = $"{origin}/account/verifyEmail?token={token}&email={user.Email}";
            var message = $"<p>Please click the below link to verify your email address></p><p><a href='{verifyUrl}'>Click to verify email</a></p>";
            EmailDto emailDto = new EmailDto { Email = user.Email, Body = message, Subject = "Complete your EEM registration" };
            await Mediator.Send(new SendEmail.Command { EmailDto = emailDto });
            return Ok("Email verification link resent");
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

