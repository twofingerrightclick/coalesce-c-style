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
    public partial class WidgetParameter : SparseDto, IGeneratedParameterDto<MyCompany.MyProject.Data.Models.Widget>
    {
        public WidgetParameter() { }

        private int? _WidgetId;
        private string _Name;
        private MyCompany.MyProject.Data.Models.WidgetCategory? _Category;
        private System.DateTimeOffset? _InventedOn;

        public int? WidgetId
        {
            get => _WidgetId;
            set { _WidgetId = value; Changed(nameof(WidgetId)); }
        }
        public string Name
        {
            get => _Name;
            set { _Name = value; Changed(nameof(Name)); }
        }
        public MyCompany.MyProject.Data.Models.WidgetCategory? Category
        {
            get => _Category;
            set { _Category = value; Changed(nameof(Category)); }
        }
        public System.DateTimeOffset? InventedOn
        {
            get => _InventedOn;
            set { _InventedOn = value; Changed(nameof(InventedOn)); }
        }

        /// <summary>
        /// Map from the current DTO instance to the domain object.
        /// </summary>
        public void MapTo(MyCompany.MyProject.Data.Models.Widget entity, IMappingContext context)
        {
            var includes = context.Includes;

            if (ShouldMapTo(nameof(WidgetId))) entity.WidgetId = (WidgetId ?? entity.WidgetId);
            if (ShouldMapTo(nameof(Name))) entity.Name = Name;
            if (ShouldMapTo(nameof(Category))) entity.Category = (Category ?? entity.Category);
            if (ShouldMapTo(nameof(InventedOn))) entity.InventedOn = InventedOn;
        }

        /// <summary>
        /// Map from the current DTO instance to a new instance of the domain object.
        /// </summary>
        public MyCompany.MyProject.Data.Models.Widget MapToNew(IMappingContext context)
        {
            var includes = context.Includes;

            var entity = new MyCompany.MyProject.Data.Models.Widget()
            {
                Name = Name,
                Category = (Category ?? default),
            };
            if (ShouldMapTo(nameof(WidgetId))) entity.WidgetId = (WidgetId ?? entity.WidgetId);
            if (ShouldMapTo(nameof(InventedOn))) entity.InventedOn = InventedOn;

            return entity;
        }

        public MyCompany.MyProject.Data.Models.Widget MapToModelOrNew(MyCompany.MyProject.Data.Models.Widget obj, IMappingContext context)
        {
            if (obj is null) return MapToNew(context);
            MapTo(obj, context);
            return obj;
        }
    }

    public partial class WidgetResponse : IGeneratedResponseDto<MyCompany.MyProject.Data.Models.Widget>
    {
        public WidgetResponse() { }

        public int? WidgetId { get; set; }
        public string Name { get; set; }
        public MyCompany.MyProject.Data.Models.WidgetCategory? Category { get; set; }
        public System.DateTimeOffset? InventedOn { get; set; }
        public string ModifiedById { get; set; }
        public System.DateTimeOffset? ModifiedOn { get; set; }
        public string CreatedById { get; set; }
        public System.DateTimeOffset? CreatedOn { get; set; }

        /// <summary>
        /// Map from the domain object to the properties of the current DTO instance.
        /// </summary>
        public void MapFrom(MyCompany.MyProject.Data.Models.Widget obj, IMappingContext context, IncludeTree tree = null)
        {
            if (obj == null) return;
            var includes = context.Includes;

            this.WidgetId = obj.WidgetId;
            this.Name = obj.Name;
            this.Category = obj.Category;
            this.InventedOn = obj.InventedOn;
            this.ModifiedById = obj.ModifiedById;
            this.ModifiedOn = obj.ModifiedOn;
            this.CreatedById = obj.CreatedById;
            this.CreatedOn = obj.CreatedOn;
        }
    }
}
