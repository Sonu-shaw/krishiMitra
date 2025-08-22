# backend/routes/chatbot_route.py
from flask import Blueprint, request, jsonify
import re

chatbot_bp = Blueprint("chatbot", __name__, url_prefix="/api/chatbot")

# FAQs in English and Hindi
FAQS = {
    "register": {
        "en": "To register as a Farmer or Dealer, go to the Signup page and fill in your details.",
        "hi": "किसान या डीलर के रूप में रजिस्टर करने के लिए, साइनअप पेज पर जाएं और अपनी जानकारी भरें।"
    },
    "login": {
        "en": "Go to the Login page and enter your registered email and password.",
        "hi": "लॉगिन पेज पर जाएं और अपना रजिस्टर्ड ईमेल और पासवर्ड दर्ज करें।"
    },
    "selling crop": {
        "en": "Farmers can post a selling intent from their dashboard. Dealers in matching districts will see your request immediately.",
        "hi": "किसान अपने डैशबोर्ड से फसल बेचने का अनुरोध कर सकते हैं। जिन जिलों से मेल खाता है, वहां के डीलर तुरंत देख पाएंगे।"
    },
    "contact": {
        "en": "You can contact KrishiMitra customer support at 📞 1800-123-456 or ✉️ support@krishimitra.com.",
        "hi": "आप KrishiMitra ग्राहक सहायता से 📞 1800-123-456 या ✉️ support@krishimitra.com पर संपर्क कर सकते हैं।"
    },
    "help": {
        "en": "I can assist you with registration, login, selling crops, and contacting support.",
        "hi": "मैं आपकी मदद रजिस्ट्रेशन, लॉगिन, फसल बेचने और सपोर्ट से संपर्क करने में कर सकता हूँ।"
    }
}

def detect_language(text: str) -> str:
    # If contains Hindi characters → Hindi
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    return "en"

def find_answer(user_message: str) -> str:
    lang = detect_language(user_message)
    msg_lower = user_message.lower()

    for keyword, answers in FAQS.items():
        if keyword in msg_lower:
            return answers.get(lang, answers["en"])

    # fallback if not found
    return "❌ Sorry, I didn’t understand that. कृपया 'help' लिखें।"

@chatbot_bp.route("/ask", methods=["POST"])
def ask():
    data = request.json or {}
    user_message = data.get("message", "")

    if not user_message.strip():
        return jsonify({"error": "Message is required"}), 400

    bot_reply = find_answer(user_message)
    return jsonify({"reply": bot_reply})
