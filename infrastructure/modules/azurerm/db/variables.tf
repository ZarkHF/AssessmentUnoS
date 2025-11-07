variable "tags" {
  type = map(string)
}

variable "resource_group_name" {
  type = string
}

variable "resource_name" {
  type = string
}

variable "administrator_login" {
  type = string
}

variable "administrator_login_password" {
  type = string
}

variable "databases" {
  type = map(object({
    name                  = string
    collation             = string
    min_capacity          = string
    max_size_gb           = string
    sku_name              = string
    storage_account_type  = string
    geo_backup_enabled    = bool
  }))
  
}
 
