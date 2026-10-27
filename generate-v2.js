#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

// Corrige \` → `  e  \${ → ${  (bug da v1)
const fix = (s) => s.split('\\`').join('`').split('\\${').join('${');

const F = {};

/* ==================== MOCK-DB (com novos seeds) ==================== */
F['src/infrastructure/database/mock-db.js'] = String.raw`const bcrypt = require('bcryptjs');
const db = {
  users: [], customers: [], projects: [], departments: [], auditLog: [],
  equipments: [], tasks: [], serviceOrders: [], notifications: [],
  sequences: { users:0, customers:0, projects:0, departments:0, auditLog:0,
               equipments:0, tasks:0, serviceOrders:0, notifications:0 }
};
function nextId(t){ db.sequences[t]=(db.sequences[t]||0)+1; return db.sequences[t]; }
function seed(){
  if(db.users.length) return;
  const hash = bcrypt.hashSync('vetec@123',10);
  const now = () => new Date().toISOString();
  const depIds = {};
  ['Engenharia','Compras','Operações','TI'].forEach(n=>{ const id=nextId('departments'); depIds[n]=id; db.departments.push({id,name:n,active:true}); });
  [
    {name:'Admin VETEC',email:'admin@vetec.demo',role:'ADMIN',departmentId:depIds['TI']},
    {name:'Maria Gestora',email:'maria@vetec.demo',role:'MANAGER',departmentId:depIds['Engenharia']},
    {name:'João Técnico',email:'joao@vetec.demo',role:'TECHNICIAN',departmentId:depIds['Operações']},
    {name:'Ana Viewer',email:'ana@vetec.demo',role:'VIEWER',departmentId:depIds['Compras']}
  ].forEach(u=>db.users.push({id:nextId('users'),...u,email:u.email.toLowerCase(),passwordHash:hash,active:true,createdAt:now(),updatedAt:now()}));
  [
    {name:'Metalúrgica Aurora Ltda',cnpj:'11222333000181',email:'contato@aurora.demo',phone:'11-4002-8922',city:'São Paulo',state:'SP'},
    {name:'Indústria Bandeirantes SA',cnpj:'11444777000161',email:'compras@bandeirantes.demo',phone:'11-3003-1000',city:'Campinas',state:'SP'},
    {name:'AgroTech Vale Verde',cnpj:'22555666000190',email:'contato@agrotech.demo',phone:'19-3555-2020',city:'Piracicaba',state:'SP'}
  ].forEach(c=>db.customers.push({id:nextId('customers'),...c,active:true,createdAt:now(),updatedAt:now()}));
  [
    {code:'PRJ-0001',name:'Linha de Montagem A',customerId:1,managerId:2,status:'IN_PROGRESS',budget:850000,startDate:'2025-01-15',endDate:'2025-08-30'},
    {code:'PRJ-0002',name:'Retrofit Prensa Hidráulica',customerId:2,managerId:2,status:'PLANNING',budget:320000,startDate:'2025-03-01',endDate:'2025-06-15'},
    {code:'PRJ-0003',name:'Automação Silo 03',customerId:3,managerId:3,status:'COMPLETED',budget:150000,startDate:'2024-09-01',endDate:'2025-01-30'}
  ].forEach(p=>db.projects.push({id:nextId('projects'),...p,description:'',active:true,createdAt:now(),updatedAt:now()}));
  [
    {code:'EQ-001',name:'Torno CNC TL-2000',type:'Torno',manufacturer:'Romi',model:'TL-2000',serialNumber:'RM2000-123',location:'Galpão A',status:'OPERATIONAL',purchaseDate:'2022-03-10',lastMaintenanceDate:'2025-02-15',nextMaintenanceDate:'2025-08-15',notes:''},
    {code:'EQ-002',name:'Prensa Hidráulica PH-500',type:'Prensa',manufacturer:'Schuler',model:'PH-500',serialNumber:'SC500-456',location:'Galpão A',status:'MAINTENANCE',purchaseDate:'2020-06-20',lastMaintenanceDate:'2025-04-10',nextMaintenanceDate:'2025-05-10',notes:'Troca de vedação em andamento'},
    {code:'EQ-003',name:'Esteira Transportadora ET-300',type:'Esteira',manufacturer:'Marchesan',model:'ET-300',serialNumber:'MC300-789',location:'Galpão B',status:'OPERATIONAL',purchaseDate:'2023-01-05',lastMaintenanceDate:'2025-01-20',nextMaintenanceDate:'2025-07-20',notes:''},
    {code:'EQ-004',name:'Compressor de Ar CA-150',type:'Compressor',manufacturer:'Atlas Copco',model:'CA-150',serialNumber:'AC150-321',location:'Galpão B',status:'OPERATIONAL',purchaseDate:'2021-11-15',lastMaintenanceDate:'2025-03-05',nextMaintenanceDate:'2025-09-05',notes:''},
    {code:'EQ-005',name:'Empilhadeira EM-50',type:'Empilhadeira',manufacturer:'Hyster',model:'EM-50',serialNumber:'HY50-654',location:'Logística',status:'BROKEN',purchaseDate:'2019-04-12',lastMaintenanceDate:'2024-11-20',nextMaintenanceDate:'2025-05-20',notes:'Aguardando peça de reposição'}
  ].forEach(e=>db.equipments.push({id:nextId('equipments'),...e,active:true,createdAt:now(),updatedAt:now()}));
  const today = new Date();
  const days = (d) => { const x = new Date(today); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
  [
    {projectId:1,title:'Revisar projeto elétrico',description:'Revisão completa do diagrama unifilar',assigneeId:3,priority:'HIGH',status:'IN_PROGRESS',dueDate:days(7),estimatedHours:16,actualHours:4},
    {projectId:1,title:'Comprar componentes elétricos',description:'Aquisição de disjuntores e cabos',assigneeId:2,priority:'MEDIUM',status:'TODO',dueDate:days(15),estimatedHours:4,actualHours:0},
    {projectId:1,title:'Testes de carga do painel',description:'Ensaios elétricos conforme NBR',assigneeId:3,priority:'HIGH',status:'TODO',dueDate:days(20),estimatedHours:8,actualHours:0},
    {projectId:2,title:'Documentar procedimento de retrofit',description:'Criar POP para troca de componentes',assigneeId:2,priority:'LOW',status:'DONE',dueDate:days(-5),estimatedHours:6,actualHours:6},
    {projectId:2,title:'Instalar novo CLP',description:'Substituição do CLP obsoleto',assigneeId:3,priority:'URGENT',status:'IN_PROGRESS',dueDate:days(3),estimatedHours:24,actualHours:12},
    {projectId:2,title:'Calibrar sensores de pressão',description:'Ajuste fino dos sensores',assigneeId:3,priority:'HIGH',status:'TODO',dueDate:days(10),estimatedHours:4,actualHours:0},
    {projectId:3,title:'Revisar vedação do silo',description:'Inspeção final',assigneeId:2,priority:'LOW',status:'DONE',dueDate:days(-30),estimatedHours:8,actualHours:8},
    {projectId:3,title:'Verificar válvulas de alívio',description:'Teste de vedação',assigneeId:3,priority:'MEDIUM',status:'DONE',dueDate:days(-25),estimatedHours:4,actualHours:4},
    {projectId:3,title:'Relatório final do projeto',description:'Documentação de encerramento',assigneeId:2,priority:'LOW',status:'DONE',dueDate:days(-20),estimatedHours:6,actualHours:8},
    {projectId:1,title:'Manutenção preventiva do torno',description:'Aguardando janela de produção',assigneeId:3,priority:'MEDIUM',status:'BLOCKED',dueDate:days(12),estimatedHours:8,actualHours:0}
  ].forEach(t=>db.tasks.push({id:nextId('tasks'),...t,notes:'',active:true,createdAt:now(),updatedAt:now()}));
  [
    {title:'Manutenção corretiva na prensa hidráulica',description:'Substituição de vedações e revisão do sistema hidráulico',customerId:2,projectId:2,equipmentId:2,assigneeId:3,priority:'URGENT',status:'IN_PROGRESS',scheduledDate:days(-3),completedDate:null,hoursWorked:6,totalCost:2400,notes:''},
    {title:'Reparo da empilhadeira EM-50',description:'Diagnóstico e reparo do sistema hidráulico',customerId:3,projectId:null,equipmentId:5,assigneeId:3,priority:'HIGH',status:'OPEN',scheduledDate:days(2),completedDate:null,hoursWorked:0,totalCost:0,notes:'Aguardando peça'},
    {title:'Ajuste e calibração da esteira ET-300',description:'Ajuste de tensão e alinhamento',customerId:3,projectId:3,equipmentId:3,assigneeId:3,priority:'MEDIUM',status:'DONE',scheduledDate:days(-60),completedDate:days(-58),hoursWorked:4,totalCost:800,notes:''},
    {title:'Instalação de sensores de segurança',description:'Instalação de sensores no torno CNC',customerId:1,projectId:1,equipmentId:1,assigneeId:3,priority:'HIGH',status:'IN_PROGRESS',scheduledDate:days(5),completedDate:null,hoursWorked:2,totalCost:1200,notes:''},
    {title:'Manutenção preventiva do compressor',description:'Troca de filtros e óleo',customerId:1,projectId:null,equipmentId:4,assigneeId:3,priority:'MEDIUM',status:'OPEN',scheduledDate:days(15),completedDate:null,hoursWorked:0,totalCost:0,notes:''}
  ].forEach(s=>{ const id=nextId('serviceOrders'); db.serviceOrders.push({id,code:'OS-'+String(id).padStart(4,'0'),...s,createdAt:now(),updatedAt:now()}); });
  [
    {userId:null,type:'INFO',title:'Bem-vindo ao VETEC',message:'Sistema atualizado com novos módulos: Equipamentos, Tarefas e Ordens de Serviço.',link:null,read:false},
    {userId:3,type:'WARNING',title:'Nova tarefa atribuída',message:'Tarefa "Instalar novo CLP" foi atribuída a você.',link:'tasks',read:false},
    {userId:null,type:'INFO',title:'Nova OS criada',message:'OS-0005 - Manutenção preventiva do compressor foi agendada.',link:'service-orders',read:false},
    {userId:null,type:'SUCCESS',title:'Projeto concluído',message:'Projeto PRJ-0003 - Automação Silo 03 foi concluído com sucesso.',link:'projects',read:false},
    {userId:null,type:'WARNING',title:'Equipamento em manutenção',message:'Prensa Hidráulica PH-500 está em manutenção corretiva.',link:'equipments',read:false}
  ].forEach(n=>db.notifications.push({id:nextId('notifications'),...n,createdAt:now()}));
}
seed();
module.exports = { db, nextId, seed };`;

/* ==================== RBAC (novas permissões) ==================== */
F['src/app/middleware/rbac.js'] = String.raw`const { ForbiddenError } = require('../../shared/domain/errors');
const PERMISSIONS = {
  ADMIN: ['*'],
  MANAGER: ['users:read','customers:read','customers:write','projects:read','projects:write','dashboard:read','audit:read',
            'equipments:read','equipments:write','tasks:read','tasks:write','service-orders:read','service-orders:write','notifications:read','notifications:write'],
  TECHNICIAN: ['customers:read','projects:read','projects:write','dashboard:read',
               'equipments:read','tasks:read','tasks:write','service-orders:read','service-orders:write','notifications:read','notifications:write'],
  VIEWER: ['customers:read','projects:read','dashboard:read','equipments:read','tasks:read','service-orders:read','notifications:read']
};
function hasPermission(role,resource,action){
  const p=PERMISSIONS[role]||[];
  if(p.includes('*'))return true;
  return p.includes(\`\${resource}:\${action}\`);
}
function requirePermission(resource,action){
  return (req,res,next)=>{
    if(!req.user)return next(new ForbiddenError());
    if(!hasPermission(req.user.role,resource,action))
      return next(new ForbiddenError(\`Permissão negada: \${resource}:\${action}\`));
    next();
  };
}
module.exports = { PERMISSIONS, hasPermission, requirePermission };`;

/* ==================== ROUTES INDEX ==================== */
F['src/app/routes/index.js'] = String.raw`const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const router = Router();
router.use('/auth', require('../../modules/auth/presentation/routes'));
router.use('/users',     authenticate, require('../../modules/users/presentation/routes'));
router.use('/customers', authenticate, require('../../modules/customers/presentation/routes'));
router.use('/projects',  authenticate, require('../../modules/projects/presentation/routes'));
router.use('/equipments',    authenticate, require('../../modules/equipments/presentation/routes'));
router.use('/tasks',         authenticate, require('../../modules/tasks/presentation/routes'));
router.use('/service-orders',authenticate, require('../../modules/service-orders/presentation/routes'));
router.use('/notifications', authenticate, require('../../modules/notifications/presentation/routes'));
router.use('/reports',   authenticate, require('../../modules/reports/presentation/routes'));
router.use('/audit',     authenticate, require('../../modules/audit/presentation/routes'));
module.exports = router;`;

/* ==================== REPOS: EQUIPMENTS ==================== */
F['src/infrastructure/repositories/mock/equipments-repository.js'] = String.raw`const { db, nextId } = require('../../database/mock-db');
const { NotFoundError } = require('../../../shared/domain/errors');
class EquipmentsRepository {
  list({page=1,pageSize=10,search='',status=''}={}){
    let rows=db.equipments.slice();
    if(status)rows=rows.filter(e=>e.status===status);
    if(search){const q=search.toLowerCase();rows=rows.filter(e=>e.name.toLowerCase().includes(q)||e.code.toLowerCase().includes(q)||e.location.toLowerCase().includes(q))}
    rows.sort((a,b)=>a.id-b.id);
    const total=rows.length,start=(page-1)*pageSize;
    return {items:rows.slice(start,start+pageSize),total,page,pageSize};
  }
  findById(id){const e=db.equipments.find(x=>x.id===id);if(!e)throw new NotFoundError('Equipamento');return e}
  nextCode(){const max=db.equipments.reduce((m,e)=>Math.max(m,Number(e.code.replace(/\D/g,''))||0),0);
    return 'EQ-'+String(max+1).padStart(3,'0')}
  create(data){const now=new Date().toISOString();
    const e={id:nextId('equipments'),code:data.code||this.nextCode(),name:data.name,type:data.type||'',manufacturer:data.manufacturer||'',model:data.model||'',serialNumber:data.serialNumber||'',location:data.location||'',status:data.status||'OPERATIONAL',purchaseDate:data.purchaseDate||null,lastMaintenanceDate:data.lastMaintenanceDate||null,nextMaintenanceDate:data.nextMaintenanceDate||null,notes:data.notes||'',active:true,createdAt:now,updatedAt:now};
    db.equipments.push(e);return e}
  update(id,patch){const e=db.equipments.find(x=>x.id===id);if(!e)throw new NotFoundError('Equipamento');
    Object.assign(e,patch,{updatedAt:new Date().toISOString()});return e}
  remove(id){const i=db.equipments.findIndex(e=>e.id===id);if(i===-1)throw new NotFoundError('Equipamento');
    const [r]=db.equipments.splice(i,1);return r}
}
module.exports = { EquipmentsRepository: new EquipmentsRepository() };`;

/* ==================== REPOS: TASKS ==================== */
F['src/infrastructure/repositories/mock/tasks-repository.js'] = String.raw`const { db, nextId } = require('../../database/mock-db');
const { NotFoundError } = require('../../../shared/domain/errors');
const TRANSITIONS = { TODO:['IN_PROGRESS','BLOCKED','DONE'], IN_PROGRESS:['TODO','BLOCKED','DONE'], BLOCKED:['TODO','IN_PROGRESS'], DONE:[] };
class TasksRepository {
  list({page=1,pageSize=10,search='',status='',priority='',projectId=''}={}){
    let rows=db.tasks.slice();
    if(status)rows=rows.filter(t=>t.status===status);
    if(priority)rows=rows.filter(t=>t.priority===priority);
    if(projectId)rows=rows.filter(t=>t.projectId===Number(projectId));
    if(search){const q=search.toLowerCase();rows=rows.filter(t=>t.title.toLowerCase().includes(q))}
    rows.sort((a,b)=>a.id-b.id);
    const total=rows.length,start=(page-1)*pageSize;
    const today = new Date().toISOString().slice(0,10);
    const items = rows.slice(start,start+pageSize).map(t=>{
      const overdue = t.status!=='DONE' && t.dueDate && t.dueDate < today;
      return {...t,
        projectName: db.projects.find(p=>p.id===t.projectId)?.name||null,
        projectCode: db.projects.find(p=>p.id===t.projectId)?.code||null,
        assigneeName: db.users.find(u=>u.id===t.assigneeId)?.name||null,
        overdue
      };
    });
    return {items,total,page,pageSize};
  }
  findById(id){const t=db.tasks.find(x=>x.id===id);if(!t)throw new NotFoundError('Tarefa');return t}
  create(data){const now=new Date().toISOString();
    const t={id:nextId('tasks'),projectId:data.projectId,title:data.title,description:data.description||'',assigneeId:data.assigneeId||null,priority:data.priority||'MEDIUM',status:data.status||'TODO',dueDate:data.dueDate||null,estimatedHours:Number(data.estimatedHours||0),actualHours:Number(data.actualHours||0),notes:data.notes||'',active:true,createdAt:now,updatedAt:now};
    db.tasks.push(t);return t}
  update(id,patch){const t=db.tasks.find(x=>x.id===id);if(!t)throw new NotFoundError('Tarefa');
    if(patch.status&&patch.status!==t.status){const ok=TRANSITIONS[t.status]||[];if(!ok.includes(patch.status))throw new Error(\`Transição inválida: \${t.status} → \${patch.status}\`);}
    if(patch.estimatedHours!==undefined)patch.estimatedHours=Number(patch.estimatedHours);
    if(patch.actualHours!==undefined)patch.actualHours=Number(patch.actualHours);
    Object.assign(t,patch,{updatedAt:new Date().toISOString()});return t}
  remove(id){const i=db.tasks.findIndex(t=>t.id===id);if(i===-1)throw new NotFoundError('Tarefa');
    const [r]=db.tasks.splice(i,1);return r}
}
module.exports = { TasksRepository: new TasksRepository() };`;

/* ==================== REPOS: SERVICE ORDERS ==================== */
F['src/infrastructure/repositories/mock/service-orders-repository.js'] = String.raw`const { db, nextId } = require('../../database/mock-db');
const { NotFoundError } = require('../../../shared/domain/errors');
class ServiceOrdersRepository {
  list({page=1,pageSize=10,search='',status='',priority=''}={}){
    let rows=db.serviceOrders.slice();
    if(status)rows=rows.filter(s=>s.status===status);
    if(priority)rows=rows.filter(s=>s.priority===priority);
    if(search){const q=search.toLowerCase();rows=rows.filter(s=>s.title.toLowerCase().includes(q)||s.code.toLowerCase().includes(q))}
    rows.sort((a,b)=>b.id-a.id);
    const total=rows.length,start=(page-1)*pageSize;
    const items = rows.slice(start,start+pageSize).map(s=>({...s,
      customerName: db.customers.find(c=>c.id===s.customerId)?.name||null,
      equipmentName: db.equipments.find(e=>e.id===s.equipmentId)?.name||null,
      assigneeName: db.users.find(u=>u.id===s.assigneeId)?.name||null
    }));
    return {items,total,page,pageSize};
  }
  findById(id){const s=db.serviceOrders.find(x=>x.id===id);if(!s)throw new NotFoundError('Ordem de Serviço');return s}
  create(data){const now=new Date().toISOString();
    const id=nextId('serviceOrders');
    const s={id,code:'OS-'+String(id).padStart(4,'0'),title:data.title,description:data.description||'',customerId:data.customerId,projectId:data.projectId||null,equipmentId:data.equipmentId||null,assigneeId:data.assigneeId||null,priority:data.priority||'MEDIUM',status:data.status||'OPEN',scheduledDate:data.scheduledDate||null,completedDate:data.completedDate||null,hoursWorked:Number(data.hoursWorked||0),totalCost:Number(data.totalCost||0),notes:data.notes||'',createdAt:now,updatedAt:now};
    db.serviceOrders.push(s);return s}
  update(id,patch){const s=db.serviceOrders.find(x=>x.id===id);if(!s)throw new NotFoundError('Ordem de Serviço');
    if(patch.hoursWorked!==undefined)patch.hoursWorked=Number(patch.hoursWorked);
    if(patch.totalCost!==undefined)patch.totalCost=Number(patch.totalCost);
    if(patch.status==='DONE'&&!s.completedDate)patch.completedDate=new Date().toISOString().slice(0,10);
    Object.assign(s,patch,{updatedAt:new Date().toISOString()});return s}
  remove(id){const i=db.serviceOrders.findIndex(s=>s.id===id);if(i===-1)throw new NotFoundError('Ordem de Serviço');
    const [r]=db.serviceOrders.splice(i,1);return r}
}
module.exports = { ServiceOrdersRepository: new ServiceOrdersRepository() };`;

/* ==================== REPOS: NOTIFICATIONS ==================== */
F['src/infrastructure/repositories/mock/notifications-repository.js'] = String.raw`const { db, nextId } = require('../../database/mock-db');
const { NotFoundError } = require('../../../shared/domain/errors');
class NotificationsRepository {
  listForUser(userId){
    return db.notifications
      .filter(n=>!n.userId||n.userId===userId)
      .sort((a,b)=>b.id-a.id);
  }
  unreadCount(userId){
    return this.listForUser(userId).filter(n=>!n.read).length;
  }
  markRead(id,userId){
    const n=db.notifications.find(x=>x.id===id&&(!x.userId||x.userId===userId));
    if(!n)throw new NotFoundError('Notificação');
    n.read=true;return n;
  }
  markAllRead(userId){
    this.listForUser(userId).forEach(n=>n.read=true);
    return {ok:true};
  }
  create(data){
    const n={id:nextId('notifications'),userId:data.userId||null,type:data.type||'INFO',title:data.title,message:data.message||'',link:data.link||null,read:false,createdAt:new Date().toISOString()};
    db.notifications.push(n);return n;
  }
  remove(id,userId){
    const i=db.notifications.findIndex(x=>x.id===id&&(!x.userId||x.userId===userId));
    if(i===-1)throw new NotFoundError('Notificação');
    const [r]=db.notifications.splice(i,1);return r;
  }
}
module.exports = { NotificationsRepository: new NotificationsRepository() };`;

/* ==================== SERVICES ==================== */
F['src/modules/equipments/application/equipments-service.js'] = String.raw`const { EquipmentsRepository } = require('../../../infrastructure/repositories/mock/equipments-repository');
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
module.exports = { EquipmentsService: new EquipmentsService() };`;

F['src/modules/tasks/application/tasks-service.js'] = String.raw`const { TasksRepository } = require('../../../infrastructure/repositories/mock/tasks-repository');
const { NotificationsRepository } = require('../../../infrastructure/repositories/mock/notifications-repository');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { ValidationError } = require('../../../shared/domain/errors');
const { isNonEmptyString } = require('../../../shared/validation/validators');
class TasksService {
  list(q){return TasksRepository.list(q)}
  get(id){return TasksRepository.findById(id)}
  create(d,actor){
    if(!isNonEmptyString(d.title))throw new ValidationError('Título é obrigatório');
    if(!d.projectId)throw new ValidationError('Projeto é obrigatório');
    const t=TasksRepository.create(d);
    AuditRepository.log({actorId:actor,action:'CREATE',resource:'tasks',resourceId:t.id});
    if(t.assigneeId&&t.assigneeId!==actor)NotificationsRepository.create({userId:t.assigneeId,type:'INFO',title:'Nova tarefa atribuída',message:'Tarefa "'+t.title+'" foi atribuída a você.',link:'tasks'});
    return t;
  }
  update(id,p,actor){
    const t=TasksRepository.update(id,p);
    AuditRepository.log({actorId:actor,action:'UPDATE',resource:'tasks',resourceId:id});
    return t;
  }
  remove(id,actor){const r=TasksRepository.remove(id);AuditRepository.log({actorId:actor,action:'DELETE',resource:'tasks',resourceId:id});return r}
}
module.exports = { TasksService: new TasksService() };`;

F['src/modules/service-orders/application/service-orders-service.js'] = String.raw`const { ServiceOrdersRepository } = require('../../../infrastructure/repositories/mock/service-orders-repository');
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
module.exports = { ServiceOrdersService: new ServiceOrdersService() };`;

F['src/modules/notifications/application/notifications-service.js'] = String.raw`const { NotificationsRepository } = require('../../../infrastructure/repositories/mock/notifications-repository');
class NotificationsService {
  list(userId){return {items:NotificationsRepository.listForUser(userId),unread:NotificationsRepository.unreadCount(userId)}}
  unread(userId){return {unread:NotificationsRepository.unreadCount(userId)}}
  markRead(id,userId){return NotificationsRepository.markRead(id,userId)}
  markAllRead(userId){return NotificationsRepository.markAllRead(userId)}
  remove(id,userId){return NotificationsRepository.remove(id,userId)}
}
module.exports = { NotificationsService: new NotificationsService() };`;

/* ==================== ROUTES (módulos) ==================== */
F['src/modules/equipments/presentation/routes.js'] = String.raw`const { Router } = require('express');
const { EquipmentsService } = require('../application/equipments-service');
const { requirePermission } = require('../../../app/middleware/rbac');
const router = Router();
const pag = (q) => ({page:Number(q.page)||1,pageSize:Math.min(Number(q.pageSize)||10,100),search:q.search||'',status:q.status||''});
router.get('/',requirePermission('equipments','read'),(req,res,next)=>{try{res.json({ok:true,data:EquipmentsService.list(pag(req.query))})}catch(e){next(e)}});
router.get('/:id',requirePermission('equipments','read'),(req,res,next)=>{try{res.json({ok:true,data:EquipmentsService.get(Number(req.params.id))})}catch(e){next(e)}});
router.post('/',requirePermission('equipments','write'),(req,res,next)=>{try{res.status(201).json({ok:true,data:EquipmentsService.create(req.body,req.user.id)})}catch(e){next(e)}});
router.patch('/:id',requirePermission('equipments','write'),(req,res,next)=>{try{res.json({ok:true,data:EquipmentsService.update(Number(req.params.id),req.body,req.user.id)})}catch(e){next(e)}});
router.delete('/:id',requirePermission('equipments','write'),(req,res,next)=>{try{res.json({ok:true,data:EquipmentsService.remove(Number(req.params.id),req.user.id)})}catch(e){next(e)}});
module.exports = router;`;

F['src/modules/tasks/presentation/routes.js'] = String.raw`const { Router } = require('express');
const { TasksService } = require('../application/tasks-service');
const { requirePermission } = require('../../../app/middleware/rbac');
const router = Router();
const pag = (q) => ({page:Number(q.page)||1,pageSize:Math.min(Number(q.pageSize)||10,100),search:q.search||'',status:q.status||'',priority:q.priority||'',projectId:q.projectId||''});
router.get('/',requirePermission('tasks','read'),(req,res,next)=>{try{res.json({ok:true,data:TasksService.list(pag(req.query))})}catch(e){next(e)}});
router.get('/:id',requirePermission('tasks','read'),(req,res,next)=>{try{res.json({ok:true,data:TasksService.get(Number(req.params.id))})}catch(e){next(e)}});
router.post('/',requirePermission('tasks','write'),(req,res,next)=>{try{res.status(201).json({ok:true,data:TasksService.create(req.body,req.user.id)})}catch(e){next(e)}});
router.patch('/:id',requirePermission('tasks','write'),(req,res,next)=>{try{res.json({ok:true,data:TasksService.update(Number(req.params.id),req.body,req.user.id)})}catch(e){next(e)}});
router.delete('/:id',requirePermission('tasks','write'),(req,res,next)=>{try{res.json({ok:true,data:TasksService.remove(Number(req.params.id),req.user.id)})}catch(e){next(e)}});
module.exports = router;`;

F['src/modules/service-orders/presentation/routes.js'] = String.raw`const { Router } = require('express');
const { ServiceOrdersService } = require('../application/service-orders-service');
const { requirePermission } = require('../../../app/middleware/rbac');
const router = Router();
const pag = (q) => ({page:Number(q.page)||1,pageSize:Math.min(Number(q.pageSize)||10,100),search:q.search||'',status:q.status||'',priority:q.priority||''});
router.get('/',requirePermission('service-orders','read'),(req,res,next)=>{try{res.json({ok:true,data:ServiceOrdersService.list(pag(req.query))})}catch(e){next(e)}});
router.get('/:id',requirePermission('service-orders','read'),(req,res,next)=>{try{res.json({ok:true,data:ServiceOrdersService.get(Number(req.params.id))})}catch(e){next(e)}});
router.post('/',requirePermission('service-orders','write'),(req,res,next)=>{try{res.status(201).json({ok:true,data:ServiceOrdersService.create(req.body,req.user.id)})}catch(e){next(e)}});
router.patch('/:id',requirePermission('service-orders','write'),(req,res,next)=>{try{res.json({ok:true,data:ServiceOrdersService.update(Number(req.params.id),req.body,req.user.id)})}catch(e){next(e)}});
router.delete('/:id',requirePermission('service-orders','write'),(req,res,next)=>{try{res.json({ok:true,data:ServiceOrdersService.remove(Number(req.params.id),req.user.id)})}catch(e){next(e)}});
module.exports = router;`;

F['src/modules/notifications/presentation/routes.js'] = String.raw`const { Router } = require('express');
const { NotificationsService } = require('../application/notifications-service');
const { requirePermission } = require('../../../app/middleware/rbac');
const router = Router();
router.get('/',requirePermission('notifications','read'),(req,res,next)=>{try{res.json({ok:true,data:NotificationsService.list(req.user.id)})}catch(e){next(e)}});
router.get('/unread',requirePermission('notifications','read'),(req,res,next)=>{try{res.json({ok:true,data:NotificationsService.unread(req.user.id)})}catch(e){next(e)}});
router.patch('/:id/read',requirePermission('notifications','write'),(req,res,next)=>{try{res.json({ok:true,data:NotificationsService.markRead(Number(req.params.id),req.user.id)})}catch(e){next(e)}});
router.post('/read-all',requirePermission('notifications','write'),(req,res,next)=>{try{res.json({ok:true,data:NotificationsService.markAllRead(req.user.id)})}catch(e){next(e)}});
router.delete('/:id',requirePermission('notifications','write'),(req,res,next)=>{try{res.json({ok:true,data:NotificationsService.remove(Number(req.params.id),req.user.id)})}catch(e){next(e)}});
module.exports = router;`;

F['src/modules/audit/presentation/routes.js'] = String.raw`const { Router } = require('express');
const { AuditRepository } = require('../../../infrastructure/repositories/mock/audit-repository');
const { db } = require('../../../infrastructure/database/mock-db');
const { requirePermission } = require('../../../app/middleware/rbac');
const router = Router();
router.get('/',requirePermission('audit','read'),(req,res)=>{
  const limit = Math.min(Number(req.query.limit)||100,500);
  const entries = db.auditLog.slice().reverse().slice(0,limit).map(a=>({...a,actorName: db.users.find(u=>u.id===a.actorId)?.name||null}));
  res.json({ok:true,data:{items:entries}});
});
module.exports = router;`;

/* ==================== REPORTS (dashboard rico) ==================== */
F['src/modules/reports/presentation/routes.js'] = String.raw`const { Router } = require('express');
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
module.exports = router;`;

/* ==================== FRONTEND: index.html ==================== */
F['public/index.html'] = String.raw`<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VETEC · Gestão Industrial</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚙️</text></svg>">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div id="app"></div>
  <div id="toasts" class="toasts"></div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="/app.js"></script>
</body>
</html>`;

/* ==================== ESCRITA ==================== */
let count = 0;
for (const [rel, raw] of Object.entries(F)) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, fix(raw), 'utf8');
  console.log('  ✓ ' + rel);
  count++;
}
console.log('\n✅ ' + count + ' arquivos atualizados em: ' + ROOT);
console.log('\n📌 Reinicie o servidor:  npm start\n');