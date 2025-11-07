# https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/mssql_server
resource "azurerm_mssql_server" "this" {
  name                          = "sql-${var.resource_name}"
  resource_group_name           = data.azurerm_resource_group.this.name
  location                      = data.azurerm_resource_group.this.location
  version                       = "12.0"
  minimum_tls_version           = "1.2"
  public_network_access_enabled = true
  administrator_login           = var.administrator_login
  administrator_login_password  = var.administrator_login_password


  tags = var.tags
}
