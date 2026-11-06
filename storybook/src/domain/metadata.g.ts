import { getEnumMeta, solidify } from 'coalesce-vue/lib/metadata'
import type {
  Domain, ModelType, ObjectType, HiddenAreas, BehaviorFlags, 
  PrimitiveProperty, ForeignKeyProperty, PrimaryKeyProperty,
  ModelCollectionNavigationProperty, ModelReferenceNavigationProperty
} from 'coalesce-vue/lib/metadata'


const domain: Domain = { enums: {}, types: {}, services: {} }
export const AuditEntryState = domain.enums.AuditEntryState = {
  name: "AuditEntryState" as const,
  displayName: "Audit Entry State",
  type: "enum",
  ...getEnumMeta<"EntityAdded"|"EntityDeleted"|"EntityModified">([
  {
    value: 0,
    strValue: "EntityAdded",
    displayName: "Entity Added",
  },
  {
    value: 1,
    strValue: "EntityDeleted",
    displayName: "Entity Deleted",
  },
  {
    value: 2,
    strValue: "EntityModified",
    displayName: "Entity Modified",
  },
  ]),
}
export const PersonStatus = domain.enums.PersonStatus = {
  name: "PersonStatus" as const,
  displayName: "Person Status",
  type: "enum",
  ...getEnumMeta<"Active"|"OnLeave"|"Contractor"|"Former">([
  {
    value: 0,
    strValue: "Active",
    displayName: "Active",
    description: "Currently employed.",
  },
  {
    value: 1,
    strValue: "OnLeave",
    displayName: "On Leave",
    description: "Away for a fixed period.",
  },
  {
    value: 2,
    strValue: "Contractor",
    displayName: "Contractor (external)",
  },
  {
    value: 3,
    strValue: "Former",
    displayName: "Former",
  },
  ]),
}
export const Skill = domain.enums.Skill = {
  name: "Skill" as const,
  displayName: "Skill",
  type: "enum",
  ...getEnumMeta<"Design"|"Engineering"|"Writing"|"Research"|"Sales"|"Support">([
  {
    value: 0,
    strValue: "Design",
    displayName: "Design",
  },
  {
    value: 1,
    strValue: "Engineering",
    displayName: "Engineering",
  },
  {
    value: 2,
    strValue: "Writing",
    displayName: "Writing",
  },
  {
    value: 3,
    strValue: "Research",
    displayName: "Research",
  },
  {
    value: 4,
    strValue: "Sales",
    displayName: "Sales",
  },
  {
    value: 5,
    strValue: "Support",
    displayName: "Support",
  },
  ]),
}
export const AuditLog = domain.types.AuditLog = {
  name: "AuditLog" as const,
  displayName: "Audit Log",
  get displayProp() { return this.props.type }, 
  type: "model",
  controllerRoute: "AuditLog",
  get keyProp() { return this.props.id }, 
  behaviorFlags: 0 as BehaviorFlags,
  props: {
    id: {
      name: "id",
      displayName: "Id",
      type: "number",
      role: "primaryKey",
      hidden: 3 as HiddenAreas,
    },
    type: {
      name: "type",
      displayName: "Type",
      type: "string",
      role: "value",
      rules: {
        required: val => (val != null && val !== '') || "Type is required.",
        maxLength: val => !val || val.length <= 100 || "Type may not be more than 100 characters.",
      }
    },
    keyValue: {
      name: "keyValue",
      displayName: "Key Value",
      type: "string",
      role: "value",
    },
    description: {
      name: "description",
      displayName: "Description",
      type: "string",
      role: "value",
    },
    state: {
      name: "state",
      displayName: "Change Type",
      type: "enum",
      get typeDef() { return AuditEntryState },
      role: "value",
    },
    date: {
      name: "date",
      displayName: "Date",
      type: "date",
      dateKind: "datetime",
      role: "value",
    },
    properties: {
      name: "properties",
      displayName: "Properties",
      type: "collection",
      itemType: {
        name: "$collectionItem",
        displayName: "",
        role: "value",
        type: "model",
        get typeDef() { return (domain.types.AuditLogProperty as ModelType & { name: "AuditLogProperty" }) },
      },
      role: "collectionNavigation",
      get foreignKey() { return (domain.types.AuditLogProperty as ModelType & { name: "AuditLogProperty" }).props.parentId as ForeignKeyProperty },
      dontSerialize: true,
    },
    clientIp: {
      name: "clientIp",
      displayName: "Client IP",
      type: "string",
      role: "value",
    },
    referrer: {
      name: "referrer",
      displayName: "Referrer",
      type: "string",
      role: "value",
    },
    endpoint: {
      name: "endpoint",
      displayName: "Endpoint",
      type: "string",
      role: "value",
    },
  },
  methods: {
  },
  dataSources: {
  },
}
export const AuditLogProperty = domain.types.AuditLogProperty = {
  name: "AuditLogProperty" as const,
  displayName: "Audit Log Property",
  get displayProp() { return this.props.propertyName }, 
  type: "model",
  controllerRoute: "AuditLogProperty",
  get keyProp() { return this.props.id }, 
  behaviorFlags: 0 as BehaviorFlags,
  props: {
    id: {
      name: "id",
      displayName: "Id",
      type: "number",
      role: "primaryKey",
      hidden: 3 as HiddenAreas,
    },
    parentId: {
      name: "parentId",
      displayName: "Parent Id",
      type: "number",
      role: "foreignKey",
      get principalKey() { return (domain.types.AuditLog as ModelType & { name: "AuditLog" }).props.id as PrimaryKeyProperty },
      get principalType() { return (domain.types.AuditLog as ModelType & { name: "AuditLog" }) },
      rules: {
        required: val => val != null || "Parent Id is required.",
      }
    },
    propertyName: {
      name: "propertyName",
      displayName: "Property Name",
      type: "string",
      role: "value",
      rules: {
        required: val => (val != null && val !== '') || "Property Name is required.",
        maxLength: val => !val || val.length <= 100 || "Property Name may not be more than 100 characters.",
      }
    },
    oldValue: {
      name: "oldValue",
      displayName: "Old Value",
      type: "string",
      role: "value",
    },
    oldValueDescription: {
      name: "oldValueDescription",
      displayName: "Old Value Description",
      type: "string",
      role: "value",
    },
    newValue: {
      name: "newValue",
      displayName: "New Value",
      type: "string",
      role: "value",
    },
    newValueDescription: {
      name: "newValueDescription",
      displayName: "New Value Description",
      type: "string",
      role: "value",
    },
  },
  methods: {
  },
  dataSources: {
  },
}
export const Company = domain.types.Company = {
  name: "Company" as const,
  displayName: "Company",
  get displayProp() { return this.props.name }, 
  type: "model",
  controllerRoute: "Company",
  get keyProp() { return this.props.companyId }, 
  behaviorFlags: 7 as BehaviorFlags,
  props: {
    companyId: {
      name: "companyId",
      displayName: "Company Id",
      type: "number",
      role: "primaryKey",
      hidden: 3 as HiddenAreas,
    },
    name: {
      name: "name",
      displayName: "Name",
      type: "string",
      role: "value",
      rules: {
        required: val => (val != null && val !== '') || "Name is required.",
      }
    },
    city: {
      name: "city",
      displayName: "City",
      type: "string",
      role: "value",
    },
    website: {
      name: "website",
      displayName: "Website",
      type: "string",
      subtype: "url",
      role: "value",
    },
    logoUrl: {
      name: "logoUrl",
      displayName: "Logo Url",
      type: "string",
      subtype: "url-image",
      role: "value",
    },
    founded: {
      name: "founded",
      displayName: "Founded",
      type: "date",
      dateKind: "date",
      noOffset: true,
      role: "value",
    },
    isPublic: {
      name: "isPublic",
      displayName: "Is Public",
      type: "boolean",
      role: "value",
    },
    employees: {
      name: "employees",
      displayName: "Employees",
      type: "collection",
      itemType: {
        name: "$collectionItem",
        displayName: "",
        role: "value",
        type: "model",
        get typeDef() { return (domain.types.Person as ModelType & { name: "Person" }) },
      },
      role: "collectionNavigation",
      get foreignKey() { return (domain.types.Person as ModelType & { name: "Person" }).props.companyId as ForeignKeyProperty },
      get inverseNavigation() { return (domain.types.Person as ModelType & { name: "Person" }).props.company as ModelReferenceNavigationProperty },
      dontSerialize: true,
    },
  },
  methods: {
  },
  dataSources: {
  },
}
export const Person = domain.types.Person = {
  name: "Person" as const,
  displayName: "Person",
  description: "A person in the directory. Covers every property type Coalesce renders.",
  get displayProp() { return this.props.name }, 
  type: "model",
  controllerRoute: "Person",
  get keyProp() { return this.props.personId }, 
  behaviorFlags: 7 as BehaviorFlags,
  props: {
    personId: {
      name: "personId",
      displayName: "Person Id",
      type: "number",
      role: "primaryKey",
      hidden: 3 as HiddenAreas,
    },
    name: {
      name: "name",
      displayName: "Name",
      type: "string",
      role: "value",
      rules: {
        required: val => (val != null && val !== '') || "Name is required.",
        maxLength: val => !val || val.length <= 100 || "Name may not be more than 100 characters.",
      }
    },
    bio: {
      name: "bio",
      displayName: "Bio",
      description: "A few sentences about this person.",
      type: "string",
      subtype: "multiline",
      role: "value",
    },
    email: {
      name: "email",
      displayName: "Email",
      type: "string",
      subtype: "email",
      role: "value",
    },
    phone: {
      name: "phone",
      displayName: "Phone",
      type: "string",
      subtype: "tel",
      role: "value",
    },
    website: {
      name: "website",
      displayName: "Website",
      type: "string",
      subtype: "url",
      role: "value",
    },
    avatarUrl: {
      name: "avatarUrl",
      displayName: "Avatar Url",
      type: "string",
      subtype: "url-image",
      role: "value",
    },
    favoriteColor: {
      name: "favoriteColor",
      displayName: "Favorite Color",
      type: "string",
      subtype: "color",
      role: "value",
    },
    password: {
      name: "password",
      displayName: "Password",
      type: "string",
      subtype: "password",
      role: "value",
    },
    age: {
      name: "age",
      displayName: "Age",
      type: "number",
      role: "value",
      rules: {
        min: val => val == null || val >= 0 || "Age must be at least 0.",
        max: val => val == null || val <= 130 || "Age may not be more than 130.",
      }
    },
    salary: {
      name: "salary",
      displayName: "Salary (USD)",
      type: "number",
      role: "value",
    },
    rating: {
      name: "rating",
      displayName: "Rating",
      type: "number",
      role: "value",
    },
    isActive: {
      name: "isActive",
      displayName: "Is Active",
      type: "boolean",
      role: "value",
    },
    status: {
      name: "status",
      displayName: "Status",
      type: "enum",
      get typeDef() { return PersonStatus },
      role: "value",
    },
    skills: {
      name: "skills",
      displayName: "Skills",
      type: "collection",
      itemType: {
        name: "$collectionItem",
        displayName: "",
        role: "value",
        type: "enum",
        get typeDef() { return Skill },
      },
      role: "value",
    },
    birthDate: {
      name: "birthDate",
      displayName: "Birth Date",
      type: "date",
      dateKind: "date",
      noOffset: true,
      role: "value",
    },
    startTime: {
      name: "startTime",
      displayName: "Start Time",
      type: "date",
      dateKind: "time",
      noOffset: true,
      role: "value",
    },
    lastLogin: {
      name: "lastLogin",
      displayName: "Last Login",
      type: "date",
      dateKind: "datetime",
      role: "value",
    },
    createdAt: {
      name: "createdAt",
      displayName: "Created At",
      type: "date",
      dateKind: "datetime",
      noOffset: true,
      role: "value",
    },
    resume: {
      name: "resume",
      displayName: "Resume",
      type: "binary",
      base64: true,
      role: "value",
    },
    companyId: {
      name: "companyId",
      displayName: "Company Id",
      type: "number",
      role: "foreignKey",
      get principalKey() { return (domain.types.Company as ModelType & { name: "Company" }).props.companyId as PrimaryKeyProperty },
      get principalType() { return (domain.types.Company as ModelType & { name: "Company" }) },
      get navigationProp() { return (domain.types.Person as ModelType & { name: "Person" }).props.company as ModelReferenceNavigationProperty },
      hidden: 3 as HiddenAreas,
    },
    company: {
      name: "company",
      displayName: "Company",
      type: "model",
      get typeDef() { return (domain.types.Company as ModelType & { name: "Company" }) },
      role: "referenceNavigation",
      get foreignKey() { return (domain.types.Person as ModelType & { name: "Person" }).props.companyId as ForeignKeyProperty },
      get principalKey() { return (domain.types.Company as ModelType & { name: "Company" }).props.companyId as PrimaryKeyProperty },
      get inverseNavigation() { return (domain.types.Company as ModelType & { name: "Company" }).props.employees as ModelCollectionNavigationProperty },
      dontSerialize: true,
    },
    managerId: {
      name: "managerId",
      displayName: "Manager Id",
      type: "number",
      role: "foreignKey",
      get principalKey() { return (domain.types.Person as ModelType & { name: "Person" }).props.personId as PrimaryKeyProperty },
      get principalType() { return (domain.types.Person as ModelType & { name: "Person" }) },
      get navigationProp() { return (domain.types.Person as ModelType & { name: "Person" }).props.manager as ModelReferenceNavigationProperty },
      hidden: 3 as HiddenAreas,
    },
    manager: {
      name: "manager",
      displayName: "Manager",
      type: "model",
      get typeDef() { return (domain.types.Person as ModelType & { name: "Person" }) },
      role: "referenceNavigation",
      get foreignKey() { return (domain.types.Person as ModelType & { name: "Person" }).props.managerId as ForeignKeyProperty },
      get principalKey() { return (domain.types.Person as ModelType & { name: "Person" }).props.personId as PrimaryKeyProperty },
      dontSerialize: true,
    },
    personTags: {
      name: "personTags",
      displayName: "Person Tags",
      type: "collection",
      itemType: {
        name: "$collectionItem",
        displayName: "",
        role: "value",
        type: "model",
        get typeDef() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }) },
      },
      role: "collectionNavigation",
      get foreignKey() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.personId as ForeignKeyProperty },
      get inverseNavigation() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.person as ModelReferenceNavigationProperty },
      manyToMany: {
        name: "tags",
        displayName: "Tags",
        get typeDef() { return (domain.types.Tag as ModelType & { name: "Tag" }) },
        get farForeignKey() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.tagId as ForeignKeyProperty },
        get farNavigationProp() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.tag as ModelReferenceNavigationProperty },
        get nearForeignKey() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.personId as ForeignKeyProperty },
        get nearNavigationProp() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.person as ModelReferenceNavigationProperty },
      },
      dontSerialize: true,
    },
    nicknames: {
      name: "nicknames",
      displayName: "Nicknames",
      type: "collection",
      itemType: {
        name: "$collectionItem",
        displayName: "",
        role: "value",
        type: "string",
      },
      role: "value",
    },
    luckyNumbers: {
      name: "luckyNumbers",
      displayName: "Lucky Numbers",
      type: "collection",
      itemType: {
        name: "$collectionItem",
        displayName: "",
        role: "value",
        type: "number",
      },
      role: "value",
    },
  },
  methods: {
    promote: {
      name: "promote",
      displayName: "Promote",
      description: "Raises this person's level and returns a summary.",
      transportType: "item",
      httpMethod: "POST",
      params: {
        id: {
          name: "id",
          displayName: "Primary Key",
          type: "number",
          role: "value",
          get source() { return (domain.types.Person as ModelType & { name: "Person" }).props.personId },
          rules: {
            required: val => val != null || "Primary Key is required.",
          }
        },
        reason: {
          name: "reason",
          displayName: "Reason",
          type: "string",
          role: "value",
          rules: {
            required: val => (val != null && val !== '') || "Reason is required.",
          }
        },
        levels: {
          name: "levels",
          displayName: "Levels",
          type: "number",
          role: "value",
        },
        notify: {
          name: "notify",
          displayName: "Notify",
          type: "boolean",
          role: "value",
        },
      },
      return: {
        name: "$return",
        displayName: "Result",
        type: "string",
        role: "value",
      },
    },
    archive: {
      name: "archive",
      displayName: "Archive",
      transportType: "item",
      httpMethod: "POST",
      params: {
        id: {
          name: "id",
          displayName: "Primary Key",
          type: "number",
          role: "value",
          get source() { return (domain.types.Person as ModelType & { name: "Person" }).props.personId },
          rules: {
            required: val => val != null || "Primary Key is required.",
          }
        },
      },
      return: {
        name: "$return",
        displayName: "Result",
        type: "void",
        role: "value",
      },
    },
    changeCompany: {
      name: "changeCompany",
      displayName: "Change Company",
      transportType: "item",
      httpMethod: "POST",
      params: {
        id: {
          name: "id",
          displayName: "Primary Key",
          type: "number",
          role: "value",
          get source() { return (domain.types.Person as ModelType & { name: "Person" }).props.personId },
          rules: {
            required: val => val != null || "Primary Key is required.",
          }
        },
        company: {
          name: "company",
          displayName: "Company",
          type: "model",
          get typeDef() { return (domain.types.Company as ModelType & { name: "Company" }) },
          role: "value",
          rules: {
            required: val => val != null || "Company is required.",
          }
        },
      },
      return: {
        name: "$return",
        displayName: "Result",
        type: "model",
        get typeDef() { return (domain.types.Person as ModelType & { name: "Person" }) },
        role: "value",
      },
    },
    downloadCard: {
      name: "downloadCard",
      displayName: "Download Card",
      transportType: "item",
      httpMethod: "POST",
      params: {
        id: {
          name: "id",
          displayName: "Primary Key",
          type: "number",
          role: "value",
          get source() { return (domain.types.Person as ModelType & { name: "Person" }).props.personId },
          rules: {
            required: val => val != null || "Primary Key is required.",
          }
        },
      },
      return: {
        name: "$return",
        displayName: "Result",
        type: "file",
        role: "value",
      },
    },
    uploadResume: {
      name: "uploadResume",
      displayName: "Upload Resume",
      transportType: "item",
      httpMethod: "POST",
      params: {
        id: {
          name: "id",
          displayName: "Primary Key",
          type: "number",
          role: "value",
          get source() { return (domain.types.Person as ModelType & { name: "Person" }).props.personId },
          rules: {
            required: val => val != null || "Primary Key is required.",
          }
        },
        file: {
          name: "file",
          displayName: "File",
          type: "file",
          role: "value",
          rules: {
            required: val => val != null || "File is required.",
          }
        },
      },
      return: {
        name: "$return",
        displayName: "Result",
        type: "void",
        role: "value",
      },
    },
    nicknameSuggestions: {
      name: "nicknameSuggestions",
      displayName: "Nickname Suggestions",
      transportType: "item",
      httpMethod: "POST",
      isStatic: true,
      params: {
        page: {
          name: "page",
          displayName: "Page",
          type: "number",
          role: "value",
        },
        search: {
          name: "search",
          displayName: "Search",
          type: "string",
          role: "value",
        },
      },
      return: {
        name: "$return",
        displayName: "Result",
        type: "collection",
        itemType: {
          name: "$collectionItem",
          displayName: "",
          role: "value",
          type: "string",
        },
        role: "value",
      },
    },
    countActive: {
      name: "countActive",
      displayName: "Count Active",
      transportType: "item",
      httpMethod: "POST",
      isStatic: true,
      params: {
      },
      return: {
        name: "$return",
        displayName: "Result",
        type: "number",
        role: "value",
      },
    },
    scheduleReview: {
      name: "scheduleReview",
      displayName: "Schedule Review",
      transportType: "item",
      httpMethod: "POST",
      isStatic: true,
      params: {
        date: {
          name: "date",
          displayName: "Date",
          type: "date",
          dateKind: "date",
          noOffset: true,
          role: "value",
        },
        time: {
          name: "time",
          displayName: "Time",
          type: "date",
          dateKind: "time",
          noOffset: true,
          role: "value",
        },
        status: {
          name: "status",
          displayName: "Status",
          type: "enum",
          get typeDef() { return PersonStatus },
          role: "value",
        },
      },
      return: {
        name: "$return",
        displayName: "Result",
        type: "date",
        dateKind: "datetime",
        role: "value",
      },
    },
    failingMethod: {
      name: "failingMethod",
      displayName: "Failing Method",
      transportType: "item",
      httpMethod: "POST",
      isStatic: true,
      params: {
      },
      return: {
        name: "$return",
        displayName: "Result",
        type: "void",
        role: "value",
      },
    },
  },
  dataSources: {
  },
}
export const PersonTag = domain.types.PersonTag = {
  name: "PersonTag" as const,
  displayName: "Person Tag",
  get displayProp() { return this.props.personTagId }, 
  type: "model",
  controllerRoute: "PersonTag",
  get keyProp() { return this.props.personTagId }, 
  behaviorFlags: 7 as BehaviorFlags,
  props: {
    personTagId: {
      name: "personTagId",
      displayName: "Person Tag Id",
      type: "number",
      role: "primaryKey",
      hidden: 3 as HiddenAreas,
    },
    personId: {
      name: "personId",
      displayName: "Person Id",
      type: "number",
      role: "foreignKey",
      get principalKey() { return (domain.types.Person as ModelType & { name: "Person" }).props.personId as PrimaryKeyProperty },
      get principalType() { return (domain.types.Person as ModelType & { name: "Person" }) },
      get navigationProp() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.person as ModelReferenceNavigationProperty },
      hidden: 3 as HiddenAreas,
      rules: {
        required: val => val != null || "Person is required.",
      }
    },
    person: {
      name: "person",
      displayName: "Person",
      type: "model",
      get typeDef() { return (domain.types.Person as ModelType & { name: "Person" }) },
      role: "referenceNavigation",
      get foreignKey() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.personId as ForeignKeyProperty },
      get principalKey() { return (domain.types.Person as ModelType & { name: "Person" }).props.personId as PrimaryKeyProperty },
      get inverseNavigation() { return (domain.types.Person as ModelType & { name: "Person" }).props.personTags as ModelCollectionNavigationProperty },
      dontSerialize: true,
    },
    tagId: {
      name: "tagId",
      displayName: "Tag Id",
      type: "number",
      role: "foreignKey",
      get principalKey() { return (domain.types.Tag as ModelType & { name: "Tag" }).props.tagId as PrimaryKeyProperty },
      get principalType() { return (domain.types.Tag as ModelType & { name: "Tag" }) },
      get navigationProp() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.tag as ModelReferenceNavigationProperty },
      hidden: 3 as HiddenAreas,
      rules: {
        required: val => val != null || "Tag is required.",
      }
    },
    tag: {
      name: "tag",
      displayName: "Tag",
      type: "model",
      get typeDef() { return (domain.types.Tag as ModelType & { name: "Tag" }) },
      role: "referenceNavigation",
      get foreignKey() { return (domain.types.PersonTag as ModelType & { name: "PersonTag" }).props.tagId as ForeignKeyProperty },
      get principalKey() { return (domain.types.Tag as ModelType & { name: "Tag" }).props.tagId as PrimaryKeyProperty },
      dontSerialize: true,
    },
  },
  methods: {
  },
  dataSources: {
  },
}
export const Tag = domain.types.Tag = {
  name: "Tag" as const,
  displayName: "Tag",
  get displayProp() { return this.props.name }, 
  type: "model",
  controllerRoute: "Tag",
  get keyProp() { return this.props.tagId }, 
  behaviorFlags: 7 as BehaviorFlags,
  props: {
    tagId: {
      name: "tagId",
      displayName: "Tag Id",
      type: "number",
      role: "primaryKey",
      hidden: 3 as HiddenAreas,
    },
    name: {
      name: "name",
      displayName: "Name",
      type: "string",
      role: "value",
      rules: {
        required: val => (val != null && val !== '') || "Name is required.",
      }
    },
    color: {
      name: "color",
      displayName: "Color",
      type: "string",
      subtype: "color",
      role: "value",
    },
  },
  methods: {
  },
  dataSources: {
  },
}

interface AppDomain extends Domain {
  enums: {
    AuditEntryState: typeof AuditEntryState
    PersonStatus: typeof PersonStatus
    Skill: typeof Skill
  }
  types: {
    AuditLog: typeof AuditLog
    AuditLogProperty: typeof AuditLogProperty
    Company: typeof Company
    Person: typeof Person
    PersonTag: typeof PersonTag
    Tag: typeof Tag
  }
  services: {
  }
}

solidify(domain)

export default domain as unknown as AppDomain
