# Plan de implementación — `secure-wallet-api`

## ✅ Completado
- [x] Bug transacción atómica (database.ts, wallet.repository.ts, wallet.service.ts)
- [x] Puerto ECS SG 80→8080 (secure-wallet-api-infra/security_groups.tf)
- [x] Puerto ALB TG 80→8080 (secure-wallet-api-infra/load_balancer.tf)
- [x] Dockerfile multi-stage (Node 24 + Distroless + nonroot)
- [x] `.dockerignore` creado
- [x] `.gitignore` actualizado (dist/, .env, *.log)

---

## Prerrequisitos en `secure-wallet-api-infra`

- [ ] **A** Agregar bloque `terraform { backend "s3" { ... } }` con:
  - bucket `secure-wallet-terraform-state`
  - key `infra/terraform.tfstate`
  - DynamoDB table `terraform-state-lock`
- [ ] **B** Crear S3 bucket + DynamoDB table (manual o con `-target`)
- [ ] **C** Migrar estado local → remoto: `terraform init -reconfigure`
- [ ] **D** Ampliar política IAM `GitHubActionsECSRole`:
  - `ecs:RegisterTaskDefinition`, `ecs:UpdateService`, `ecs:DescribeServices`
  - `iam:PassRole` para execution + task roles
  - `s3:GetObject` (state bucket)
  - `dynamodb:GetItem/PutItem/DeleteItem` (lock table)

---

## 5. Infraestructura del API (Terraform `infra/`)

- [x] 5a Crear `infra/backend.tf` — S3 backend, key `api/terraform.tfstate`
- [x] 5b Crear `infra/main.tf` — provider AWS `eu-west-1`, `data.terraform_remote_state.infra`
- [x] 5c Crear `infra/variables.tf` — `image_tag`, `db_password`
- [x] 5d Crear `infra/task-definition.tf` — task def con container, env vars, logs
- [x] 5e Crear `infra/service.tf` — ECS service con Fargate, networking, ALB
- [x] 5f Crear `infra/outputs.tf` — `ecs_service_name`, `task_definition_arn`

## 6. GitHub Actions workflow

- [x] 6a Crear `.github/workflows/deploy.yml`
- [x] 6b Trigger: `push` a `main`, paths relevantes
- [x] 6c `runs-on: ubuntu-latest`, job `deploy`
- [x] 6d `actions/checkout@v4`
- [x] 6e `actions/setup-node@v4` (node 24, cache npm)
- [x] 6f `npm ci` + `npm run typecheck`
- [x] 6g OIDC: `aws-actions/configure-aws-credentials@v4`, role `GitHubActionsECSRole`
- [x] 6h `aws-actions/amazon-ecr-login@v2`
- [x] 6i Build + tag + push Docker image a ECR
- [x] 6j Trivy scan: `exit-code: 1`, `severity: HIGH,CRITICAL`
- [x] 6k `hashicorp/setup-terraform@v3`
- [x] 6l `terraform init` (working-dir: infra)
- [x] 6m `terraform apply -auto-approve` con vars `image_tag` y `db_password`
