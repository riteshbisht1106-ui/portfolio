import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.before_request
def log_request_info():
    print(f"Request: {request.method} {request.url}")
    # print(f"Headers: {request.headers}")
    # print(f"Body: {request.get_data()}")

# Database Configuration
def init_db():
    try:
        # Connect without database first to create it if it doesn't exist
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT'))  
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {os.getenv('DB_NAME')}")
        cursor.execute(f"USE {os.getenv('DB_NAME')}")
        
        # Create table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                subject VARCHAR(255),
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print("Database and table initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
         port=int(os.getenv('DB_PORT')) 
    )

init_db()  # Initialize on startup

def send_email(name, email, subject, message):
    sender_email = os.getenv('EMAIL_USER')
    sender_password = os.getenv('EMAIL_PASS')
    receiver_email = os.getenv('RECEIVER_EMAIL')

    msg = MIMEMultipart()
    msg['From'] = f"{name} <{sender_email}>"
    msg['To'] = receiver_email
    msg['Subject'] = f"New Portfolio Message: {subject}"

    body = f"Name: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@app.route('/api/contact', methods=['POST'])
def contact():
    print("Received contact form submission")
    data = request.json
    if not data:
        print("Error: No data received")
        return jsonify({"success": False, "message": "No data received"}), 400

    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    subject = data.get('subject')
    message = data.get('message')

    print(f"Submission from: {name} ({email})")

    # Save to Database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "INSERT INTO messages (name, email, phone, subject, message) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(query, (name, email, phone, subject, message))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"success": False, "message": "Database error"}), 500

    # Send Email
    email_sent = send_email(name, email, subject, message)
    
    if email_sent:
        return jsonify({"success": True, "message": "Message sent and saved successfully!"}), 200
    else:
        return jsonify({"success": True, "message": "Message saved to DB, but email notification failed."}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
