resource "aws_ecs_service" "app" {
  name            = "wallet-service"
  cluster         = data.terraform_remote_state.infra.outputs.ecs_cluster_arn
  task_definition = aws_ecs_task_definition.app.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets         = data.terraform_remote_state.infra.outputs.private_subnet_ids
    security_groups = [data.terraform_remote_state.infra.outputs.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = data.terraform_remote_state.infra.outputs.alb_target_group_arn
    container_name   = "wallet-container"
    container_port   = 8080
  }
}
