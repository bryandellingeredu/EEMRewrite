

namespace Application.Interfaces
{
    public interface IUserAccessor
    {
        string GetUsername();

        string GetStudentType(string emailaddress);
    }
}
