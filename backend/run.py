from flask import abort, send_from_directory
from app import create_app
import os

app = create_app()



    
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))  # Default to port 5000 if PORT is not set
    app.run(debug=True, port=port)




