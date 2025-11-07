provider "azurerm" {  
  tenant_id                       = local.tenant_id
  subscription_id                 = local.subscription_id
  resource_provider_registrations = "none"
  features {}
}
