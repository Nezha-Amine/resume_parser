from flask import Blueprint, abort, app, request, jsonify, send_from_directory
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
from custom_package import model_generate
import pandas as pd
from flask import Blueprint, request, jsonify, send_file

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

def upload_resume(name,surname,profil,file_path , mot):
    
    cv_model.create_resume(name, surname, profil, file_path, mot)

    return jsonify({"cv_path": file_path }), 201


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



@auth_bp.route('/convert', methods=['POST'])
def convert_resume():
    try:
        
        file_path = None
        if request.form.get('nom') :
            file = request.files.get('file')
            if file is None or file.filename == '':
                return jsonify({"error": "No selected file"}), 400

            if not allowed_file(file.filename):
                return jsonify({"error": "File type not allowed"}), 400
            if file:
                file_path = os.path.join('uploads', file.filename)
                file.save(file_path)
        else :
            file_path = request.form.get('file')    
        

        
        # Initialize SparkSession
        spark = SparkSession.builder \
            .appName("PipelineSession") \
            .master("local") \
            .getOrCreate()
        
        # Read binary file data
        cv_df = spark.read.format("binaryFile").option("pathGlobFilter", "*.*").load(file_path)
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

        # text to save in localStorage 
        text = final_df_cleaned['text'].iloc[0]
        

        final_df_cleaned = final_df_cleaned.drop(['path_of_image', 'predictions', 'text'], axis=1)
        final_df_cleaned['name'] = final_df_cleaned['path'].apply(
            lambda path: os.path.splitext(os.path.basename(path))[0]
        )
        final_df_cleaned['json_res'] = final_df_cleaned['json_res'].apply(
            lambda res: re.sub(r'```', '', re.sub(r'json', '', res))
        )   
        json_res_column = final_df_cleaned[['json_res']]
        json_res_column.to_json('jsonData.json', orient = 'split', compression = 'infer', index = 'true')
        

        json_string = final_df_cleaned['json_res'].iloc[0]
        
        json_object = json.loads(json_string)

       

        mot_cles = json_object.get('mot_cles', [])
        if not isinstance(mot_cles, list):
            mot_cles = [mot_cles]

        skills = json_object.get('competences', [])
        if not isinstance(skills, list):
            skills = [skills]
        
        combined_list = mot_cles + skills
        
        if request.form.get('nom') :
            # upload_resume(name,surname,profil,file_path,combined_list)
            json_res = {
                'mot_cles' : combined_list ,
                'text' : text ,
                'file_path' : file_path
            }
       
        

        shutil.rmtree('../assets')
        shutil.rmtree('tmp_folder')
        spark.stop()

        return jsonify(json_res), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/search', methods=['POST'])
def search_resume():

    try :
        data = request.json
        search_profil = data.get("profile")
        skills = data.get("skills", [])
        results  = cv_model.select_resume(search_profil,skills)


        return jsonify({"res":  results }), 200
    
    except Exception as e: 
        return jsonify({"error": str(e)}), 500
    
@auth_bp.route('/regenerate', methods=['POST'])
def regenerate_resume():

    try :
        data = request.json
        text = data.get("text")
        load_model = model_generate.Generate()
        json_result = load_model.regenerate_text(text)
        df = pd.DataFrame({
            'json_res': [json_result]
        })

        df = df[['json_res']]
        df['json_res'] = df['json_res'].str.replace(r'```', '', regex=True)
        df['json_res'] = df['json_res'].str.replace(r'json', '', regex=True)        
        df.to_json('jsonData.json', orient = 'split', compression = 'infer', index = 'true')

        return jsonify({"res":  "done" }), 200
    
    except Exception as e: 
        return jsonify({"error": str(e)}), 500
    
    

@auth_bp.route('/uploads/<path:filename>', methods=['GET'])
def download_resume(filename):
    # Define the uploads directory
    uploads_dir = os.path.join(os.getcwd(), 'uploads')

    # Generate the full file path
    file_path = os.path.join(uploads_dir, filename)

    # Check if the file exists
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=False)
    else:
        return jsonify({"error": "File not found"}), 404