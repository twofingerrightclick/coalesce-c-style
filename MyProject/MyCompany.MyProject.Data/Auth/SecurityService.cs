
namespace MyCompany.MyProject.Data.Auth;

[Coalesce, Service]
public class SecurityService()
{
    [Coalesce, Execute(HttpMethod = HttpMethod.Get)]
    public UserInfo WhoAmI(ClaimsPrincipal user, AppDbContext db)
    {

        return new UserInfo
        {
            Id = user.FindFirstValue(ClaimTypes.NameIdentifier),
            UserName = user.Identity?.Name,

        };
    }
}
