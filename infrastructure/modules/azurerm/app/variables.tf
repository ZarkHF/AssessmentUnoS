variable "tags" {
  type = map(string)
}

variable "resource_group_name" {
  type = string
}

variable "resource_name" {
  type = string
}

variable "docker_image_name" {
  type = string
}

variable "docker_registry_password" {
  type = string
}

variable "docker_registry_username" {
  type = string
}

variable "docker_registry_url" {
  type = string
}
