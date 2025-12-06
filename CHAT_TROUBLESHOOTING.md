# Chat System - Troubleshooting Guide

## 🔍 Issue: No Distributors/Retailers Showing

If you're not seeing any users in the "Start New Chat" modal, follow these steps:

---

## ✅ **What's Been Fixed**

1. ✅ Created `/api/users?role=distributor` endpoint
2. ✅ Created `/api/users?role=retailer` endpoint  
3. ✅ Updated retailer chat page to fetch distributors
4. ✅ Updated distributor chat page to fetch retailers
5. ✅ Added console logging for debugging

---

## 🧪 **How to Test**

### **Step 1: Check if Modal Opens**
1. Go to Messages page (click 💬 or sidebar)
2. Click the **"+"** button (top right)
3. Modal should open with search bar

### **Step 2: Check Browser Console**
1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Look for logs:
   - `"Distributors response:"` or `"Retailers response:"`
   - Should show `{ success: true, users: [...] }`

### **Step 3: Check Network Tab**
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click "+" button in chat
4. Look for request to `/api/users?role=distributor` or `/api/users?role=retailer`
5. Click on the request
6. Check **Response** tab - should show list of users

### **Step 4: Check Server Logs**
Look in terminal for:
```
Found X users with role: distributor
GET /api/users?role=distributor 200
```

---

## 🔧 **Common Issues & Solutions**

### **Issue 1: No Users in Database**
**Problem**: No distributors or retailers registered yet

**Solution**: 
1. Create at least 2 accounts (1 distributor, 1 retailer)
2. Login as distributor and add some products
3. Login as retailer and browse products

### **Issue 2: Modal Not Opening**
**Problem**: "+" button not working

**Solution**:
1. Check browser console for errors
2. Try refreshing the page
3. Clear browser cache

### **Issue 3: API Not Being Called**
**Problem**: No network request in DevTools

**Solution**:
1. Check if `showNewChatModal` state is true
2. Check if `token` exists
3. Look for JavaScript errors in console

### **Issue 4: API Returns Empty Array**
**Problem**: `users: []` in response

**Solution**:
1. Check MongoDB connection
2. Verify users exist in database with correct role
3. Check server logs for database errors

---

## 📋 **Quick Checklist**

- [ ] At least 1 distributor account exists
- [ ] At least 1 retailer account exists
- [ ] Server is running (`npm run dev`)
- [ ] MongoDB is connected
- [ ] Browser console shows no errors
- [ ] "+" button opens modal
- [ ] Network tab shows API call
- [ ] API returns `success: true`

---

## 🎯 **Expected Behavior**

### **For Retailers:**
1. Click "+" button
2. API calls: `GET /api/users?role=distributor`
3. Response: `{ success: true, users: [{ _id, businessName, email }] }`
4. Modal shows list of distributors
5. Click distributor to start chat

### **For Distributors:**
1. Click "+" button
2. API calls: `GET /api/users?role=retailer`
3. Response: `{ success: true, users: [{ _id, businessName, email }] }`
4. Modal shows list of retailers
5. Click retailer to start chat

---

## 🔍 **Debug Steps**

### **1. Check if Users Exist**
Open MongoDB and run:
```javascript
db.users.find({ role: "distributor" }).count()
db.users.find({ role: "retailer" }).count()
```

Should return numbers > 0

### **2. Test API Directly**
In browser console (when logged in):
```javascript
fetch('/api/users?role=distributor', {
    headers: {
        'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
    }
})
.then(r => r.json())
.then(console.log)
```

Should log: `{ success: true, users: [...] }`

### **3. Check Component State**
Add this to chat page component:
```typescript
useEffect(() => {
    console.log('Distributors:', distributors);
}, [distributors]);
```

Should log array of distributors when modal opens

---

## 💡 **Manual Test**

1. **Create Test Accounts:**
   - Distributor: `test-dist@example.com` / `password123`
   - Retailer: `test-retail@example.com` / `password123`

2. **Login as Distributor:**
   - Add a product

3. **Login as Retailer:**
   - Go to Messages
   - Click "+"
   - Should see test distributor

4. **Login as Distributor:**
   - Go to Messages
   - Click "+"
   - Should see test retailer

---

## 🚀 **If Still Not Working**

### **Check These Files:**

1. **API Endpoint**: `/src/app/api/users/route.ts`
   - Should exist
   - Should export GET function

2. **Retailer Chat**: `/src/app/retailer/chat/page.tsx`
   - Line ~47: `fetch('/api/users?role=distributor')`

3. **Distributor Chat**: `/src/app/distributor/chat/page.tsx`
   - Line ~47: `fetch('/api/users?role=retailer')`

### **Restart Server:**
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### **Clear Browser Cache:**
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

---

## ✅ **Expected Console Output**

When you click the "+" button, you should see:

```
Distributors response: {
    success: true,
    users: [
        {
            _id: "123...",
            businessName: "ABC Distributors",
            email: "abc@example.com"
        }
    ]
}
```

And in server logs:
```
Found 1 users with role: distributor
GET /api/users?role=distributor 200
```

---

## 📞 **Next Steps**

1. Open browser console (F12)
2. Go to Messages page
3. Click "+" button
4. Check console for "Distributors response:" or "Retailers response:"
5. Share what you see in the console

The logs will tell us exactly what's happening!
