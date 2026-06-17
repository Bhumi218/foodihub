import urllib.request, json

BASE = "http://localhost:5000/api"

def api(method, path, data=None):
    url = BASE + path
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("Content-Type", "application/json")
    try:
        resp = urllib.request.urlopen(req)
        return json.loads(resp.read())
    except Exception as e:
        return {"success": False, "error": str(e)}

print("="*50)
print("1. HEALTH CHECK")
print(api("GET", "/health"))

print("\n" + "="*50)
print("2. FOODS COUNT")
foods = api("GET", "/foods")
print(f"Success: {foods['success']}, Count: {foods['count']}")

print("\n" + "="*50)
print("3. SIGNUP TEST")
r = api("POST", "/signup", {"name":"Admin","email":"admin@demo.com","password":"123456"})
print(r)
token = r.get("data",{}).get("token","")

print("\n" + "="*50)
print("4. LOGIN TEST")
if not token:
    r = api("POST", "/login", {"email":"admin@demo.com","password":"123456"})
    print(r)
    token = r.get("data",{}).get("token","")

if token:
    print(f"Got token: {token[:20]}...")
    
    print("\n" + "="*50)
    print("5. ADD NEW DISH TEST")
    req = urllib.request.Request(BASE + "/foods", 
        data=json.dumps({"name":"Test Dish","price":199,"category":"other","image":"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80"}).encode(),
        method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", f"Bearer {token}")
    resp = json.loads(urllib.request.urlopen(req).read())
    print(f"Added dish: {resp}")
    
    if resp.get("success"):
        new_id = resp["data"]["_id"]
        print(f"\nNew dish ID: {new_id}")
        
        print("\n" + "="*50)
        print("6. EDIT DISH TEST")
        req = urllib.request.Request(BASE + f"/foods/{new_id}",
            data=json.dumps({"name":"Updated Dish","price":299,"category":"pizza","image":"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80"}).encode(),
            method="PUT")
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {token}")
        resp2 = json.loads(urllib.request.urlopen(req).read())
        print(f"Edited dish: {resp2}")
        
        print("\n" + "="*50)
        print("7. DELETE DISH TEST")
        req = urllib.request.Request(BASE + f"/foods/{new_id}", method="DELETE")
        req.add_header("Authorization", f"Bearer {token}")
        resp3 = json.loads(urllib.request.urlopen(req).read())
        print(f"Deleted dish: {resp3}")

print("\n" + "="*50)
print("✅ ALL TESTS COMPLETE!")