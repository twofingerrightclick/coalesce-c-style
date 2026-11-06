import * as metadata from './metadata.g'
import { convertToModel, mapToModel, reactiveDataSource } from 'coalesce-vue/lib/model'
import type { Model, DataSource } from 'coalesce-vue/lib/model'
import type { ClassType } from 'coalesce-vue/lib/metadata'

export enum AuditEntryState {
  EntityAdded = 0,
  EntityDeleted = 1,
  EntityModified = 2,
}


export enum PersonStatus {
  
  /** Currently employed. */
  Active = 0,
  
  /** Away for a fixed period. */
  OnLeave = 1,
  Contractor = 2,
  Former = 3,
}


export enum Skill {
  Design = 0,
  Engineering = 1,
  Writing = 2,
  Research = 3,
  Sales = 4,
  Support = 5,
}


export interface AuditLog extends Model<typeof metadata.AuditLog> {
  id: number | null
  type: string | null
  keyValue: string | null
  description: string | null
  state: AuditEntryState | null
  date: Date | null
  properties: AuditLogProperty[] | null
  clientIp: string | null
  referrer: string | null
  endpoint: string | null
}
export class AuditLog {
  
  /** Mutates the input object and its descendants into a valid AuditLog implementation. */
  static convert(data?: Partial<AuditLog>): AuditLog {
    return convertToModel<AuditLog>(data || {}, metadata.AuditLog) 
  }
  
  /** Maps the input object and its descendants to a new, valid AuditLog implementation. */
  static map(data?: Partial<AuditLog>): AuditLog {
    return mapToModel<AuditLog>(data || {}, metadata.AuditLog) 
  }
  
  static [Symbol.hasInstance](x: any) { return x?.$metadata === metadata.AuditLog; }
  
  /** Instantiate a new AuditLog, optionally basing it on the given data. */
  constructor(data?: Partial<AuditLog> | {[k: string]: any}) {
    Object.assign(this, AuditLog.map(data || {}));
  }
}


export interface AuditLogProperty extends Model<typeof metadata.AuditLogProperty> {
  id: number | null
  parentId: number | null
  propertyName: string | null
  oldValue: string | null
  oldValueDescription: string | null
  newValue: string | null
  newValueDescription: string | null
}
export class AuditLogProperty {
  
  /** Mutates the input object and its descendants into a valid AuditLogProperty implementation. */
  static convert(data?: Partial<AuditLogProperty>): AuditLogProperty {
    return convertToModel<AuditLogProperty>(data || {}, metadata.AuditLogProperty) 
  }
  
  /** Maps the input object and its descendants to a new, valid AuditLogProperty implementation. */
  static map(data?: Partial<AuditLogProperty>): AuditLogProperty {
    return mapToModel<AuditLogProperty>(data || {}, metadata.AuditLogProperty) 
  }
  
  static [Symbol.hasInstance](x: any) { return x?.$metadata === metadata.AuditLogProperty; }
  
  /** Instantiate a new AuditLogProperty, optionally basing it on the given data. */
  constructor(data?: Partial<AuditLogProperty> | {[k: string]: any}) {
    Object.assign(this, AuditLogProperty.map(data || {}));
  }
}


export interface Company extends Model<typeof metadata.Company> {
  companyId: number | null
  name: string | null
  city: string | null
  website: string | null
  logoUrl: string | null
  founded: Date | null
  isPublic: boolean | null
  employees: Person[] | null
}
export class Company {
  
  /** Mutates the input object and its descendants into a valid Company implementation. */
  static convert(data?: Partial<Company>): Company {
    return convertToModel<Company>(data || {}, metadata.Company) 
  }
  
  /** Maps the input object and its descendants to a new, valid Company implementation. */
  static map(data?: Partial<Company>): Company {
    return mapToModel<Company>(data || {}, metadata.Company) 
  }
  
  static [Symbol.hasInstance](x: any) { return x?.$metadata === metadata.Company; }
  
  /** Instantiate a new Company, optionally basing it on the given data. */
  constructor(data?: Partial<Company> | {[k: string]: any}) {
    Object.assign(this, Company.map(data || {}));
  }
}


export interface Person extends Model<typeof metadata.Person> {
  personId: number | null
  name: string | null
  
  /** A few sentences about this person. */
  bio: string | null
  email: string | null
  phone: string | null
  website: string | null
  avatarUrl: string | null
  favoriteColor: string | null
  password: string | null
  age: number | null
  salary: number | null
  rating: number | null
  isActive: boolean | null
  status: PersonStatus | null
  skills: Skill[] | null
  birthDate: Date | null
  startTime: Date | null
  lastLogin: Date | null
  createdAt: Date | null
  resume: string | null
  companyId: number | null
  company: Company | null
  managerId: number | null
  manager: Person | null
  personTags: PersonTag[] | null
  nicknames: string[] | null
  luckyNumbers: number[] | null
}
export class Person {
  
  /** Mutates the input object and its descendants into a valid Person implementation. */
  static convert(data?: Partial<Person>): Person {
    return convertToModel<Person>(data || {}, metadata.Person) 
  }
  
  /** Maps the input object and its descendants to a new, valid Person implementation. */
  static map(data?: Partial<Person>): Person {
    return mapToModel<Person>(data || {}, metadata.Person) 
  }
  
  static [Symbol.hasInstance](x: any) { return x?.$metadata === metadata.Person; }
  
  /** Instantiate a new Person, optionally basing it on the given data. */
  constructor(data?: Partial<Person> | {[k: string]: any}) {
    Object.assign(this, Person.map(data || {}));
  }
}


export interface PersonTag extends Model<typeof metadata.PersonTag> {
  personTagId: number | null
  personId: number | null
  person: Person | null
  tagId: number | null
  tag: Tag | null
}
export class PersonTag {
  
  /** Mutates the input object and its descendants into a valid PersonTag implementation. */
  static convert(data?: Partial<PersonTag>): PersonTag {
    return convertToModel<PersonTag>(data || {}, metadata.PersonTag) 
  }
  
  /** Maps the input object and its descendants to a new, valid PersonTag implementation. */
  static map(data?: Partial<PersonTag>): PersonTag {
    return mapToModel<PersonTag>(data || {}, metadata.PersonTag) 
  }
  
  static [Symbol.hasInstance](x: any) { return x?.$metadata === metadata.PersonTag; }
  
  /** Instantiate a new PersonTag, optionally basing it on the given data. */
  constructor(data?: Partial<PersonTag> | {[k: string]: any}) {
    Object.assign(this, PersonTag.map(data || {}));
  }
}


export interface Tag extends Model<typeof metadata.Tag> {
  tagId: number | null
  name: string | null
  color: string | null
}
export class Tag {
  
  /** Mutates the input object and its descendants into a valid Tag implementation. */
  static convert(data?: Partial<Tag>): Tag {
    return convertToModel<Tag>(data || {}, metadata.Tag) 
  }
  
  /** Maps the input object and its descendants to a new, valid Tag implementation. */
  static map(data?: Partial<Tag>): Tag {
    return mapToModel<Tag>(data || {}, metadata.Tag) 
  }
  
  static [Symbol.hasInstance](x: any) { return x?.$metadata === metadata.Tag; }
  
  /** Instantiate a new Tag, optionally basing it on the given data. */
  constructor(data?: Partial<Tag> | {[k: string]: any}) {
    Object.assign(this, Tag.map(data || {}));
  }
}


declare module "coalesce-vue/lib/model" {
  interface EnumTypeLookup {
    AuditEntryState: AuditEntryState
    PersonStatus: PersonStatus
    Skill: Skill
  }
  interface ModelTypeLookup {
    AuditLog: AuditLog
    AuditLogProperty: AuditLogProperty
    Company: Company
    Person: Person
    PersonTag: PersonTag
    Tag: Tag
  }
}
