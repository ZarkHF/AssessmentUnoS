resource "azurerm_linux_web_app" "this" {
  name                = "api-app-${var.resource_name}"
  location            = data.azurerm_resource_group.this.location
  resource_group_name = data.azurerm_resource_group.this.name
  service_plan_id     = azurerm_service_plan.this.id

  site_config {
    application_stack {
      docker_image_name        = var.docker_image_name
      docker_registry_password = var.docker_registry_password
      docker_registry_username = var.docker_registry_username
      docker_registry_url      = var.docker_registry_url
    }
  }

  tags = var.tags
}
