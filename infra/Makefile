.PHONY: init plan apply phase1 phase2

# Terraform
init:
	cd terraform && terraform init

plan:
	cd terraform && terraform plan

apply:
	cd terraform && terraform apply

# Ansible
phase1:
	cd ansible && ansible-playbook -i inventory.ini phase1-init.yml

phase2:
	cd ansible && ansible-playbook -i inventory.ini phase2-runtime.yml
