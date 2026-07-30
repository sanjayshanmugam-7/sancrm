using SanCRM.Application.DTOs;

namespace SanCRM.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, string ipAddress);
    Task<UserDto> RegisterAsync(RegisterRequest request);
    Task ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<UserDto> GetCurrentUserAsync(int userId);
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task LogoutAsync(int userId, string ipAddress);
}
