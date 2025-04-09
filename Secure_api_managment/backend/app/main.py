from flask import Flask, jsonify
from flask_cors import CORS
from .vault_manager import VaultManager
from .api_service import APIService


app = Flask(__name__)
CORS(app)

vault_manager = VaultManager()
api_service = APIService(vault_manager)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/api/test-key', methods=['GET'])
def test_api_key():
    is_valid = api_service.test_api_key()
    return jsonify({"key_valid": is_valid})

@app.route('/api/rotate-key', methods=['POST'])
def rotate_api_key():
    success = api_service.update_api_key()
    return jsonify({"rotation_success": success})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)



# ansible-vault encrypt --vault-password-file vault_password ansible/group_vars/vault.yml
# ansible-vault view --vault-password-file vault_password ansible/group_vars/vault.yml
# edit 
# ansible-vault create --vault-password-file vault_password new_secreat.yml