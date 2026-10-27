const bcrypt = require('bcryptjs');
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
module.exports = { db, nextId, seed };