variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
}

variable "db_password" {
  description = "RDS database password"
  type        = string
  sensitive   = true
}
