locals {  
  tenant_id       = ""
  subscription_id = ""
  tags = {
    Environment   = "sandbox"
    Account       = "acloudguru"
    CreatedAt     = "20250402"
    LastUpdatedAt = "20250402"
    ManagedBy     = "terraform"
  }
  resource_group_name          = ""
  resource_name                = "tcas-snb-use-001"
  administrator_login          = "elmasterblaster"
  administrator_login_password = ""
  docker_image_name            = "nginx:latest"
  docker_registry_password     = ""
  docker_registry_username     = ""
  docker_registry_url          = ""
}

module "db" {
  source                       = "../../../modules/azurerm/db"
  resource_group_name          = local.resource_group_name
  tags                         = local.tags
  resource_name                = local.resource_name
  administrator_login          = local.administrator_login
  administrator_login_password = local.administrator_login_password
  databases = {
    "assessmentdb" = {
      name                 = "assessmentdb"
      collation            = "SQL_Latin1_General_CP1_CI_AS"
      min_capacity         = "0.5"
      max_size_gb          = "2"
      sku_name             = "Basic"
      storage_account_type = "Local"
      geo_backup_enabled   = false
    }
  }
}

module "app" {
  source                   = "../../../modules/azurerm/app"
  resource_group_name      = local.resource_group_name
  tags                     = local.tags
  resource_name            = local.resource_name
  docker_image_name        = local.docker_image_name
  docker_registry_password = local.docker_registry_password
  docker_registry_username = local.docker_registry_username
  docker_registry_url      = local.docker_registry_url

}
