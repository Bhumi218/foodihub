import urllib.request, json

BASE = "http://localhost:5000/api"

def api(method, path, data=None, token=None):
    url = BASE + path
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

# Login first
r = api("POST", "/login", {"email": "admin@demo.com", "password": "123456"})
token = r.get("data", {}).get("token", "")
if not token:
    r = api("POST", "/signup", {"name": "Admin", "email": "admin@demo.com", "password": "123456"})
    token = r.get("data", {}).get("token", "")

print(f"Token: {'OK' if token else 'FAIL'}")

# Dishes to add
dishes = [
    {"name": "Butter Chicken", "price": 349, "category": "other", 
     "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&q=80"},
    {"name": "Paneer Tikka", "price": 299, "category": "other",
     "image": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80"},
    {"name": "Dal Makhani", "price": 249, "category": "other",
     "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80"},
    {"name": "Gulab Jamun", "price": 149, "category": "desserts",
     "image": "https://images.unsplash.com/photo-1668236543090-82bbe735b850?w=300&q=80"},
    {"name": "Masala Dosa", "price": 199, "category": "other",
     "image": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&q=80"},
    {"name": "Chole Bhature", "price": 179, "category": "other",
     "image": "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=300&q=80"},
]

count = 0
for d in dishes:
    r = api("POST", "/foods", d, token)
    if r.get("success"):
        print(f"  ✅ {d['name']} - ₹{d['price']}")
        count += 1
    else:
        print(f"  ❌ {d['name']} - {r.get('message', 'ERROR')}")

print(f"\nAdded {count} dishes successfully!")

# Check total
foods = api("GET", "/foods")
print(f"Total dishes now: {foods['count']}")