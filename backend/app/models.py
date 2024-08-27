from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo.collection import Collection
from typing import Optional

class User:
    def __init__(self, mongo: PyMongo):
        self.collection: Collection = mongo.db.login

    def create_user(self, email: str, password: str, role: str) -> None:
        hashed_password = generate_password_hash(password)
        user = {
            'email': email,
            'password': hashed_password,
            'role': role
        }
        self.collection.insert_one(user)

    def find_user_by_email(self, email: str) -> Optional[dict]:
        return self.collection.find_one({'email': email})

    def verify_password(self, password: str, hashed_password: str) -> bool:
        return check_password_hash(hashed_password, password)
