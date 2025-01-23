#!/bin/bash
VAULT_ADDR="http://127.0.0.1:8200"
VAULT_TOKEN="xn48o2jkpl78grj1akjdhl2kfl"

API_KEY=$(curl -s --header "X-Vault-Token: $VAULT_TOKEN" \
    "$VAULT_ADDR/v1/secret/data/my-api" | jq -r '.data.data.api_key')

echo "API_KEY=$API_KEY" >> $GITHUB_ENV