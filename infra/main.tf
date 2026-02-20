terraform {
  required_providers {
    proxmox = {
      source  = "bpg/proxmox"
      version = "~> 0.96"
    }
  }
}

provider "proxmox" {
  endpoint  = var.proxmox_endpoint
  api_token = var.proxmox_api_token
  insecure  = true # NOTE: Tailscale 経由のため自己署名証明書を許可している
}

resource "proxmox_virtual_environment_pool" "secretary" {
  pool_id = "secretary"
  comment = "AI secretary app"
}

resource "proxmox_virtual_environment_container" "secretary" {
  description  = "Secretary app"
  node_name    = var.node_name
  pool_id      = proxmox_virtual_environment_pool.secretary.pool_id
  vm_id        = 150
  unprivileged = true

  operating_system {
    template_file_id = "local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst"
    type             = "ubuntu"
  }

  features {
    nesting = true
  }

  initialization {
    hostname = "secretary"

    dns {
      servers = ["1.1.1.1", "8.8.8.8"]
    }

    ip_config {
      ipv4 {
        address = "100.64.1.150/24"
        gateway = "100.64.1.1"
      }
    }
  }

  cpu {
    cores = 2
  }

  memory {
    dedicated = 4096
  }

  disk {
    datastore_id = "local-lvm"
    size         = 20
  }

  network_interface {
    name   = "eth0"
    bridge = "vmbr0"
  }

  started = true
}
