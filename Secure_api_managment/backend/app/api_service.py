import requests
from .vault_manager import VaultManager

class APIService:
    def __init__(self, vault_manager:VaultManager):
        self.vault_manager = vault_manager
        self.api_base_url = 'https://ai/agent/api'

    def test_key(self) -> bool:
        api_key = self.vault_manager.get_api_key()
        if not api_key:
            return False
        
        try:
            responce = requests.get(f"{self.api_base_url}/validate",
                    headers ={"Authentication" : f"Beaver {api_key}"})
            return responce.status_code == 200
        except Exception as e:
            return False
    
    def rotate_key(self) -> bool:
        try:
            new_key = self._generate_new_api_key()
            if new_key and self._validate_new_key(new_key):
                return self.vault_manager.update_api_key(new_key)
            return False
        except Exception as e:
            print(f"Error rotating API key: {e}")
            return False

    def _generate_new_api_key(self) -> str:
        pass

    def _validate_new_key(self, key: str) -> bool:
        pass
