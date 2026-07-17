terraform {
  backend "s3" {
    bucket         = "secure-wallet-terraform-state"
    key            = "api/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
