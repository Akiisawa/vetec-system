# VETEC · Sistema de Gestão Industrial

Demo com DDD, JWT, RBAC e repositórios mock em memória.

## Rodar
    npm install
    npm start
    → http://localhost:3000

## Credenciais demo (senha: vetec@123)
- admin@vetec.demo  (ADMIN)
- maria@vetec.demo  (MANAGER)
- joao@vetec.demo   (TECHNICIAN)
- ana@vetec.demo    (VIEWER)

## API
- POST   /api/auth/login
- GET    /api/auth/me
- CRUD   /api/customers[/:id]
- CRUD   /api/projects[/:id]
- CRUD   /api/users[/:id]
- GET    /api/reports/dashboard
