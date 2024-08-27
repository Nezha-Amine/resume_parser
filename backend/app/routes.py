from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import mongo, bcrypt
from app.models import User

auth_bp = Blueprint('auth', __name__)

user_model = User(mongo)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Find user by email
    user = user_model.find_user_by_email(email)
    if not user:
        return jsonify(message="User not found"), 400

    # Verify password
    if not user_model.verify_password(password, user['password']):
        return jsonify(message="Invalid credentials"), 400

    # Create JWT token with additional fields
    access_token = create_access_token(
        identity={
            '_id': str(user['_id']),

            'role': user.get('role', ''),

            'email': user['email']
        },
        expires_delta=None  # Token expires in 1 day by default
    )

    # Construct response with additional user details
    response = {
        'token': access_token,
        'role': user.get('role', ''),
        'userId': str(user['_id']),
        'email': user['email']
    }

    return jsonify(response), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if user_model.find_user_by_email(email):
        return jsonify(message="User already exists"), 400

    user_model.create_user(email, password, role)
    return jsonify(message="User registered successfully"), 201
