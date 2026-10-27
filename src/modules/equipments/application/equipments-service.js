const { EquipmentsRepository } = require('../../../infrastructure/repositories/mock/equipments-repository');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { ValidationError } = require('../../../shared/domain/errors');
const { isNonEmptyString } = require('../../../shared/validation/validators');
class EquipmentsService {
  list(q){return EquipmentsRepository.list(q)}
  get(id){return EquipmentsRepository.findById(id)}
  create(d,actor){
    if(!isNonEmptyString(d.name))throw new ValidationError('Nome é obrigatório');
    const e=EquipmentsRepository.create(d);
    AuditRepository.log({actorId:actor,action:'CREATE',resource:'equipments',resourceId:e.id});
    return e;
  }
  update(id,p,actor){const e=EquipmentsRepository.update(id,p);AuditRepository.log({actorId:actor,action:'UPDATE',resource:'equipments',resourceId:id});return e}
  remove(id,actor){const r=EquipmentsRepository.remove(id);AuditRepository.log({actorId:actor,action:'DELETE',resource:'equipments',resourceId:id});return r}
}
module.exports = { EquipmentsService: new EquipmentsService() };