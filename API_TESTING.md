# 🚂 Railway Shift Management API - Testing Guide

## 🎉 System is Running!

**Server**: http://localhost:8080
**API Base**: http://localhost:8080/api/v1

---

## 👥 Test Users

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@railway.com | Admin@123 | SUPERADMIN | Full access |
| admin2@railway.com | Admin@123 | ADMIN | Can create/update shifts |
| user@railway.com | Admin@123 | USER | View-only access |

---

## 📝 API Testing Steps

### **Step 1: Login**

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@railway.com",
    "password": "Admin@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "employeeId": "ADMIN001",
      "name": "Super Admin",
      "email": "admin@railway.com",
      "role": "SUPERADMIN"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Save the `accessToken` for next requests!**

---

### **Step 2: Create a Shift**

```bash
curl -X POST http://localhost:8080/api/v1/shifts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "trainNumber": "12345",
    "trainName": "Goods Express",
    "locomotiveNo": "WAG12345",
    "locoPilot": {
      "employeeId": "LP001",
      "name": "Rajesh Kumar"
    },
    "trainManager": {
      "employeeId": "TM001",
      "name": "Suresh Sharma"
    },
    "trainArrivalDate": "2025-11-18",
    "trainArrivalTime": "2025-11-18T10:00:00Z",
    "signOnTime": "2025-11-18T09:30:00Z",
    "timeOfTO": "2025-11-18T10:15:00Z",
    "departureTime": "2025-11-18T11:00:00Z"
  }'
```

**What happens:**
- ✅ Locomotive `WAG12345` auto-created if doesn't exist
- ✅ Loco Pilot `Rajesh Kumar` auto-created if doesn't exist
- ✅ Train Manager `Suresh Sharma` auto-created if doesn't exist
- ✅ Shift status set to `IN_PROGRESS`
- ✅ Staff status updated to `ON_DUTY`
- ✅ Duty logs created for both staff
- ✅ Socket.io event emitted: `shift:created`

---

### **Step 3: Get All Shifts**

```bash
curl http://localhost:8080/api/v1/shifts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**With filters:**
```bash
curl "http://localhost:8080/api/v1/shifts?status=IN_PROGRESS&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### **Step 4: Get Active Shifts Summary**

```bash
curl http://localhost:8080/api/v1/shifts/active/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response includes:**
- Total active shifts
- Duty hours for each shift
- Alert levels (normal, info, warning, high, critical)

---

### **Step 5: Get Shift by ID**

```bash
curl http://localhost:8080/api/v1/shifts/SHIFT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response includes:**
- Shift details
- Locomotive info
- Loco pilot & train manager info
- All notifications
- Complete duty log history

---

### **Step 6: Update Shift (Add Release Time)**

```bash
curl -X PATCH http://localhost:8080/api/v1/shifts/SHIFT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "releaseTime": "2025-11-18T20:00:00Z"
  }'
```

**What happens:**
- ✅ Shift status changed to `COMPLETED`
- ✅ Duty hours calculated
- ✅ Staff status updated to `AVAILABLE`
- ✅ Release duty logs created
- ✅ Socket.io event emitted: `shift:updated`

---

### **Step 7: Plan Relief**

```bash
curl -X PATCH http://localhost:8080/api/v1/shifts/SHIFT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "reliefPlanned": true,
    "reliefReason": "Exceeded 9 hour duty limit"
  }'
```

**What happens:**
- ✅ Shift status changed to `RELIEF_PLANNED`
- ✅ Relief duty logs created
- ✅ Tracking stops for this shift

---

## 🔍 Query Parameters for List Shifts

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (SCHEDULED, IN_PROGRESS, COMPLETED, RELIEF_PLANNED, CANCELLED) |
| trainNumber | string | Search by train number |
| locoPilotId | uuid | Filter by loco pilot ID |
| trainManagerId | uuid | Filter by train manager ID |
| startDate | ISO8601 | Filter shifts from this date |
| endDate | ISO8601 | Filter shifts until this date |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

---

## 🚨 Duty Hour Alert Levels

| Hours | Alert Level | Action |
|-------|-------------|--------|
| 8 hrs | INFO | Information notification |
| 9 hrs | WARNING | Relief decision required |
| 11 hrs | HIGH | Escalated alert |
| 12 hrs | HIGH | Critical monitoring |
| 14 hrs | CRITICAL | Immediate action required |

---

## 🔐 Authentication Headers

All protected routes require:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

If token expires (after 15 minutes), use refresh token:

```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📊 Health & Metrics

**Health Check:**
```bash
curl http://localhost:8080/health
```

**Prometheus Metrics:**
```bash
curl http://localhost:8080/metrics
```

---

## 🎯 Key Features Implemented

### ✅ **Auto-Create Logic**
- Locomotive auto-created if not exists
- Staff auto-created if not exists
- Name updates if staff already exists

### ✅ **Validation**
- Cannot create shift if staff already on duty
- Cannot delete in-progress shifts
- Proper date/time validation

### ✅ **Duty Tracking**
- Real-time duty hours calculation
- Duty logs for every event
- Staff status management

### ✅ **Real-time Updates**
- Socket.io events for shift changes
- Live duty hours updates
- Notification broadcasting

### ✅ **Security**
- JWT authentication
- Role-based authorization
- Rate limiting
- Input validation

---

## 🧪 Test Scenarios

### Scenario 1: Create First Shift
1. Login as admin
2. Create shift with new staff & locomotive
3. Verify staff & locomotive auto-created
4. Check shift is IN_PROGRESS
5. Verify duty logs created

### Scenario 2: Try Duplicate Staff
1. Create shift with existing staff employee ID
2. System should prevent (staff already on duty)
3. Complete first shift
4. Create new shift with same staff
5. Should succeed now

### Scenario 3: Complete Shift
1. Update shift with release time
2. Verify status changed to COMPLETED
3. Check staff status is AVAILABLE
4. Verify duty hours calculated

### Scenario 4: Relief Planning
1. Create shift
2. Update with reliefPlanned=true
3. Verify status changed to RELIEF_PLANNED
4. Check duty logs

---

## 🔄 Next Steps

1. **Notification System** - Auto-alerts at 8, 9, 11, 12, 14 hours
2. **Background Job** - Monitor active shifts continuously
3. **Reports & Analytics** - Duty hours reports
4. **Staff Management** - CRUD operations for staff
5. **Locomotive Management** - CRUD operations for locomotives

---

## 💡 Tips

- Use Postman or Thunder Client VS Code extension for easier testing
- Save the access token in environment variables
- Check logs in `logs/` folder for debugging
- Use Prisma Studio to view database: `npx prisma studio`

---

**🎉 Your Shift Management System is Ready to Use!**
