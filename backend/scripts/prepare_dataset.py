import json
import os
import pandas as pd
from datasets import load_dataset

OUTPUT_FILE = "finetune_ready.jsonl"
SYSTEM_PROMPT = "You are CompanionAI, a highly specialized, warm, compassionate, and culturally sensitive mental health support agent based on Cognitive Behavioral Therapy (CBT)."

def format_openai(user_text, assistant_text):
    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text},
            {"role": "assistant", "content": assistant_text}
        ]
    }

def main():
    print("Loading datasets... (This might take a few minutes for the first run)")
    final_data = []

    # 1. CounselChat (Best for Therapy/Counseling logic)
    print("Processing CounselChat...")
    try:
        counsel_ds = load_dataset("nbertagnolli/counsel-chat", split="train")
        for row in counsel_ds:
            question = row.get("questionText", "")
            answer = row.get("answerText", "")
            if question and answer:
                final_data.append(format_openai(question, answer))
    except Exception as e:
        print(f"Skipping CounselChat due to error: {e}")

    # 2. Add Custom Hinglish/Hindi Dataset for localization
    print("Adding Custom Hinglish Data...")
    hinglish_data = [
        ("mujhe bohot akelapan feel ho raha hai, koi baat karne ko nahi hai.", 
         "Main samajh sakta hoon ki akelapan kitna bhari lag sakta hai. Kabhi-kabhi aisa lagna normal hai. Kya aap mujhe batayenge ki aaj din bhar aapne kya kiya? Main yahan aapki baat sunne ke liye hoon."),
        
        ("meri neend nahi aa rahi bohot stress hai future ka.",
         "Stress ki wajah se neend aana mushkil ho jata hai. Ye ek common problem hai jise 'catastrophizing' kehte hain, jahan hamara dimaag aage aane wali cheezon se darta hai. Ek choti si breathing exercise try karein: 4 seconds saans andar lein, aur 4 seconds bahar. Try karke batayen kaisa laga?"),
        
        ("main hamesha fail ho jata hu, mujhse kuch nahi hoga.",
         "Aisa lagna bahut dardnak hota hai. Par kya sach mein aap 'hamesha' fail hue hain? Ya sirf is baar kuch theek nahi hua? Chaliye unn chizon ko yaad karte hain jahan aapne acha kiya tha."),

        ("mujhe marna hai, jeene ka mann nahi kar raha.",
         "I hear you, and I care about you. Please reach out to a counselor right now:\n\n📞 India: iCall \u2014 9152987821\n📞 India: Vandrevala Foundation \u2014 1860-2662-345\n🌐 International: Befrienders Worldwide \u2014 befrienders.org\n\nYou are not alone. A real person is waiting to help.")
    ]
    for q, a in hinglish_data:
        final_data.append(format_openai(q, a))

    # Save to JSONL
    print(f"Writing {len(final_data)} samples to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for item in final_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
            
    print(f"Success! Your fine-tuning dataset is ready at backend/scripts/{OUTPUT_FILE}")

if __name__ == "__main__":
    main()
