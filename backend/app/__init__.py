from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from app.config import Config

mongo = PyMongo()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)  # Enable CORS for all routes

    # Initialize extensions
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Import and register blueprints here to avoid circular imports
    from app.routes import auth_bp, pdf_bp 
    app.register_blueprint(auth_bp)
    app.register_blueprint(pdf_bp, url_prefix='/pdf')

    return app
