import os
import httpx
from typing import List, Dict, Tuple

# CompanionAI: CBT-based supportive agent.
# AGENTIC BEHAVIOR: CompanionAI conducts active listening and cognitive reframing 
# autonomously. It independently scans every message for safety issues and 
# determines if escalating to BridgeAI resources is required.

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "self harm", "hurt myself", 
    "don't want to live", "dont want to live", "khatam kar lun", 
    "jeena nahi chahta", "mar jaana chahta hun", "mar jana chahta",
    "muje marna hai", "mujhe marna hai", "marna chahta", "marne ka mann",
    "khatam karna", "khatam ho jana"
]

CRISIS_RESPONSE = """I hear you, and I care about you. Please reach out to a counselor right now:

📞 India: iCall — 9152987821
📞 India: Vandrevala Foundation — 1860-2662-345
🌐 International: Befrienders Worldwide — befrienders.org

You are not alone. A real person is waiting to help."""

CBT_SYSTEM_PROMPT = """You are CompanionAI, a highly specialized, warm, compassionate, and culturally sensitive mental health support agent based on Cognitive Behavioral Therapy (CBT).

Your core purpose is to assist the user by utilizing active listening, empathetic validation, and structured CBT techniques to help them navigate emotional distress.

CRITICAL INSTRUCTIONS & ACCURACY GUIDELINES:
1. Deep Empathy & Validation: Always start by actively validating the user's emotional state. Make them feel heard and safe.
2. CBT Reframing: Gently help the user identify cognitive distortions (e.g., Catastrophizing, All-or-Nothing thinking, Overgeneralization). Ask guiding questions to help them challenge these thoughts objectively.
3. Grounding & De-escalation: If the user feels overwhelmed or anxious, suggest concrete, evidence-based grounding techniques (e.g., 5-4-3-2-1 method, 4-7-8 breathing, progressive muscle relaxation).
4. Professional Boundaries: You are an AI, NOT a licensed human therapist. NEVER diagnose any mental or physical conditions. NEVER prescribe or recommend medications or specific treatments.
5. Absolute Safety: If the user mentions any form of self-harm, suicide, or crisis, you MUST immediately stop therapeutic conversation and direct them to seek emergency professional help. Do not attempt to talk them out of it yourself.
6. Tone & Format: Keep your responses warm, non-judgmental, and concise (2-3 short paragraphs max). Avoid being overly clinical or robotic.
7. Language Matching: ALWAYS write in the language the user prefers (Hindi, English, or conversational Hinglish). Mirror their tone to build rapport.
"""

def check_crisis(message: str) -> Tuple[bool, str]:
    """
    Checks if a user message contains any crisis keywords.
    Returns (is_crisis, matched_keyword).
    """
    msg_lower = message.lower()
    for kw in CRISIS_KEYWORDS:
        if kw in msg_lower:
            return True, kw
    return False, ""

async def get_response(
    user_message: str, 
    history: List[Dict[str, str]], 
    user_context: Dict[str, str],
    api_key: str = None
) -> Tuple[str, bool, bool]:
    """
    Generates a CBT response from CompanionAI.
    Returns a tuple: (response_text, is_crisis_triggered, should_escalate_to_resources)
    """
    # 1. First safety check
    is_crisis, kw = check_crisis(user_message)
    if is_crisis:
        return CRISIS_RESPONSE, True, True

    # Check if we should suggest resources (e.g., if history is long or they asked for help)
    should_escalate = False
    if len(history) >= 10:
        should_escalate = True
    
    # Check if they explicitly asked for professional resources
    help_words = ["doctor", "therapist", "psychologist", "counselor", "clinic", "hospital", "therapy", "treatment", "helpline", "help me connect"]
    msg_lower = user_message.lower()
    if any(w in msg_lower for w in help_words):
        should_escalate = True

    # 2. Call LLM API if key is present
    anthropic_key = api_key or os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    github_key = os.getenv("GITHUB_TOKEN")
    
    if github_key:
        try:
            headers = {
                "Authorization": f"Bearer {github_key}",
                "Content-Type": "application/json",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"
            }
            
            messages = [{"role": "system", "content": CBT_SYSTEM_PROMPT + f"\nUser info: Country={user_context.get('country', 'India')}, Language={user_context.get('language', 'English')}."}]
            for msg in history[-10:]:
                if msg["role"] in ["user", "assistant", "system"]:
                    messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": user_message})
            
            payload = {
                "model": "gpt-4o",
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7
            }
            
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://models.inference.ai.azure.com/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=15.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    response_text = data["choices"][0]["message"]["content"]
                    return response_text, False, should_escalate
                else:
                    print(f"GitHub API error: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"Exception during GitHub call: {e}")

    if anthropic_key:
        try:
            headers = {
                "x-api-key": anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            # Format history for Claude API
            # Claude expects role: user or assistant
            claude_messages = []
            for msg in history[-10:]: # Limit context to last 10 messages
                if msg["role"] in ["user", "assistant"]:
                    claude_messages.append({"role": msg["role"], "content": msg["content"]})
            
            # Append current message
            claude_messages.append({"role": "user", "content": user_message})
            
            payload = {
                "model": "claude-3-haiku-20240307",
                "max_tokens": 500,
                "system": CBT_SYSTEM_PROMPT + f"\nUser info: Country={user_context.get('country', 'India')}, Language={user_context.get('language', 'English')}.",
                "messages": claude_messages
            }
            
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=headers,
                    json=payload,
                    timeout=15.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    response_text = data["content"][0]["text"]
                    return response_text, False, should_escalate
                else:
                    # Log error internally and try OpenAI if key exists, or fall back to rule-based
                    print(f"Claude API error: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"Exception during Claude call: {e}")

    if openai_key:
        try:
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            
            messages = [{"role": "system", "content": CBT_SYSTEM_PROMPT + f"\nUser info: Country={user_context.get('country', 'India')}, Language={user_context.get('language', 'English')}."}]
            for msg in history[-10:]:
                if msg["role"] in ["user", "assistant", "system"]:
                    messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": user_message})
            
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7
            }
            
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=15.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    response_text = data["choices"][0]["message"]["content"]
                    return response_text, False, should_escalate
                else:
                    print(f"OpenAI API error: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"Exception during OpenAI call: {e}")

    # 3. Empathetic Rule-Based Fallback (if no API keys or APIs fail)
    return get_fallback_cbt_response(user_message, user_context.get("language", "English")), False, should_escalate

def get_fallback_cbt_response(message: str, language: str) -> str:
    """
    A rule-based chatbot fallback using CBT and active listening.
    Ensures the app functions perfectly during hackathon demos even without API keys.
    """
    msg = message.lower()
    is_hindi = language.lower() in ["hindi", "hinglish"] or any(x in msg for x in ["hai", "hoon", "mujh", "mera", "lag", "thak", "akela"])
    
    if is_hindi:
        if any(x in msg for x in ["lonely", "akela", "alone", "koi nahi"]):
            return "Main samajh sakta hoon ki akelapan kitna mushkil ho sakta hai. Kabhi-kabhi aisa lagta hai jaise koi hamare saath nahi hai, par main yahan aapki baat sunne ke liye hoon.\n\nKya aap mujhe thoda aur bata sakte hain ki aapko kabse aisa lag raha hai? Hum milkar is baare mein baat kar sakte hain."
        elif any(x in msg for x in ["sleep", "neend", "soya", "sleeping"]):
            return "Neend na aana hamari mental wellness ko kafi prabhavit karta hai. Jab hum dhang se so nahi paate, toh thakaan aur chintayein aur badh jaati hain.\n\nChaliye ek choti si grounding exercise try karte hain: 4 seconds ke liye saans andar lein, 4 seconds ke liye rokein, aur fir 4 seconds mein bahar chodein. Kya aap ise try karna chahenge?"
        elif any(x in msg for x in ["anxious", "gabrhat", "darr", "stress", "chinta"]):
            return "Ghabrahat aur stress mein hamara mind aane vaale darr ke baare mein sochne lagta hai (catastrophizing). Yeh normal hai par hum ise slow down kar sakte hain.\n\nApne aas-paas dekhiye aur 3 aisi cheezein dhoondhiye jise aap dekh sakte hain, 2 jise touch kar sakte hain, aur 1 jise sun sakte hain. Isse aapko thoda relief milega."
        else:
            return "Mujhe batane ke liye shukriya. Main yahan bina kisi judgment ke aapki baat sunne ke liye hoon. Aap jo bhi mahsoos kar rahe hain, vo valid hai.\n\nKya aap thoda aur detail mein share karna chahenge ki aapke dimaag mein kya chal raha hai?"
    else:
        # English fallback
        if any(x in msg for x in ["lonely", "alone", "nobody"]):
            return "I hear you, and I understand how heavy loneliness can feel. It is completely okay to feel this way, and please know that I am here to listen to you without any judgment.\n\nCould you share a bit more about what's making you feel this way today? Sometimes sharing is the first step to processing it."
        elif any(x in msg for x in ["sleep", "insomnia", "tired", "wake"]):
            return "A lack of quality sleep can really drain our emotional energy and make everything feel twice as hard. Let's try a simple, calming breathing exercise together.\n\nInhale slowly for a count of 4, hold it for 4, and exhale gently for 4. Doing this a few times can help signal to your body that it is safe to rest. Would you like to try it?"
        elif any(x in msg for x in ["anxious", "anxiety", "panic", "stress", "worried"]):
            return "Anxiety and stress can make our thoughts spin out of control, often convincing us of the worst-case scenario. This is a common cognitive distortion called catastrophizing.\n\nLet's try a grounding technique: Name 3 things you can see right now, 2 things you can touch, and 1 sound you can hear. How does that feel?"
        else:
            return "Thank you for sharing that with me. I appreciate your openness. It takes courage to talk about how we are feeling.\n\nHow can I best support you right now? We can practice a cognitive reframing exercise, a breathing technique, or you can simply vent here."
