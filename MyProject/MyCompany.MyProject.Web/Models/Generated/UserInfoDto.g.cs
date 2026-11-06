using IntelliTect.Coalesce;
using IntelliTect.Coalesce.Mapping;
using IntelliTect.Coalesce.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json.Serialization;

namespace MyCompany.MyProject.Web.Models
{
    public partial class UserInfoParameter : SparseDto, IGeneratedParameterDto<MyCompany.MyProject.Data.Auth.UserInfo>
    {
        public UserInfoParameter() { }

        private string _Id;
        private string _UserName;

        public string Id
        {
            get => _Id;
            set { _Id = value; Changed(nameof(Id)); }
        }
        public string UserName
        {
            get => _UserName;
            set { _UserName = value; Changed(nameof(UserName)); }
        }

        /// <summary>
        /// Map from the current DTO instance to the domain object.
        /// </summary>
        public void MapTo(MyCompany.MyProject.Data.Auth.UserInfo entity, IMappingContext context)
        {
            var includes = context.Includes;

            if (ShouldMapTo(nameof(Id))) entity.Id = Id;
            if (ShouldMapTo(nameof(UserName))) entity.UserName = UserName;
        }

        /// <summary>
        /// Map from the current DTO instance to a new instance of the domain object.
        /// </summary>
        public MyCompany.MyProject.Data.Auth.UserInfo MapToNew(IMappingContext context)
        {
            var entity = new MyCompany.MyProject.Data.Auth.UserInfo();
            MapTo(entity, context);
            return entity;
        }

        public MyCompany.MyProject.Data.Auth.UserInfo MapToModelOrNew(MyCompany.MyProject.Data.Auth.UserInfo obj, IMappingContext context)
        {
            if (obj is null) return MapToNew(context);
            MapTo(obj, context);
            return obj;
        }
    }

    public partial class UserInfoResponse : IGeneratedResponseDto<MyCompany.MyProject.Data.Auth.UserInfo>
    {
        public UserInfoResponse() { }

        public string Id { get; set; }
        public string UserName { get; set; }

        /// <summary>
        /// Map from the domain object to the properties of the current DTO instance.
        /// </summary>
        public void MapFrom(MyCompany.MyProject.Data.Auth.UserInfo obj, IMappingContext context, IncludeTree tree = null)
        {
            if (obj == null) return;
            var includes = context.Includes;

            this.Id = obj.Id;
            this.UserName = obj.UserName;
        }
    }
}
