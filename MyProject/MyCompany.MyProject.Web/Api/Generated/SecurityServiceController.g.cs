
using IntelliTect.Coalesce;
using IntelliTect.Coalesce.Api;
using IntelliTect.Coalesce.Api.Behaviors;
using IntelliTect.Coalesce.Api.Controllers;
using IntelliTect.Coalesce.Api.DataSources;
using IntelliTect.Coalesce.Mapping;
using IntelliTect.Coalesce.Mapping.IncludeTrees;
using IntelliTect.Coalesce.Models;
using IntelliTect.Coalesce.TypeDefinition;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MyCompany.MyProject.Web.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace MyCompany.MyProject.Web.Api
{
    [Route("api/SecurityService")]
    [ServiceFilter(typeof(IApiActionFilter))]
    public partial class SecurityServiceController : BaseApiController
    {
        protected MyCompany.MyProject.Data.Auth.SecurityService Service { get; }

        public SecurityServiceController(CrudContext context, MyCompany.MyProject.Data.Auth.SecurityService service) : base(context)
        {
            GeneratedForClassViewModel = context.ReflectionRepository.GetClassViewModel<MyCompany.MyProject.Data.Auth.SecurityService>();
            Service = service;
        }

        /// <summary>
        /// Method: WhoAmI
        /// </summary>
        [HttpGet("WhoAmI")]
        [Authorize]
        public virtual ItemResult<UserInfoResponse> WhoAmI(
            [FromServices] MyCompany.MyProject.Data.AppDbContext db)
        {
            var _method = GeneratedForClassViewModel!.MethodByName("WhoAmI");
            IncludeTree includeTree = null;
            var _mappingContext = new MappingContext(Context);
            var _methodResult = Service.WhoAmI(
                User,
                db
            );
            var _result = new ItemResult<UserInfoResponse>();
            _result.Object = Mapper.MapToDto<MyCompany.MyProject.Data.Auth.UserInfo, UserInfoResponse>(_methodResult, _mappingContext, includeTree);
            return _result;
        }
    }
}
