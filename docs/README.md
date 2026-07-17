# Documentación Técnica — Secure Wallet API

## Índice

1. [Arquitectura](#arquitectura)
2. [Prerrequisitos](#prerrequisitos)
3. [Despliegue de infraestructura](#despliegue-de-infraestructura)
4. [Desarrollo local](#desarrollo-local)
5. [Pipeline CI/CD](#pipeline-cicd)
6. [Endpoints de la API](#endpoints-de-la-api)
7. [Seguridad](#seguridad)
8. [Troubleshooting](#troubleshooting)

---

## Arquitectura

### Diagrama de infraestructura

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Cloud — eu-west-1                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                     VPC 10.0.0.0/16                 │   │
│  │                                                      │   │
│  │  ┌──────────────┐    ┌──────────────┐               │   │
│  │  │ AZ eu-west-1a │    │ AZ eu-west-1b │              │   │
│  │  │              │    │              │               │   │
│  │  │ Public subnet│    │ Public subnet│               │   │
│  │  │ 10.0.1.0/24  │    │ 10.0.2.0/24  │               │   │
│  │  │  ┌──────┐    │    │  ┌──────┐    │               │   │
│  │  │  │ NAT  │    │    │  │ NAT  │    │               │   │
│  │  │  │ GW   │    │    │  │ GW   │    │               │   │
│  │  │  └──┬───┘    │    │  └──┬───┘    │               │   │
│  │  └─────┼────────┘    └─────┼────────┘               │   │
│  │        │                   │                        │   │
│  │  ┌─────┼────────┐    ┌─────┼────────┐               │   │
│  │  │ Private subnet│    │ Private subnet│              │   │
│  │  │ 10.0.10.0/24 │    │ 10.0.11.0/24 │              │   │
│  │  │  ┌────────┐  │    │  ┌────────┐  │               │   │
│  │  │  │ ECS    │  │    │  │ ECS    │  │               │   │
│  │  │  │ Fargate│  │    │  │ Fargate│  │               │   │
│  │  │  └────┬───┘  │    │  └────┬───┘  │               │   │
│  │  └───────┼──────┘    └───────┼──────┘               │   │
│  │          │                   │                       │   │
│  │  ┌───────┼──────┐    ┌───────┼──────┐               │   │
│  │  │ Data subnet  │    │ Data subnet  │               │   │
│  │  │ 10.0.20.0/24 │    │ 10.0.21.0/24 │              │   │
│  │  │  ┌────────┐  │    │              │               │   │
│  │  │  │  RDS   │  │    │              │               │   │
│  │  │  │Postgres│  │    │              │               │   │
│  │  │  └────────┘  │    │              │               │   │
│  │  └──────────────┘    └──────────────┘               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────┐                                         │
│  │      ALB       │  (público, puertos 80/443)               │
│  │ wallet-alb     │                                         │
│  └───────┬────────┘                                         │
│          │                                                   │
│  ┌───────┴────────┐                                         │
│  │ ECS Cluster    │  wallet-cluster                          │
│  │ wallet-service │  Fargate, 1 tarea, rolling update        │
│  └────────────────┘                                         │
│                                                             │
│  ┌────────────────┐                                         │
│  │   ECR Registry │  900881669003.dkr.ecr.eu-west-1...      │
│  │ wallet-app     │                                         │
│  └────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de tráfico

```
Usuario → ALB (puerto 80) → ECS Fargate (puerto 8080) → RDS PostgreSQL (puerto 5432)
                                                              ↑
                                                    (solo desde SG de ECS)
```

---

## Prerrequisitos

- Node.js ≥ 20.0.0
- Docker
- AWS CLI configurado con credenciales
- Terraform ≥ 1.0
- Cuenta AWS con permisos para: EC2, ECS, ECR, RDS, IAM, CloudWatch, S3, DynamoDB

---

## Despliegue de infraestructura

La infraestructura base se despliega desde el repositorio [`secure-wallet-api-infra`](https://github.com/agomezala/secure-wallet-api-infra).

### 1. Clonar y configurar

```bash
git clone https://github.com/agomezala/secure-wallet-api-infra.git
cd secure-wallet-api-infra
```

### 2. Inicializar Terraform

```bash
terraform init
```

### 3. Desplegar

```bash
terraform apply
```

### 4. Outputs relevantes

Una vez desplegado, Terraform genera los siguientes outputs que necesita el API:

| Output | Descripción |
|--------|-------------|
| `ecs_execution_role_arn` | Rol IAM para que ECS ejecute tareas |
| `ecs_task_role_arn` | Rol IAM que la app asume en runtime |
| `ecr_repository_url` | URL del registro ECR |
| `rds_endpoint` | Hostname de la base de datos |
| `rds_port` | Puerto de la base de datos (5432) |
| `rds_database_name` | Nombre de la base de datos |
| `rds_username` | Usuario de la base de datos |
| `private_subnet_ids` | Subredes privadas para las tareas ECS |
| `ecs_security_group_id` | Grupo de seguridad de las tareas ECS |
| `alb_target_group_arn` | Target group del ALB |
| `ecs_cluster_name` | Nombre del clúster ECS |
| `ecs_cluster_arn` | ARN del clúster ECS |

---

## Desarrollo local

### Opción 1: `npm run dev` (recomendado para desarrollo)

Usa `tsx watch` — hot-reload automático al guardar cambios.

```bash
npm ci
cp .env.example .env
# Editar .env con tu DATABASE_URL local
npm run dev
```

El servidor se reinicia solo al modificar cualquier archivo en `src/`.

### Opción 2: Docker (solo para probar el build de producción)

```bash
docker build -t secure-wallet-api .
docker run -p 8080:8080 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/walletdb \
  -e NODE_ENV=development \
  -e PORT=8080 \
  secure-wallet-api
```

> **Nota**: Esta opción requiere rebuildear la imagen cada vez que cambias código. No es práctica para desarrollo activo. Úsala solo para verificar que el build de producción funciona.

---

## Pipeline CI/CD

### Workflow: `Deploy to ECS` (`.github/workflows/deploy.yml`)

```yaml
on: push → master
```

#### Job 1: Prechecks

| Step | Descripción |
|------|-------------|
| `checkout` | Clona el repositorio |
| `setup-node` | Node 24 con cache de npm |
| `npm ci + typecheck` | Instala dependencias y verifica tipos |
| `docker build` | Construye la imagen |
| `Trivy scan` | Escanea la imagen en busca de CVEs HIGH/CRITICAL |

Si el escaneo falla, el pipeline se detiene aquí. La imagen nunca se sube a ECR.

#### Job 2: Deploy

| Step | Descripción |
|------|-------------|
| `checkout` | Clona el repositorio |
| `Configure AWS` | OIDC → asume `GitHubActionsECSRole` |
| `Login ECR` | Autentica Docker contra ECR |
| `Build + push` | Construye y sube la imagen a ECR |
| `Terraform init` | Inicializa el backend remoto S3 |
| `Terraform apply` | Crea task definition y actualiza el servicio ECS |

El deploy usa rolling update: la nueva versión se despliega mientras la anterior sigue sirviendo tráfico. Cero downtime.

### Secretos requeridos en GitHub

| Secreto | Valor |
|---------|-------|
| `DB_PASSWORD` | Contraseña de la base de datos RDS |

---

## Endpoints de la API

### `GET /health`

Health check de la aplicación y la base de datos.

```json
// 200 OK
{ "status": "UP", "timestamp": "2026-07-17T10:00:00.000Z" }

// 503 Service Unavailable
{ "status": "DOWN", "timestamp": "2026-07-17T10:00:00.000Z" }
```

### `GET /api/v1/wallet/balance/:userId`

Consulta el saldo de una wallet.

```json
// 200 OK
{ "userId": "user-alpha", "balance": "100000" }

// 404 Not Found
{ "error": "Wallet not found for user: unknown" }
```

### `POST /api/v1/wallet/transaction`

Transfiere fondos entre dos wallets.

**Body:**

```json
{
  "senderId": "user-alpha",
  "receiverId": "user-beta",
  "amount": "1000"
}
```

**Respuestas:**

```json
// 201 Created
{
  "senderBalance": "99000",
  "receiverBalance": "51000",
  "transactionId": 1
}

// 400 Bad Request (validación)
{ "error": "Validation failed", "details": [...] }

// 422 Unprocessable (fondos insuficientes o mismo usuario)
{ "error": "Insufficient funds: balance 1000 < required 9999" }
{ "error": "sender and receiver must be different" }

// 404 Not Found
{ "error": "Wallet not found for user: unknown" }
```

---

## Seguridad

### Capas de seguridad implementadas

| Capa | Mecanismo |
|------|-----------|
| **Perimetral** | Security Groups: ALB → ECS → RDS |
| **Transporte** | Helmet (HTTP headers seguros) + SSL |
| **Autenticación** | OIDC para GitHub Actions (sin credenciales estáticas) |
| **Aplicación** | Rate limiting configurable, validación con Zod |
| **Imágenes** | Trivy scan en cada build (detiene el pipeline si HIGH/CRITICAL) |
| **Red** | RDS en subred aislada sin acceso público |
| **Infraestructura** | Terraform estado remoto con DynamoDB lock |

### Rate limiting

Configurable vía variables de entorno:

```env
RATE_LIMIT_WINDOW_MS=900000   # 15 minutos
RATE_LIMIT_MAX=100             # 100 requests por ventana
```

---

## Troubleshooting

### La task de ECS no arranca

```bash
aws ecs describe-services --cluster wallet-cluster --services wallet-service
```

Revisa el campo `events` del servicio. Errores comunes:

- **CloudWatch Logs**: el grupo de logs `/ecs/wallet-task` debe existir o el execution role debe tener permisos `logs:CreateLogGroup`
- **Imagen no encontrada**: verifica que el tag exista en ECR
- **Subnet sin NAT**: las tareas en subred privada necesitan NAT Gateway para bajar la imagen de ECR

### La base de datos no conecta

```bash
aws ecs describe-task-definition --task-definition wallet-task
```

Verifica que `DATABASE_URL` incluya `?sslmode=no-verify` y que las credenciales sean correctas.

### El pipeline falla con "couldn't find resource"

El rol `GitHubActionsECSRole` necesita `ecs:DescribeTaskDefinition`. Verifica la política IAM en el repo de infra.

### El lock de Terraform

Si un apply falla y el lock queda retenido:

```bash
terraform force-unlock <LOCK_ID>
```

### Health check devuelve DOWN

Revisa los logs en CloudWatch:

```bash
aws logs describe-log-streams --log-group-name /ecs/wallet-task --order-by LastEventTime --descending --limit 1
aws logs get-log-events --log-group-name /ecs/wallet-task --log-stream-name "<stream-name>"
```
