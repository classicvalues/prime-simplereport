locals {
  project = "prime"
  name    = "simple-report"
  env     = "stg"
  management_tags = {
    prime-app      = "simple-report"
    environment    = local.env
    resource_group = "${local.project}-${local.name}-${local.env}"
  }
}

module "monitoring" {
  source        = "../../services/monitoring"
  env           = local.env
  management_rg = data.azurerm_resource_group.rg_global.name
  rg_location   = data.azurerm_resource_group.stg.location
  rg_name       = data.azurerm_resource_group.stg.name

  app_url = "${local.env}.simeplreport.gov"

  tags = local.management_tags
}

module "bastion" {
  source = "../../services/bastion_host"
  env    = local.env

  resource_group_location = data.azurerm_resource_group.stg.location
  resource_group_name     = data.azurerm_resource_group.stg.name

  virtual_network_name = "${local.name}-${local.env}-network"
  subnet_cidr          = ["10.4.253.0/27"]

  tags = local.management_tags
}

module "psql_connect" {
  source                  = "../../services/basic_vm"
  name                    = "psql-connect"
  env                     = local.env
  resource_group_location = data.azurerm_resource_group.stg.location
  resource_group_name     = data.azurerm_resource_group.stg.name

  subnet_id                = azurerm_subnet.vms.id
  bastion_connect_password = data.azurerm_key_vault_secret.psql_connect_password.value

  tags = local.management_tags
}

module "db" {
  source      = "../../services/postgres_db"
  env         = local.env
  rg_location = data.azurerm_resource_group.stg.location
  rg_name     = data.azurerm_resource_group.stg.name

  global_vault_id      = data.azurerm_key_vault.global.id
  db_vault_id          = data.azurerm_key_vault.db_keys.id
  db_encryption_key_id = data.azurerm_key_vault_key.db_encryption_key.id
  public_access        = false
  administrator_login  = "simplereport"

  log_workspace_id = module.monitoring.log_analytics_workspace_id

  tags = local.management_tags
}