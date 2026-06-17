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
    except Exception as e:
        return {"success": False, "error": str(e)}

print("=" * 50)
print("1. HEALTH")
print(api("GET", "/health")["message"])

print("\n2. FOODS COUNT")
foods = api("GET", "/foods")
print(f"  {foods['count']} dishes")

print("\n3. LOGIN")
r = api("POST", "/login", {"email": "admin@demo.com", "password": "123456"})
token = r.get("data", {}).get("token", "")
print(f"  Login: {'OK' if token else 'FAIL'}")

if token:
    print("\n4. ADD DISH")
    r = api("POST", "/foods", {
        "name": "Tandoori Chicken",
        "price": 349,
        "category": "other",
        "image": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&q=80"
    }, token)
    print(f"  Add: {r.get('message', 'FAIL')}")
    dish_id = r.get("data", {}).get("_id", "")
    
    if dish_id:
        print(f"  New ID: {dish_id}")
        
        print("\n5. EDIT DISH")
        r = api("PUT", "/foods/" + dish_id, {
            "name": "Tandoori Chicken (Updated)",
            "price": 399,
            "category": "other",
            "image": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&q=80"
        }, token)
        print(f"  Edit: {r.get('message', 'FAIL')}")
        
        print("\n6. DELETE DISH")
        r = api("DELETE", "/foods/" + dish_id, token=token)
        print(f"  Delete: {r.get('message', 'FAIL')}")

print("\n7. FOODS AFTER ALL OPS")
foods = api("GET", "/foods")
print(f"  {foods['count']} dishes remaining")

print("\n" + "=" * 50)
print("ALL TESTS COMPLETE!")