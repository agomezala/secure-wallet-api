terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}

data "terraform_remote_state" "infra" {
  backend = "s3"
  config = {
    bucket = "secure-wallet-terraform-state"
    key    = "infra/terraform.tfstate"
    region = "eu-west-1"
  }
}
