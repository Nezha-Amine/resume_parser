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
import subprocess
import requests
import pypandoc
from flask import url_for
from flask import send_from_directory
import win32com.client
import pythoncom


os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable

auth_bp = Blueprint('auth', __name__)
pdf_bp = Blueprint('pdf', __name__)
usr_bp = Blueprint('usr',__name__)

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
    data = request.json
    id = data.get('id')
    name = data.get("nom")
    surname = data.get("prenom")
    profil = data.get("profil")
    file_path = data.get("original_pdf_path")
    file_path_convertit = data.get("cv_convertit")
    mot = data.get("mot_cles")
    mot_cles = [item.strip() for item in mot.split(',') if item.strip()]
    if id :
        cv_model.update(id,file_path_convertit,mot_cles)

    else :
        
        cv_model.create_resume(
            first_name=name,
            last_name=surname,
            profil=profil,
            resume_file=file_path,
            resume_file_convertit=file_path_convertit,
            mot_cles=mot_cles
        )
    return jsonify({"cv_path": file_path }), 201

@usr_bp.route('/save', methods=['POST'])
def save():
    data = request.get_json()
    nom = data.get('nom')
    prenom = data.get('prenom')
    email = data.get('email')
    telephone = data.get('telephone')
    profil = data.get('profil')
    file = request.files.get('resume') 


    file_path = os.path.join('uploads', file.filename)

    if os.path.exists(file_path):
        return jsonify({"message": "Ce Candidature existe déjà"}), 409
    else :
        if file is None or file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed"}), 400
        if file:
            file_path = os.path.join('uploads', file.filename)
            file.save(file_path)
    
    cv_model.create_resume(
        first_name=nom,
        email=email,
        phone=telephone,
        last_name=prenom,
        profil=profil,
        resume_file=file_path,
    )
    return jsonify({"cv_path": 'done' }), 201


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def generate(file_path):
        # Initialize SparkSession
        spark = SparkSession.builder \
            .appName("PipelineSession") \
            .master("local") \
            .getOrCreate()
        
        # Read binary file data
        cv_df = spark.read.format("binaryFile").load(file_path)
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
        
        combined_list_str = ', '.join(map(str, combined_list))
        json_res = {
                'mot_cles' : combined_list_str,
                'text' : text ,
                'file_path' : file_path
        }

       
        shutil.rmtree('C:/Users/hp/resume_parser1/assets')
        if os.path.exists('C:/Users/hp/resume_parser1/tmp_folder'):
            shutil.rmtree('C:/Users/hp/resume_parser1/tmp_folder')

        spark.stop()

        return json_res


@auth_bp.route('/convert', methods=['POST'])
def convert_resume():
    try:
        data = None
        file = None
        content_type = request.content_type
        if content_type == 'application/json':
            data = request.json
        else : 
            file = request.files.get('file')
        file_path = None
        

        # Case 1: Handle file upload
        if file:
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400

            if not allowed_file(file.filename):
                return jsonify({"error": "File type not allowed"}), 400

            # Save the file to a specific path
            file_path = os.path.join('uploads', file.filename)
            file.save(file_path)

        # Case 2: Handle JSON payload (when no file is uploaded)
        elif data:
            file_path = data.get("cv")
            if not file_path:
                return jsonify({"error": "No profile path provided"}), 400
        
        else:
            return jsonify({"error": "No file or profile provided"}), 400

        # Call the generate function to process the file or profile
        json_res = generate(file_path)
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
    

@pdf_bp.route('/<filename>', methods=['GET'])
def serve_pdf(filename):
    try:
        # Define the directory where PDFs are stored
        pdf_directory = 'C:\\Users\\hp\\resume_parser1\\backend1\\pdf_service\\generated'
        
        # Check if the file exists
        if not os.path.exists(os.path.join(pdf_directory, filename)):
            return jsonify({"error": "File not found"}), 404

        # Serve the file
        return send_from_directory(pdf_directory, filename) 
    
    except Exception as e:
        print("Exception in serving PDF:", e)
        return jsonify({"error": str(e)}), 500

@pdf_bp.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        data = request.get_json()
        html_content = data.get('htmlContent')
        format = data.get('format')
        file_path_original = data.get('file_path_original')
        
        if not html_content:
            return jsonify({"error": "No HTML content provided"}), 400

        node_service_url = 'http://localhost:3001/generate-pdf'
        response = requests.post(node_service_url, json={"htmlContent": html_content , "format" : format , "file_path_original" : file_path_original})

        print("Node.js service response status:", response.status_code)
        print("Node.js service response body:", response.text)

        if response.status_code == 200:
            pdf_filename = response.json().get('pdf_path').split('\\')[-1]  # Extract filename
            pdf_url = url_for('pdf.serve_pdf', filename=pdf_filename, _external=True)
            return jsonify({"pdf_url": pdf_url}), 200
        else:
            return jsonify({"error": "Failed to generate PDF"}), response.status_code
    except Exception as e:
        print("Exception in generating PDF:", e)
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/converttoword', methods=['POST'])
def converttoword():
    try:
        data = request.json
        file = data.get("file")

        if not file:
            return jsonify({"error": "No file URL provided"}), 400

        file_name = os.path.basename(file)

        pdfdoc = f'C:/Users/hp/resume_parser1/backend1/pdf_service/generated/{file_name}'
        todocx = os.path.join('C:/Users/hp/resume_parser1/backend1/pdf2word', file_name.replace('.pdf', '.docx'))

        # Initialize Word application
        word = win32com.client.Dispatch("Word.Application" , pythoncom.CoInitialize())
        word.visible = 1

        # Open the PDF document
        wb1 = word.Documents.Open(pdfdoc, False, False, False)
        
        # Save as DOCX
        wb1.SaveAs(todocx, FileFormat=16)  # File format for DOCX
        
        # Close the document
        wb1.Close(SaveChanges=False)
        wb2 = word.Documents.Open(todocx)
        
        return jsonify({"message": "File converted and opened successfully", "docx_path": todocx}), 200

    except Exception as e:
        print("Exception in converting to Word:", e)
        return jsonify({"error": str(e)}), 500

