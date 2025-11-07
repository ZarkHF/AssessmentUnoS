# https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/mssql_database
resource "azurerm_mssql_database" "this" {
  for_each     = var.databases
  name         = "sqldb-${var.resource_name}-${each.value.name}"
  server_id    = azurerm_mssql_server.this.id
  collation    = each.value.collation  
  #  min_capacity         = each.value.min_capacity
  max_size_gb          = each.value.max_size_gb
  sku_name             = each.value.sku_name
  storage_account_type = each.value.storage_account_type
  geo_backup_enabled   = each.value.geo_backup_enabled

  tags = var.tags

}
