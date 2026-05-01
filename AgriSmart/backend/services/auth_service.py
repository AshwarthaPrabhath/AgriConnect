import json
import os
import secrets

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_FILE = os.path.join(BASE_DIR, "..", "models", "users.json")

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}

def save_users(users_data):
    with open(USERS_FILE, "w") as f:
        json.dump(users_data, f, indent=4)

def login_user(email, password):
    users = load_users()
    if email not in users:
        return {"success": False, "message": "Email does not exist"}
    if users[email]["password"] != password:
        return {"success": False, "message": "Password is not correct"}
    
    session_token = secrets.token_hex(16)
    user_info = users[email]
    user_info["name"] = user_info.get("name", "Farmer")
    return {"success": True, "token": session_token, "user": {"email": email, "name": user_info["name"]}}

def register_user(email, password, name="", phone=""):
    users = load_users()
    if email in users:
        return {"success": False, "message": "Email already registered."}
    
    users[email] = {
        "password": password,
        "name": name,
        "phone": phone
    }
    save_users(users)
    session_token = secrets.token_hex(16)
    return {"success": True, "token": session_token, "user": {"email": email, "name": name}}
