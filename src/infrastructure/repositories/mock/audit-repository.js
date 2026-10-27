const { db, nextId } = require('../../database/mock-db');
class AuditRepository {
  log({actorId,action,resource,resourceId,details}){
    const e={id:nextId('auditLog'),actorId:actorId||null,action,resource,
      resourceId:resourceId||null,details:details||null,at:new Date().toISOString()};
    db.auditLog.push(e); return e;
  }
  list({limit=50}={}){ return db.auditLog.slice(-limit).reverse(); }
}
module.exports = { AuditRepository: new AuditRepository() };