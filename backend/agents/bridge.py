import json
import os
from typing import List, Dict, Any

# BridgeAI: Resource Connector.
# AGENTIC BEHAVIOR: BridgeAI is triggered autonomously when CompanionAI escalates, 
# or when SentinelAI identifies high risk/crisis. It reads user parameters (country, 
# language, etc.) and independently retrieves and ranks resources to match their needs.

RESOURCES_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "resources.json"
)

def load_resources() -> List[Dict[str, Any]]:
    """
    Loads mental health resources from the JSON database.
    """
    if not os.path.exists(RESOURCES_FILE_PATH):
        return []
    try:
        with open(RESOURCES_FILE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading resources JSON: {e}")
        return []

def get_resources(
    country: str = None, 
    language: str = None, 
    is_crisis: bool = None, 
    cost: str = None
) -> List[Dict[str, Any]]:
    """
    Filters resources by country, language, crisis support, and cost.
    """
    resources = load_resources()
    filtered = []
    
    for r in resources:
        # Filter by Country
        if country and r.get("country", "").lower() != country.lower():
            # If the resource is marked as International, it can be shown as a fallback
            if r.get("country", "").lower() != "international":
                continue
                
        # Filter by Language
        if language:
            languages_lower = [l.lower() for l in r.get("languages", [])]
            if language.lower() not in languages_lower:
                # If they want Hindi/Japanese, and this resource is only English, skip
                # But if they want English and it supports English, keep.
                continue
                
        # Filter by Crisis Level
        if is_crisis is not None:
            if is_crisis and not r.get("crisis", False):
                continue
                
        # Filter by Cost
        if cost and cost.lower() != "all":
            if r.get("cost", "").lower() != cost.lower():
                continue
                
        filtered.append(r)
        
    return filtered

def get_recommendations(user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Intelligently ranks resources based on user profile context.
    Matches user's country and preferred language, prioritizing crisis resources 
    if user has flagged warnings, otherwise prioritizing counseling/therapy.
    """
    country = user_context.get("country", "India")
    language = user_context.get("language", "English")
    is_crisis_active = user_context.get("is_crisis", False)
    
    all_res = load_resources()
    scored_res = []
    
    for r in all_res:
        score = 0
        
        # 1. Country Match (High priority)
        r_country = r.get("country", "")
        if r_country.lower() == country.lower():
            score += 100
        elif r_country.lower() == "international":
            score += 50
            
        # 2. Language Match
        r_languages = [l.lower() for l in r.get("languages", [])]
        if language.lower() in r_languages:
            score += 50
            
        # 3. Crisis Status Match
        r_crisis = r.get("crisis", False)
        if is_crisis_active:
            if r_crisis:
                score += 200  # Extremely high priority for crisis users
        else:
            if not r_crisis:
                score += 30  # Prefer general counseling for normal users
                
        # 4. Cost Match
        r_cost = r.get("cost", "").lower()
        if r_cost == "free":
            score += 20  # Free resources are generally preferred
            
        scored_res.append((r, score))
        
    # Sort by score descending
    scored_res.sort(key=lambda x: x[1], reverse=True)
    
    # Return top 6 resources with computed fit_score percentage
    recommendations_list = []
    max_possible = 370.0 if is_crisis_active else 200.0
    for item, score in scored_res[:6]:
        item_copy = item.copy()
        pct = int((score / max_possible) * 100)
        item_copy["fit_score"] = min(100, max(45, pct))
        recommendations_list.append(item_copy)
        
    return recommendations_list
