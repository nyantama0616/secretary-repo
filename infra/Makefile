.PHONY: init plan apply phase1 phase2 phase3 phase4 phase5 phase6

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

phase3:
	set -a && . ./.env && set +a && cd ansible && ansible-playbook -i inventory.ini phase3-database.yml

phase4:
	set -a && . ./.env && set +a && cd ansible && ansible-playbook -i inventory.ini phase4-deploy.yml

phase5:
	cd ansible && ansible-playbook -i inventory.ini phase5-process.yml

phase6:
	cd ansible && ansible-playbook -i inventory.ini phase6-verify.yml
