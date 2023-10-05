using API.DTOs;
using API.Services;
using Application.Core;
using Application.Emails;
using Application.Interfaces;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static API.Controllers.UserRolesController;

namespace API.Controllers

{
    public class UserRolesController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserRolesController(UserManager<AppUser> userManager,  RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetUserRoles()
        {
            var rolesUsersList = new List<UserRoleDTO>();

            // Get roles
            var roles = _roleManager.Roles.ToList();

            foreach (var role in roles)
            {
                var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name);
                var userNamesInRole = usersInRole.Select(u => u.UserName).ToList();
                rolesUsersList.Add(new UserRoleDTO { RoleId = role.Id, RoleName = role.Name, UserNames = userNamesInRole });
            }

            return Ok(rolesUsersList);
        }

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> Post(RoleUserDTO roleUserDTO)
        {
            var user = await _userManager.FindByEmailAsync(roleUserDTO.email);
            if (user == null)
            {
                user = new AppUser
                {
                    DisplayName = roleUserDTO.email,
                    Email = roleUserDTO.email,
                    UserName = roleUserDTO.email
                };
                user.EmailConfirmed = true;
                //this password will not actually be used login is with cac or edu.
                var result = await _userManager.CreateAsync(user, "Password");
            }
            var role = await _roleManager.FindByIdAsync(roleUserDTO.Id);
            if (role == null)
            {
                return NotFound("Role not found");  // or handle this in another appropriate way
            }

            await _userManager.AddToRoleAsync(user, role.Name);

            return Ok();

        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}/{email}")]
        public async Task<ActionResult> Delete(string id, string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if(user == null)
            {
                return NotFound("User not Found");
            }
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null) {
                return NotFound("Role not Found");
            }
            var result = await _userManager.RemoveFromRoleAsync(user, role.Name);
            if (!result.Succeeded)
            {
                // Handle the error situation if you need to...
                return BadRequest("Failed to remove role from user");
            }

            return Ok();
        }

        [Authorize(Roles = "admin")]
        [HttpPost("delete")]
        public async Task<IActionResult> DeleteRole(RoleUserDTOForDelete roleUserDTO)
        {
            var user = await _userManager.FindByEmailAsync(roleUserDTO.Email);
            if (user == null)
            {
                return NotFound("User not Found");
            }
            var role = await _roleManager.FindByIdAsync(roleUserDTO.Id);
          
            if (role == null)
            {
                return NotFound("Role not Found");
            }
            var result = await _userManager.RemoveFromRoleAsync(user, role.Name);
            if (!result.Succeeded)
            {
                // Handle the error situation if you need to...
                return BadRequest("Failed to remove role from user");
            }
            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("armywarcollegeusers")]
        public async Task<IActionResult> GetArmyWarCollegeUsers()
        {
            var users = await _userManager.Users
           .Where(u => u.Email.EndsWith("@armywarcollege.edu"))
           .Select(u => new
           {
               u.Email,
               u.DisplayName
           })
           .ToListAsync();

            return Ok(users);
        }



        public class UserRoleDTO
        {
            public string RoleId { get; set; }
            public string RoleName { get; set; }
            public IList<string> UserNames { get; set; }
        }

        public class RoleUserDTO
        {
            public string Id { get; set; }
            public string email { get; set; }
        }
        public class RoleUserDTOForDelete
        {
            public string Id { get; set; }
            public string Email { get; set; }
        }
    }
}
