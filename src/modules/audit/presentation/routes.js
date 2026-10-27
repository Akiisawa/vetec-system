const { Router } = require('express');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { db } = require('../../../infrastructure/database/mock-db');
const { requirePermission } = require('../../../app/middleware/rbac');
const router = Router();
router.get('/',requirePermission('audit','read'),(req,res)=>{
  const limit = Math.min(Number(req.query.limit)||100,500);
  const entries = db.auditLog.slice().reverse().slice(0,limit).map(a=>({...a,actorName: db.users.find(u=>u.id===a.actorId)?.name||null}));
  res.json({ok:true,data:{items:entries}});
});
module.exports = router;