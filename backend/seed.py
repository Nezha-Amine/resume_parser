from app import create_app, mongo, bcrypt
from app.models import User

def seed_db():
    app = create_app()
    with app.app_context():
        user_model = User(mongo)
        admin_email = "admin@netsense.com"
        admin_password = "admin123"
        admin_role = "admin"

        # Check if admin already exists
        if not user_model.find_user_by_email(admin_email):
            user_model.create_user(admin_email, admin_password, admin_role)
            print(f"Admin user {admin_email} created successfully.")
        else:
            print(f"Admin user {admin_email} already exists.")

if __name__ == '__main__':
    seed_db()
