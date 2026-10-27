const { ServiceOrdersRepository } = require('../../../infrastructure/repositories/mock/service-orders-repository');
const { NotificationsRepository } = require('../../../infrastructure/repositories/mock/notifications-repository');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { ValidationError } = require('../../../shared/domain/errors');
const { isNonEmptyString } = require('../../../shared/validation/validators');
class ServiceOrdersService {
  list(q){return ServiceOrdersRepository.list(q)}
  get(id){return ServiceOrdersRepository.findById(id)}
  create(d,actor){
    if(!isNonEmptyString(d.title))throw new ValidationError('Título é obrigatório');
    if(!d.customerId)throw new ValidationError('Cliente é obrigatório');
    const s=ServiceOrdersRepository.create(d);
    AuditRepository.log({actorId:actor,action:'CREATE',resource:'service-orders',resourceId:s.id});
    NotificationsRepository.create({userId:null,type:'INFO',title:'Nova OS criada',message:s.code+' - '+s.title,link:'service-orders'});
    return s;
  }
  update(id,p,actor){const s=ServiceOrdersRepository.update(id,p);AuditRepository.log({actorId:actor,action:'UPDATE',resource:'service-orders',resourceId:id});return s}
  remove(id,actor){const r=ServiceOrdersRepository.remove(id);AuditRepository.log({actorId:actor,action:'DELETE',resource:'service-orders',resourceId:id});return r}
}
module.exports = { ServiceOrdersService: new ServiceOrdersService() };