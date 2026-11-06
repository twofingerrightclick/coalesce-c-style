import * as metadata from './metadata.g'
import { convertToModel, mapToModel, reactiveDataSource } from 'coalesce-vue/lib/model'
import type { Model, DataSource } from 'coalesce-vue/lib/model'
import type { ClassType } from 'coalesce-vue/lib/metadata'

export enum AuditEntryState {
  EntityAdded = 0,
  EntityDeleted = 1,
  EntityModified = 2,
}


export enum WidgetCategory {
  Whizbangs = 0,
  Sprecklesprockets = 1,
  Discombobulators = 2,
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


export interface Widget extends Model<typeof metadata.Widget> {
  widgetId: number | null
  name: string | null
  category: WidgetCategory | null
  inventedOn: Date | null
  modifiedById: string | null
  modifiedOn: Date | null
  createdById: string | null
  createdOn: Date | null
}
export class Widget {
  
  /** Mutates the input object and its descendants into a valid Widget implementation. */
  static convert(data?: Partial<Widget>): Widget {
    return convertToModel<Widget>(data || {}, metadata.Widget) 
  }
  
  /** Maps the input object and its descendants to a new, valid Widget implementation. */
  static map(data?: Partial<Widget>): Widget {
    return mapToModel<Widget>(data || {}, metadata.Widget) 
  }
  
  static [Symbol.hasInstance](x: any) { return x?.$metadata === metadata.Widget; }
  
  /** Instantiate a new Widget, optionally basing it on the given data. */
  constructor(data?: Partial<Widget> | {[k: string]: any}) {
    Object.assign(this, Widget.map(data || {}));
  }
}


export interface UserInfo extends Model<typeof metadata.UserInfo> {
  id: string | null
  userName: string | null
}
export class UserInfo {
  
  /** Mutates the input object and its descendants into a valid UserInfo implementation. */
  static convert(data?: Partial<UserInfo>): UserInfo {
    return convertToModel<UserInfo>(data || {}, metadata.UserInfo) 
  }
  
  /** Maps the input object and its descendants to a new, valid UserInfo implementation. */
  static map(data?: Partial<UserInfo>): UserInfo {
    return mapToModel<UserInfo>(data || {}, metadata.UserInfo) 
  }
  
  static [Symbol.hasInstance](x: any) { return x?.$metadata === metadata.UserInfo; }
  
  /** Instantiate a new UserInfo, optionally basing it on the given data. */
  constructor(data?: Partial<UserInfo> | {[k: string]: any}) {
    Object.assign(this, UserInfo.map(data || {}));
  }
}


declare module "coalesce-vue/lib/model" {
  interface EnumTypeLookup {
    AuditEntryState: AuditEntryState
    WidgetCategory: WidgetCategory
  }
  interface ModelTypeLookup {
    AuditLog: AuditLog
    AuditLogProperty: AuditLogProperty
    UserInfo: UserInfo
    Widget: Widget
  }
}
