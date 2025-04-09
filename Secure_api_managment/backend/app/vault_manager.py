import hvac
import os

class VaultManager:
    def __init__(self):
        self.client = hvac.Client(
            url = os.getenv('VAULT_ADDR', 'https://loalhost:8200'), token = os.getenv('VAULT_TOKEN')
        )
        self.secret_path = 'secret/data/api-keys'

    def get_api_key(self):
        try:
            secreat = self.client.secrets.kv.v2.read_secret_version(path='api-keys')
            return secreat['data']['data']['api-key']
        except Exception as e:
            print("[ Error ] - error retreving key : {e}")
            return None
        
    def update_api_key(self, api_key: str) -> bool:
        try:
            self.client.secrets.kv.v2.create_or_update_secret(path='api-keys', secret=dict(api_key=api_key))
            return True
        except Exception as e:
            print("Error in update here the errro: {e}")
            return False