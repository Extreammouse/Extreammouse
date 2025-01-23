from future.backports.datetime import datetime
import requests
from job_application_processor import JobApplicationProcessor
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import sys
import string
import logging
import datetime
import os
from flask import Flask, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Log startup information
logger.info("Starting application initialization...")
logger.info(f"Python version: {sys.version}")
logger.info(f"Current working directory: {os.getcwd()}")
logger.info(f"Directory contents: {os.listdir('.')}")
logger.info(f"Environment variables: PORT={os.environ.get('PORT')}")
# Configure logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

if not firebase_admin._apps:
    cred = credentials.Certificate(os.getenv('GOOGLE_APPLICATION_CREDENTIALS'))
    firebase_admin.initialize_app(cred)

db = firestore.Client()
app.config['DEBUG'] = os.environ.get('GOOGLE_CREDENTIALS_PATH')
app.config['DEBUG'] = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
app.config['DEBUG'] = os.environ.get('HUNTER_API_KEY')
app.config['DEBUG'] = os.environ.get('ANTHROPIC_API_KEY')

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"An error occurred: {error}", exc_info=True)
    return jsonify({"error": "An internal error occurred"}), 500
port = int(os.environ.get("PORT", 8080))
CORS(app)

processor = JobApplicationProcessor()


def preprocess_and_extract_keywords_resume(text):
    # Define a set of basic joining words (stopwords)
    stop_words = set([
        "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves",
        "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
        "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
        "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an",
        "the", "and", "but", "if", "also","or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about",
        "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up",
        "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when",
        "not", "no", "nor", "too", "very", "can", "will", "just", "should", "now", "more", "most", "such", "some",
        "these", "those", "both", "each", "few", "other", "some", "such", "any", "ever", "every", "many", "much",
        "other", "some", "such", "any", "all", "both", "each", "few", "many", "most", "other", "some", "such", "any",
        "every", "no", "neither", "another", "half", "less"
    ])

    # Tokenize the text and remove stopwords and punctuation
    tokens = re.findall(r'\b\w+\b', text.lower())  # Use regex to split into words
    filtered_words = [word for word in tokens if word not in stop_words]
    if not filtered_words:
        return {"processed_text": ""}
    # Return the filtered text
    return {"processed_text": " ".join(filtered_words)}


def preprocess_and_extract_keywords(text):
    stop_words = set(["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself",
                      "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its",
                      "itself", "they", "them",
                      "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those",
                      "am", "is", "are",
                      "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did",
                      "doing", "a", "an",
                      "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for",
                      "with", "about", "against",
                      "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up",
                      "down", "in", "out",
                      "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when",
                      "where", "why", "how",
                      "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
                      "only", "own",
                      "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "d",
                      "ll", "m", "o",
                      "re", "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven", "isn", "ma",
                      "mightn",
                      "mustn", "needn", "shan", "shouldn", "wasn", "weren", "won", "wouldn"])

    words = text.lower().split()
    filtered_words = [word.strip(string.punctuation) for word in words if word not in stop_words and word.isalpha()]
    if not filtered_words:
        return {"processed_text": ""}

    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform([" ".join(filtered_words)])

    feature_names = tfidf.get_feature_names_out()
    scores = tfidf_matrix.sum(axis=0).A1
    word_scores = {word: score for word, score in zip(feature_names, scores)}

    sorted_words = sorted(word_scores.items(), key=lambda x: x[1], reverse=True)[:10]
    reduced_text = " ".join([word for word, score in sorted_words])

    return {"processed_text": reduced_text}


@app.route('/match_resumes', methods=['POST'])
def match_resumes():
    try:
        data = request.get_json()
        required_skills = data.get('required_skills', [])
        top_n = data.get('top_n', 5)

        if not required_skills:
            return jsonify({
                'error': 'No required skills provided'
            }), 400

        matches = processor.match_resumes_with_skills(required_skills, top_n)

        return jsonify({
            'matches': matches
        })

    except Exception as e:
        return jsonify({
            'error': f'Error processing request: {str(e)}'
        }), 500

@app.route('/generate_coverletter_output', methods=['POST'])
def generate_coverletter_output():
    try:
        data = request.get_json()
        resume = processor.get_resume_data_by_email_for_coverletter(data['email'])
        # Check if we got an error response
        if resume.get('status') == 'not_found' or resume.get('error'):
            return jsonify(resume), 404

        # Get resume content
        actual_resume = processor.get_only_resume_data_by_email(data['email'])
        if isinstance(actual_resume, dict) and 'error' in actual_resume:
            return jsonify(actual_resume), 404

        if isinstance(actual_resume, dict):
            actual_resume = actual_resume.get("resume", {}).get("fileContent", "")

        if not isinstance(actual_resume, str):
            return jsonify({"error": "Resume content is not valid"}), 400

        resume_concise = preprocess_and_extract_keywords_resume(actual_resume)
        job_description = resume.get("Job_Description", "N/A")
        job_desc_processed = preprocess_and_extract_keywords(job_description)
        # Generate final output
        output_data = processor.generate_coverletter_output(
            resume['jobPosition'],
            resume['company'],
            resume_concise["processed_text"],
            job_desc_processed["processed_text"]
        )

        return jsonify(output_data), 200

    except Exception as e:
        logger.error(f"An error occurred in generate_job_output: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/generate-job-output', methods=['POST'])
def generate_job_output():
    try:
        data = request.get_json()
        resume = processor.get_resume_data_by_email(data['email'])
        # Check if we got an error response
        if resume.get('status') == 'not_found' or resume.get('error'):
            return jsonify(resume), 404

        # Get resume content
        actual_resume = processor.get_only_resume_data_by_email(data['email'])
        if isinstance(actual_resume, dict) and 'error' in actual_resume:
            return jsonify(actual_resume), 404

        if isinstance(actual_resume, dict):
            actual_resume = actual_resume.get("resume", {}).get("fileContent", "")

        if not isinstance(actual_resume, str):
            return jsonify({"error": "Resume content is not valid"}), 400

        resume_concise = preprocess_and_extract_keywords_resume(actual_resume)
        job_description = resume.get("Job_Description", "N/A")
        job_desc_processed = preprocess_and_extract_keywords(job_description)
        # Generate final output
        output_data = processor.generate_output(
            resume['jobPosition'], # Use email from request instead of resume
            resume['company'],
            resume['emailtype'],
            resume_concise["processed_text"],
            job_desc_processed["processed_text"]
        )

        return jsonify(output_data), 200

    except Exception as e:
        logger.error(f"An error occurred in generate_job_output: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/test-firestore', methods=['GET'])
def test_firestore():
    try:
        users = list(processor.db.collection('user').limit(1).stream())
        return jsonify({
            "success": True,
            "users_found": len(users),
            "first_user_keys": list(users[0].to_dict().keys()) if users else []
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.route('/test-connection', methods=['GET'])
def test_connection():
    try:
        # Test Firestore connection
        processor.db.collection('user').limit(1).stream()

        # Test Anthropic connection
        processor.anthropic.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=5,
            messages=[{"role": "user", "content": "Hello"}]
        )

        # Test Hunter.io connection
        test_response = requests.get(
            f"https://api.hunter.io/v2/email-count?domain=google.com&api_key={processor.hunter_api_key}"
        )
        test_response.raise_for_status()

        # Test anymail.io connection
        test_response = requests.get(
            f"https://api.hunter.io/v2/email-count?domain=google.com&api_key={processor.hunter_api_key}"
        )
        test_response.raise_for_status()

        return jsonify({
            "status": "success",
            "message": "All connections working",
            "timestamp": datetime.datetime.now().isoformat()
        }), 200

    except Exception as e:
        logging.error(f"Connection test failed: {str(e)}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.datetime.now().isoformat()
        }), 500

if __name__ == "__main__":
    try:
        port = int(os.environ.get("PORT", 8080))
        logger.info(f"Attempting to start server on port {port}")
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        logger.error(f"Failed to start server: {e}", exc_info=True)
        sys.exit(1)