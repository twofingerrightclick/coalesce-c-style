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


export class CompanyApiClient extends ModelApiClient<$models.Company> {
  constructor() { super($metadata.Company) }
}


export class PersonApiClient extends ModelApiClient<$models.Person> {
  constructor() { super($metadata.Person) }
  
  /** Raises this person's level and returns a summary. */
  public promote(id: number | null, reason: string | null, levels?: number | null, notify?: boolean | null, $config?: AxiosRequestConfig): AxiosPromise<ItemResult<string>> {
    const $method = this.$metadata.methods.promote
    const $params =  {
      id,
      reason,
      levels,
      notify,
    }
    return this.$invoke($method, $params, $config)
  }
  
  
  public archive(id: number | null, $config?: AxiosRequestConfig): AxiosPromise<ItemResult<void>> {
    const $method = this.$metadata.methods.archive
    const $params =  {
      id,
    }
    return this.$invoke($method, $params, $config)
  }
  
  
  public changeCompany(id: number | null, company: $models.Company | null, $config?: AxiosRequestConfig): AxiosPromise<ItemResult<$models.Person>> {
    const $method = this.$metadata.methods.changeCompany
    const $params =  {
      id,
      company,
    }
    return this.$invoke($method, $params, $config)
  }
  
  
  public downloadCard(id: number | null, $config?: AxiosRequestConfig): AxiosPromise<ItemResult<File>> {
    const $method = this.$metadata.methods.downloadCard
    const $params =  {
      id,
    }
    return this.$invoke($method, $params, $config)
  }
  
  
  public uploadResume(id: number | null, file: File | null, $config?: AxiosRequestConfig): AxiosPromise<ItemResult<void>> {
    const $method = this.$metadata.methods.uploadResume
    const $params =  {
      id,
      file,
    }
    return this.$invoke($method, $params, $config)
  }
  
  
  public nicknameSuggestions(page?: number | null, search?: string | null, $config?: AxiosRequestConfig): AxiosPromise<ItemResult<string[]>> {
    const $method = this.$metadata.methods.nicknameSuggestions
    const $params =  {
      page,
      search,
    }
    return this.$invoke($method, $params, $config)
  }
  
  
  public countActive($config?: AxiosRequestConfig): AxiosPromise<ItemResult<number>> {
    const $method = this.$metadata.methods.countActive
    const $params =  {
    }
    return this.$invoke($method, $params, $config)
  }
  
  
  public scheduleReview(date?: Date | null, time?: Date | null, status?: $models.PersonStatus | null, $config?: AxiosRequestConfig): AxiosPromise<ItemResult<Date>> {
    const $method = this.$metadata.methods.scheduleReview
    const $params =  {
      date,
      time,
      status,
    }
    return this.$invoke($method, $params, $config)
  }
  
  
  public failingMethod($config?: AxiosRequestConfig): AxiosPromise<ItemResult<void>> {
    const $method = this.$metadata.methods.failingMethod
    const $params =  {
    }
    return this.$invoke($method, $params, $config)
  }
  
}


export class PersonTagApiClient extends ModelApiClient<$models.PersonTag> {
  constructor() { super($metadata.PersonTag) }
}


export class TagApiClient extends ModelApiClient<$models.Tag> {
  constructor() { super($metadata.Tag) }
}


