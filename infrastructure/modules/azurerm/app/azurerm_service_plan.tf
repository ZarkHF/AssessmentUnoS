resource "azurerm_service_plan" "this" {
  name                = "asp-${var.resource_name}"
  location            = data.azurerm_resource_group.this.location
  resource_group_name = data.azurerm_resource_group.this.name
  sku_name            = "B1" # Basic tier (or S1 for Standard)
  os_type             = "Linux"

  tags = var.tags
}
