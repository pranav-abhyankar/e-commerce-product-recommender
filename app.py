"""
E-commerce Product Recommender API
Combines recommendation logic with LLM-powered explanations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from collections import defaultdict
import numpy as np
from anthropic import Anthropic

app = Flask(__name__)
CORS(app)

client = Anthropic()


products_db = {
    "P001": {"id": "P001", "name": "Wireless Headphones", "category": "Electronics", "price": 79.99, "tags": ["audio", "wireless", "portable"]},
    "P002": {"id": "P002", "name": "USB-C Cable", "category": "Electronics", "price": 12.99, "tags": ["cable", "connector", "essential"]},
    "P003": {"id": "P003", "name": "Phone Case", "category": "Accessories", "price": 24.99, "tags": ["protection", "mobile", "portable"]},
    "P004": {"id": "P004", "name": "Screen Protector", "category": "Accessories", "price": 9.99, "tags": ["protection", "glass", "mobile"]},
    "P005": {"id": "P005", "name": "Portable Charger", "category": "Electronics", "price": 34.99, "tags": ["charging", "portable", "essential"]},
    "P006": {"id": "P006", "name": "Bluetooth Speaker", "category": "Electronics", "price": 49.99, "tags": ["audio", "wireless", "portable"]},
    "P007": {"id": "P007", "name": "Phone Stand", "category": "Accessories", "price": 14.99, "tags": ["support", "mobile", "desk"]},
    "P008": {"id": "P008", "name": "Cable Organizer", "category": "Accessories", "price": 11.99, "tags": ["organization", "cable", "desk"]},
}


user_interactions = defaultdict(lambda: {"viewed": [], "purchased": [], "categories": defaultdict(int)})


def calculate_similarity(tags1, tags2):
    """Calculate Jaccard similarity between two tag sets"""
    if not tags1 or not tags2:
        return 0
    intersection = len(set(tags1) & set(tags2))
    union = len(set(tags1) | set(tags2))
    return intersection / union if union > 0 else 0


def get_recommendations(user_id, num_recommendations=3):
    """
    Generate product recommendations based on user behavior
    Uses collaborative filtering + content-based approach
    """
    user_data = user_interactions[user_id]
    
    if not user_data["viewed"] and not user_data["purchased"]:
        return list(products_db.keys())[:num_recommendations]
    
    user_product_ids = set(user_data["viewed"] + user_data["purchased"])
    user_products = [products_db[pid] for pid in user_product_ids if pid in products_db]
    
    if not user_products:
        return list(products_db.keys())[:num_recommendations]
    
    preference_tags = defaultdict(float)
    for product in user_products:
        weight = 2.0 if product["id"] in user_data["purchased"] else 1.0
        for tag in product.get("tags", []):
            preference_tags[tag] += weight
    
    product_scores = {}
    for product_id, product in products_db.items():
        if product_id in user_product_ids:
            continue  
        
        similarity = calculate_similarity(product.get("tags", []), list(preference_tags.keys()))
        category_bonus = 1.5 if user_data["categories"][product["category"]] > 0 else 1.0
        
        product_scores[product_id] = similarity * category_bonus
    
    recommended = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
    return [pid for pid, _ in recommended[:num_recommendations]]


def generate_explanation(user_id, product_id):
    """
    Generate LLM-powered explanation for why a product is recommended
    """
    user_data = user_interactions[user_id]
    product = products_db.get(product_id)
    
    if not product:
        return "Product not found."
    
    viewed_products = [products_db[pid] for pid in user_data["viewed"] if pid in products_db]
    purchased_products = [products_db[pid] for pid in user_data["purchased"] if pid in products_db]
    
    context = f"""
User Profile:
- Viewed products: {[p['name'] for p in viewed_products[-5:]]}
- Purchased products: {[p['name'] for p in purchased_products]}
- Favorite categories: {dict(user_data['categories'])}

Recommended Product:
- Name: {product['name']}
- Category: {product['category']}
- Price: ${product['price']}
- Tags: {', '.join(product['tags'])}

Please provide a concise, personalized explanation (2-3 sentences) for why this product would be a good recommendation for this user based on their behavior and preferences.
"""
    
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=200,
        messages=[
            {
                "role": "user",
                "content": f"Based on the user profile and recommended product details, explain why this recommendation makes sense:\n{context}"
            }
        ]
    )
    
    return response.content[0].text


@app.route('/api/products', methods=['GET'])
def list_products():
    """List all products in catalog"""
    return jsonify(list(products_db.values()))


@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get specific product details"""
    product = products_db.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product)


@app.route('/api/user/<user_id>/track', methods=['POST'])
def track_interaction(user_id):
    """Track user interaction (view or purchase)"""
    data = request.json
    product_id = data.get("product_id")
    interaction_type = data.get("type", "view") 
    
    if product_id not in products_db:
        return jsonify({"error": "Product not found"}), 404
    
    product = products_db[product_id]
    
    if interaction_type == "view":
        if product_id not in user_interactions[user_id]["viewed"]:
            user_interactions[user_id]["viewed"].append(product_id)
    elif interaction_type == "purchase":
        user_interactions[user_id]["purchased"].append(product_id)
        if product_id not in user_interactions[user_id]["viewed"]:
            user_interactions[user_id]["viewed"].append(product_id)
    
    user_interactions[user_id]["categories"][product["category"]] += 1
    
    return jsonify({
        "status": "success",
        "user_id": user_id,
        "interaction": interaction_type,
        "product_id": product_id
    })


@app.route('/api/recommendations/<user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    """Get recommendations for a user with explanations"""
    num_recs = request.args.get('count', 3, type=int)
    
    recommended_ids = get_recommendations(user_id, num_recs)
    recommendations = []
    
    for product_id in recommended_ids:
        product = products_db[product_id]
        explanation = generate_explanation(user_id, product_id)
        
        recommendations.append({
            "product": product,
            "explanation": explanation,
            "generated_at": datetime.now().isoformat()
        })
    
    return jsonify({
        "user_id": user_id,
        "recommendations": recommendations,
        "count": len(recommendations)
    })


@app.route('/api/user/<user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    """Get user interaction profile"""
    user_data = user_interactions[user_id]
    return jsonify({
        "user_id": user_id,
        "viewed_count": len(user_data["viewed"]),
        "purchase_count": len(user_data["purchased"]),
        "favorite_categories": dict(user_data["categories"]),
        "viewed_products": [products_db[pid]["name"] for pid in user_data["viewed"][-5:] if pid in products_db],
        "purchased_products": [products_db[pid]["name"] for pid in user_data["purchased"] if pid in products_db]
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})


if __name__ == '__main__':
    app.run(debug=True, port=5000)