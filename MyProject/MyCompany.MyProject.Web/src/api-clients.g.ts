import * as $metadata from './metadata.g'
import * as $models from './models.g'
import { ModelApiClient, ServiceApiClient } from 'coalesce-vue/lib/api-client'
import type { AxiosPromise, AxiosRequestConfig, ItemResult, ListResult } from 'coalesce-vue/lib/api-client'

export class AuditLogApiClient extends ModelApiClient<$models.AuditLog> {
  constructor() { super($metadata.AuditLog) }
}


export class AuditLogPropertyApiClient extends ModelApiClient<$models.AuditLogProperty> {
  constructor() { super($metadata.AuditLogProperty) }
}


export class WidgetApiClient extends ModelApiClient<$models.Widget> {
  constructor() { super($metadata.Widget) }
}


export class SecurityServiceApiClient extends ServiceApiClient<typeof $metadata.SecurityService> {
  constructor() { super($metadata.SecurityService) }
  
  public whoAmI($config?: AxiosRequestConfig): AxiosPromise<ItemResult<$models.UserInfo>> {
    const $method = this.$metadata.methods.whoAmI
    const $params =  {
    }
    return this.$invoke($method, $params, $config)
  }
  
}


