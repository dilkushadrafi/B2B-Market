# Quick Test - Chat System

## Test the API directly

Open your browser console (F12) and run these commands:

### Test 1: Check if you're logged in
```javascript
console.log('Token:', document.cookie);
```

### Test 2: Test the distributors API
```javascript
fetch('/api/users?role=distributor', {
    headers: {
        'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
    }
})
.then(r => r.json())
.then(data => {
    console.log('Distributors API Response:', data);
    console.log('Number of distributors:', data.users?.length || 0);
})
.catch(err => console.error('Error:', err));
```

### Test 3: Test the retailers API
```javascript
fetch('/api/users?role=retailer', {
    headers: {
        'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
    }
})
.then(r => r.json())
.then(data => {
    console.log('Retailers API Response:', data);
    console.log('Number of retailers:', data.users?.length || 0);
})
.catch(err => console.error('Error:', err));
```

## Expected Results

You should see:
```javascript
Distributors API Response: {
    success: true,
    users: [
        { _id: "...", businessName: "...", email: "..." }
    ]
}
Number of distributors: 1 (or more)
```

## If you see empty array

If `users: []`, it means:
1. No users with that role exist in database
2. You need to create distributor/retailer accounts

## Create Test Accounts

1. Logout
2. Go to signup
3. Create account with role "distributor"
4. Logout
5. Create another account with role "retailer"
6. Now test again

## Share Results

Please share what you see in the console after running these tests!
