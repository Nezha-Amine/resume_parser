from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import mongo, bcrypt
from app.models import User , Resume
import os
from pyspark.sql.functions import regexp_replace
from pyspark.sql import SparkSession
from custom_package.transformer import  DetectRegionsText
from pyspark.ml import Pipeline
from pyspark.sql import SparkSession
from pyspark.ml import Pipeline, PipelineModel
import os
import sys
import json
import re
import shutil



os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

auth_bp = Blueprint('auth', __name__)

user_model = User(mongo)
cv_model = Resume(mongo)

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

@auth_bp.route('/upload', methods=['POST'])
def upload_resume():
    
    file = request.files.get('file')
    if file is None or file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    name = request.form.get('nom')
    surname = request.form.get('prenom')
    profil = request.form.get('profile')
 
    file_path = None
    if file:
        file_path = os.path.join('uploads', file.filename)
        file.save(file_path)

    cv_model.create_resume(name, surname, profil, file_path)

    return jsonify({"cv_path": file_path }), 201


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



@auth_bp.route('/convert', methods=['POST'])
def convert_resume():
    try:

        cv_path = request.form.get('cv_path')
        
        if not cv_path:
            return jsonify({"error": "No cv_path provided"}), 400
        
        # Initialize SparkSession
        spark = SparkSession.builder \
            .appName("PipelineSession") \
            .master("local") \
            .getOrCreate()
        
        # Read binary file data
        cv_df = spark.read.format("binaryFile").option("pathGlobFilter", "*.*").load(cv_path)
        cv_pandas = cv_df.select("path").toPandas()
        cv_pandas['path'] = cv_pandas['path'].str.replace(r'^file:/', '', regex=True)
        
        # Load and apply the pipeline model
        loaded_pipeline = PipelineModel.load('spark-warehouse')
        transformed_data = loaded_pipeline.transform(cv_pandas)
        transformed_df = transformed_data.toPandas()
        
        # Clean the transformed data
        columns_to_check = ['path', 'text']
        mask = ~transformed_df[columns_to_check].apply(lambda x: x.eq('NaN')).any(axis=1)
        final_df_cleaned = transformed_df[mask]
        final_df_cleaned = final_df_cleaned.drop(['path_of_image', 'predictions', 'text'], axis=1)
        final_df_cleaned['name'] = final_df_cleaned['path'].apply(
            lambda path: os.path.splitext(os.path.basename(path))[0]
        )
        final_df_cleaned['json_res'] = final_df_cleaned['json_res'].apply(
            lambda res: re.sub(r'```', '', re.sub(r'json', '', res))
        )   
        json_res_column = final_df_cleaned[['json_res']]
        json_res_column.to_json('jsonData.json', orient = 'split', compression = 'infer', index = 'true')
        

        shutil.rmtree('../assets')
        shutil.rmtree('tmp_folder')

        return jsonify({"message":  "done" }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500