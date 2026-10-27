const { Router } = require('express');
const { db } = require('../../../infrastructure/database/mock-db');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { NotificationsRepository } = require('../../../infrastructure/repositories/mock/notifications-repository');
const { requirePermission } = require('../../../app/middleware/rbac');
const router = Router();
router.get('/dashboard',requirePermission('dashboard','read'),(req,res)=>{
  const today = new Date().toISOString().slice(0,10);
  const projectsByStatus = db.projects.reduce((a,p)=>(a[p.status]=(a[p.status]||0)+1,a),{});
  const tasksByPriority = db.tasks.reduce((a,t)=>(a[t.priority]=(a[t.priority]||0)+1,a),{});
  const tasksByStatus = db.tasks.reduce((a,t)=>(a[t.status]=(a[t.status]||0)+1,a),{});
  const soByStatus = db.serviceOrders.reduce((a,s)=>(a[s.status]=(a[s.status]||0)+1,a),{});
  const equipByStatus = db.equipments.reduce((a,e)=>(a[e.status]=(a[e.status]||0)+1,a),{});
  const tasksOverdue = db.tasks.filter(t=>t.status!=='DONE'&&t.dueDate&&t.dueDate<today).length;
  const tasksPending = db.tasks.filter(t=>t.status!=='DONE').length;
  const soOpen = db.serviceOrders.filter(s=>['OPEN','IN_PROGRESS'].includes(s.status)).length;
  const eqOperational = db.equipments.filter(e=>e.status==='OPERATIONAL').length;
  res.json({ok:true,data:{
    counts:{
      customers:db.customers.length, projects:db.projects.length, users:db.users.length,
      activeProjects: db.projects.filter(p=>p.status==='IN_PROGRESS').length,
      equipments: db.equipments.length, eqOperational,
      tasksPending, tasksOverdue,
      serviceOrders: db.serviceOrders.length, soOpen,
      notificationsUnread: NotificationsRepository.unreadCount(req.user.id)
    },
    projectsByStatus, tasksByPriority, tasksByStatus, soByStatus, equipByStatus,
    totalBudget: db.projects.reduce((s,p)=>s+(p.budget||0),0),
    recentAudit: AuditRepository.list({limit:10})
  }});
});
module.exports = router;