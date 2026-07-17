locals {
  ecr_url     = data.terraform_remote_state.infra.outputs.ecr_repository_url
  db_endpoint = data.terraform_remote_state.infra.outputs.rds_endpoint
  db_port     = data.terraform_remote_state.infra.outputs.rds_port
  db_name     = data.terraform_remote_state.infra.outputs.rds_database_name
  db_user     = data.terraform_remote_state.infra.outputs.rds_username
}

resource "aws_ecs_task_definition" "app" {
  family                   = "wallet-task"
  execution_role_arn       = data.terraform_remote_state.infra.outputs.ecs_execution_role_arn
  task_role_arn            = data.terraform_remote_state.infra.outputs.ecs_task_role_arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name  = "wallet-container"
      image = "${local.ecr_url}:${var.image_tag}"
      essential = true
      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV",    value = "production" },
        { name = "PORT",        value = "8080" },
        { name = "DATABASE_URL", value = "postgresql://${local.db_user}:${var.db_password}@${local.db_endpoint}:${local.db_port}/${local.db_name}" },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-create-group"  = "true"
          "awslogs-group"         = "/ecs/wallet-task"
          "awslogs-region"        = "eu-west-1"
          "awslogs-stream-prefix" = "wallet"
        }
      }
    }
  ])

  tags = { Name = "wallet-task" }
}
