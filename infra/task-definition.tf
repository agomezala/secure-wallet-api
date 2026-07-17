locals {
  ecr_url          = data.terraform_remote_state.infra.outputs.ecr_repository_url
  database_url_secret = data.terraform_remote_state.infra.outputs.database_url_secret_arn
}

resource "aws_ecs_task_definition" "app" {
  family                   = "wallet-task"
  execution_role_arn       = data.terraform_remote_state.infra.outputs.ecs_execution_role_arn
  task_role_arn            = data.terraform_remote_state.infra.outputs.ecs_task_role_arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"

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
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = local.database_url_secret
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/wallet-task"
          "awslogs-region"        = "eu-west-1"
          "awslogs-stream-prefix" = "wallet"
        }
      }
    }
  ])

  tags = { Name = "wallet-task" }
}
