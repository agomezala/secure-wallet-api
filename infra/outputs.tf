output "ecs_service_name" {
  value       = aws_ecs_service.app.name
  description = "Nombre del servicio ECS"
}

output "task_definition_arn" {
  value       = aws_ecs_task_definition.app.arn
  description = "ARN de la task definition"
}
