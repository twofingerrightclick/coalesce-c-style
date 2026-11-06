using MyCompany.MyProject.Data.Auth;
using IntelliTect.Coalesce.Utilities;

namespace MyCompany.MyProject.Data.Models;

public abstract class TrackingBase
{

    [Read]
    public string? ModifiedById { get; set; }

    [Read, Display(Order = 1000012)]
    public DateTimeOffset ModifiedOn { get; set; }


    [Read]
    public string? CreatedById { get; set; }

    [Read, Display(Order = 1000002)]
    public DateTimeOffset CreatedOn { get; set; }

    [InternalUse]
    public void SetTracking(string? userId)
    {
        if (CreatedOn == default)
        {
            // CreatedOn is checked so that we can avoid setting CreatedBy
            // to some future modifying user if the entity was created with a CreatedOn
            // stamp but not a CreatedBy stamp (which happens for entities created by migrations or background jobs).
            CreatedById = userId;
            CreatedOn = DateTimeOffset.Now;
        }

        ModifiedById = userId;
        ModifiedOn = DateTimeOffset.Now;
    }

    public void SetTracking(ClaimsPrincipal? user) => SetTracking(user?.GetUserId());
}