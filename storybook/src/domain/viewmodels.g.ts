import * as $metadata from './metadata.g'
import * as $models from './models.g'
import * as $apiClients from './api-clients.g'
import { ViewModel, ListViewModel, ViewModelCollection, ServiceViewModel, type DeepPartial, defineProps, createAbstractProxyViewModelType } from 'coalesce-vue/lib/viewmodel'

export interface AuditLogViewModel extends $models.AuditLog {
  id: number | null;
  type: string | null;
  keyValue: string | null;
  description: string | null;
  state: $models.AuditEntryState | null;
  date: Date | null;
  get properties(): ViewModelCollection<AuditLogPropertyViewModel, $models.AuditLogProperty>;
  set properties(value: (AuditLogPropertyViewModel | $models.AuditLogProperty)[] | null);
  clientIp: string | null;
  referrer: string | null;
  endpoint: string | null;
}
export class AuditLogViewModel extends ViewModel<$models.AuditLog, $apiClients.AuditLogApiClient, number> implements $models.AuditLog  {
  
  
  public addToProperties(initialData?: DeepPartial<$models.AuditLogProperty> | null) {
    return this.$addChild('properties', initialData) as AuditLogPropertyViewModel
  }
  
  constructor(initialData?: DeepPartial<$models.AuditLog> | null) {
    super($metadata.AuditLog, new $apiClients.AuditLogApiClient(), initialData)
  }
}
defineProps(AuditLogViewModel, $metadata.AuditLog)

export class AuditLogListViewModel extends ListViewModel<$models.AuditLog, $apiClients.AuditLogApiClient, AuditLogViewModel> {
  
  constructor() {
    super($metadata.AuditLog, new $apiClients.AuditLogApiClient())
  }
}


export interface AuditLogPropertyViewModel extends $models.AuditLogProperty {
  id: number | null;
  parentId: number | null;
  propertyName: string | null;
  oldValue: string | null;
  oldValueDescription: string | null;
  newValue: string | null;
  newValueDescription: string | null;
}
export class AuditLogPropertyViewModel extends ViewModel<$models.AuditLogProperty, $apiClients.AuditLogPropertyApiClient, number> implements $models.AuditLogProperty  {
  
  constructor(initialData?: DeepPartial<$models.AuditLogProperty> | null) {
    super($metadata.AuditLogProperty, new $apiClients.AuditLogPropertyApiClient(), initialData)
  }
}
defineProps(AuditLogPropertyViewModel, $metadata.AuditLogProperty)

export class AuditLogPropertyListViewModel extends ListViewModel<$models.AuditLogProperty, $apiClients.AuditLogPropertyApiClient, AuditLogPropertyViewModel> {
  
  constructor() {
    super($metadata.AuditLogProperty, new $apiClients.AuditLogPropertyApiClient())
  }
}


export interface CompanyViewModel extends $models.Company {
  companyId: number | null;
  name: string | null;
  city: string | null;
  website: string | null;
  logoUrl: string | null;
  founded: Date | null;
  isPublic: boolean | null;
  get employees(): ViewModelCollection<PersonViewModel, $models.Person>;
  set employees(value: (PersonViewModel | $models.Person)[] | null);
}
export class CompanyViewModel extends ViewModel<$models.Company, $apiClients.CompanyApiClient, number> implements $models.Company  {
  
  
  public addToEmployees(initialData?: DeepPartial<$models.Person> | null) {
    return this.$addChild('employees', initialData) as PersonViewModel
  }
  
  constructor(initialData?: DeepPartial<$models.Company> | null) {
    super($metadata.Company, new $apiClients.CompanyApiClient(), initialData)
  }
}
defineProps(CompanyViewModel, $metadata.Company)

export class CompanyListViewModel extends ListViewModel<$models.Company, $apiClients.CompanyApiClient, CompanyViewModel> {
  
  constructor() {
    super($metadata.Company, new $apiClients.CompanyApiClient())
  }
}


export interface PersonViewModel extends $models.Person {
  personId: number | null;
  name: string | null;
  
  /** A few sentences about this person. */
  bio: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  avatarUrl: string | null;
  favoriteColor: string | null;
  password: string | null;
  age: number | null;
  salary: number | null;
  rating: number | null;
  isActive: boolean | null;
  status: $models.PersonStatus | null;
  skills: $models.Skill[] | null;
  birthDate: Date | null;
  startTime: Date | null;
  lastLogin: Date | null;
  createdAt: Date | null;
  resume: string | null;
  companyId: number | null;
  get company(): CompanyViewModel | null;
  set company(value: CompanyViewModel | $models.Company | null);
  managerId: number | null;
  get manager(): PersonViewModel | null;
  set manager(value: PersonViewModel | $models.Person | null);
  get personTags(): ViewModelCollection<PersonTagViewModel, $models.PersonTag>;
  set personTags(value: (PersonTagViewModel | $models.PersonTag)[] | null);
  nicknames: string[] | null;
  luckyNumbers: number[] | null;
}
export class PersonViewModel extends ViewModel<$models.Person, $apiClients.PersonApiClient, number> implements $models.Person  {
  
  
  public addToPersonTags(initialData?: DeepPartial<$models.PersonTag> | null) {
    return this.$addChild('personTags', initialData) as PersonTagViewModel
  }
  
  get tags(): ReadonlyArray<TagViewModel> {
    return (this.personTags || []).map($ => $.tag!).filter($ => $)
  }
  
  /** Raises this person's level and returns a summary. */
  public get promote() {
    const promote = this.$apiClient.$makeCaller(
      this.$metadata.methods.promote,
      (c, reason: string | null, levels?: number | null, notify?: boolean | null) => c.promote(this.$primaryKey, reason, levels, notify),
      () => ({reason: null as string | null, levels: null as number | null, notify: null as boolean | null, }),
      (c, args) => c.promote(this.$primaryKey, args.reason, args.levels, args.notify))
    
    Object.defineProperty(this, 'promote', {value: promote});
    return promote
  }
  
  public get archive() {
    const archive = this.$apiClient.$makeCaller(
      this.$metadata.methods.archive,
      (c) => c.archive(this.$primaryKey),
      () => ({}),
      (c, args) => c.archive(this.$primaryKey))
    
    Object.defineProperty(this, 'archive', {value: archive});
    return archive
  }
  
  public get changeCompany() {
    const changeCompany = this.$apiClient.$makeCaller(
      this.$metadata.methods.changeCompany,
      (c, company: $models.Company | null) => c.changeCompany(this.$primaryKey, company),
      () => ({company: null as $models.Company | null, }),
      (c, args) => c.changeCompany(this.$primaryKey, args.company))
    
    Object.defineProperty(this, 'changeCompany', {value: changeCompany});
    return changeCompany
  }
  
  public get downloadCard() {
    const downloadCard = this.$apiClient.$makeCaller(
      this.$metadata.methods.downloadCard,
      (c) => c.downloadCard(this.$primaryKey),
      () => ({}),
      (c, args) => c.downloadCard(this.$primaryKey))
    
    Object.defineProperty(this, 'downloadCard', {value: downloadCard});
    return downloadCard
  }
  
  public get uploadResume() {
    const uploadResume = this.$apiClient.$makeCaller(
      this.$metadata.methods.uploadResume,
      (c, file: File | null) => c.uploadResume(this.$primaryKey, file),
      () => ({file: null as File | null, }),
      (c, args) => c.uploadResume(this.$primaryKey, args.file))
    
    Object.defineProperty(this, 'uploadResume', {value: uploadResume});
    return uploadResume
  }
  
  constructor(initialData?: DeepPartial<$models.Person> | null) {
    super($metadata.Person, new $apiClients.PersonApiClient(), initialData)
  }
}
defineProps(PersonViewModel, $metadata.Person)

export class PersonListViewModel extends ListViewModel<$models.Person, $apiClients.PersonApiClient, PersonViewModel> {
  
  public get nicknameSuggestions() {
    const nicknameSuggestions = this.$apiClient.$makeCaller(
      this.$metadata.methods.nicknameSuggestions,
      (c, page?: number | null, search?: string | null) => c.nicknameSuggestions(page, search),
      () => ({page: null as number | null, search: null as string | null, }),
      (c, args) => c.nicknameSuggestions(args.page, args.search))
    
    Object.defineProperty(this, 'nicknameSuggestions', {value: nicknameSuggestions});
    return nicknameSuggestions
  }
  
  public get countActive() {
    const countActive = this.$apiClient.$makeCaller(
      this.$metadata.methods.countActive,
      (c) => c.countActive(),
      () => ({}),
      (c, args) => c.countActive())
    
    Object.defineProperty(this, 'countActive', {value: countActive});
    return countActive
  }
  
  public get scheduleReview() {
    const scheduleReview = this.$apiClient.$makeCaller(
      this.$metadata.methods.scheduleReview,
      (c, date?: Date | null, time?: Date | null, status?: $models.PersonStatus | null) => c.scheduleReview(date, time, status),
      () => ({date: null as Date | null, time: null as Date | null, status: null as $models.PersonStatus | null, }),
      (c, args) => c.scheduleReview(args.date, args.time, args.status))
    
    Object.defineProperty(this, 'scheduleReview', {value: scheduleReview});
    return scheduleReview
  }
  
  public get failingMethod() {
    const failingMethod = this.$apiClient.$makeCaller(
      this.$metadata.methods.failingMethod,
      (c) => c.failingMethod(),
      () => ({}),
      (c, args) => c.failingMethod())
    
    Object.defineProperty(this, 'failingMethod', {value: failingMethod});
    return failingMethod
  }
  
  constructor() {
    super($metadata.Person, new $apiClients.PersonApiClient())
  }
}


export interface PersonTagViewModel extends $models.PersonTag {
  personTagId: number | null;
  personId: number | null;
  get person(): PersonViewModel | null;
  set person(value: PersonViewModel | $models.Person | null);
  tagId: number | null;
  get tag(): TagViewModel | null;
  set tag(value: TagViewModel | $models.Tag | null);
}
export class PersonTagViewModel extends ViewModel<$models.PersonTag, $apiClients.PersonTagApiClient, number> implements $models.PersonTag  {
  
  constructor(initialData?: DeepPartial<$models.PersonTag> | null) {
    super($metadata.PersonTag, new $apiClients.PersonTagApiClient(), initialData)
  }
}
defineProps(PersonTagViewModel, $metadata.PersonTag)

export class PersonTagListViewModel extends ListViewModel<$models.PersonTag, $apiClients.PersonTagApiClient, PersonTagViewModel> {
  
  constructor() {
    super($metadata.PersonTag, new $apiClients.PersonTagApiClient())
  }
}


export interface TagViewModel extends $models.Tag {
  tagId: number | null;
  name: string | null;
  color: string | null;
}
export class TagViewModel extends ViewModel<$models.Tag, $apiClients.TagApiClient, number> implements $models.Tag  {
  
  constructor(initialData?: DeepPartial<$models.Tag> | null) {
    super($metadata.Tag, new $apiClients.TagApiClient(), initialData)
  }
}
defineProps(TagViewModel, $metadata.Tag)

export class TagListViewModel extends ListViewModel<$models.Tag, $apiClients.TagApiClient, TagViewModel> {
  
  constructor() {
    super($metadata.Tag, new $apiClients.TagApiClient())
  }
}


const viewModelTypeLookup = ViewModel.typeLookup = {
  AuditLog: AuditLogViewModel,
  AuditLogProperty: AuditLogPropertyViewModel,
  Company: CompanyViewModel,
  Person: PersonViewModel,
  PersonTag: PersonTagViewModel,
  Tag: TagViewModel,
}
const listViewModelTypeLookup = ListViewModel.typeLookup = {
  AuditLog: AuditLogListViewModel,
  AuditLogProperty: AuditLogPropertyListViewModel,
  Company: CompanyListViewModel,
  Person: PersonListViewModel,
  PersonTag: PersonTagListViewModel,
  Tag: TagListViewModel,
}
const serviceViewModelTypeLookup = ServiceViewModel.typeLookup = {
}

