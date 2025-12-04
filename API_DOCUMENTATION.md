# Railway Shift Management System - API Documentation# Railway Shift Management API Documentation



## Base URLBase URL: `http://localhost:8080/api/v1`

```

Development: http://localhost:8080/api/v1---

Production: https://your-domain.com/api/v1

```## Authentication Routes



## Authentication### 1. Register User

All protected endpoints require JWT Bearer token in the Authorization header:**POST** `/auth/register`

```

Authorization: Bearer <your_jwt_token>Creates a new user account (requires SUPERADMIN approval before login).

```

#### Request Payload

---```json

{

## 🔐 Authentication Endpoints  "employeeId": "EMP001",

  "name": "John Doe",

### 1. Login  "email": "john.doe@railway.com",

**POST** `/auth/login`  "phone": "+91-9876543210",

  "password": "SecurePass123!",

**Request Body:**  "division": "Operations",

```json  "designation": "Shift Coordinator",

{  "role": "ADMIN"

  "email": "admin@railway.com",}

  "password": "Admin@123"```

}

```#### Validation Rules

- `employeeId`: Required, string, unique

**Response (200 OK):**- `name`: Required, string, min 2 characters

```json- `email`: Required, valid email format, unique

{- `phone`: Optional, string

  "success": true,- `password`: Required, min 6 characters

  "data": {- `division`: Optional, string (Railway division/department)

    "user": {- `designation`: Optional, string (Job title)

      "id": "uuid",- `role`: Optional, enum: `USER`, `ADMIN`, `SUPERADMIN` (default: `USER`) - User's requested role, pending SUPERADMIN approval

      "email": "admin@railway.com",

      "role": "ADMIN",#### Success Response (201 Created)

      "name": "Admin User"```json

    },{

    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  "success": true,

    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  "message": "Registration successful. Your account is pending approval by administrator.",

  }  "data": {

}    "user": {

```      "id": "uuid-string",

      "employeeId": "EMP001",

### 2. Refresh Token      "name": "John Doe",

**POST** `/auth/refresh`      "email": "john.doe@railway.com",

      "phone": "+91-9876543210",

**Request Body:**      "role": "ADMIN",

```json      "status": "INACTIVE",

{      "isVerified": false,

  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."      "division": "Operations",

}      "designation": "Shift Coordinator",

```      "createdAt": "2025-11-27T13:30:00.000Z"

    }

### 3. Get Current User  }

**GET** `/auth/me`}

```

**Headers:** `Authorization: Bearer <token>`

#### Error Response (400 Bad Request)

**Response (200 OK):**```json

```json{

{  "success": false,

  "success": true,  "message": "Validation failed",

  "data": {  "errors": [

    "id": "uuid",    {

    "email": "admin@railway.com",      "field": "email",

    "role": "ADMIN",      "message": "Email already exists"

    "name": "Admin User",    }

    "status": "ACTIVE"  ]

  }}

}```

```

---

### 4. Logout

**POST** `/auth/logout`### 2. Login

**POST** `/auth/login`

**Headers:** `Authorization: Bearer <token>`

Authenticates a user and returns tokens.

---

#### Request Payload

## 🚂 Shift Management Endpoints```json

{

### 1. Create Shift  "email": "john.doe@railway.com",

**POST** `/shifts`  "password": "SecurePass123!"

}

**Permission:** Admin, SuperAdmin```



**Request Body:**#### Validation Rules

```json- `email`: Required, valid email format

{- `password`: Required, string

  "trainNumber": "12345",

  "trainName": "Rajdhani Express",#### Success Response (200 OK)

  "locomotiveNo": "WAP-7-30456",```json

  "locoPilot": {{

    "employeeId": "LP12345",  "success": true,

    "name": "Rajesh Kumar",  "message": "Login successful",

    "phone": "+91-9876543210"  "data": {

  },    "user": {

  "trainManager": {      "id": "uuid-string",

    "employeeId": "TM67890",      "employeeId": "EMP001",

    "name": "Suresh Sharma",      "name": "John Doe",

    "phone": "+91-9876543211"      "email": "john.doe@railway.com",

  },      "phone": "+91-9876543210",

  "trainArrivalDateTime": "2025-12-02T14:30:00Z",      "role": "USER",

  "signOnDateTime": "2025-12-02T14:45:00Z",      "status": "ACTIVE",

  "timeOfTO": "2025-12-02T14:40:00Z",      "lastLogin": "2025-11-24T13:35:00.000Z"

  "departureDateTime": "2025-12-02T15:00:00Z",    },

  "signOnStation": "MUMBAI",    "tokens": {

  "signOffStation": "DELHI",      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  "section": "Mumbai-Delhi",      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  "dutyType": "SP"    }

}  }

```}

```

**Field Descriptions:**

- `trainNumber` (required): Train identification number#### Error Response (401 Unauthorized)

- `trainName` (optional): Name of the train```json

- `locomotiveNo` (required): Locomotive number{

- `locoPilot.employeeId` (required): Loco pilot employee ID  "success": false,

- `locoPilot.name` (required): Loco pilot name  "message": "Invalid credentials"

- `locoPilot.phone` (optional): Loco pilot contact number}

- `trainManager.employeeId` (required): Train manager employee ID```

- `trainManager.name` (required): Train manager name

- `trainManager.phone` (optional): Train manager contact number#### Error Response (403 Forbidden)

- `trainArrivalDateTime` (required): ISO 8601 datetime when train arrives```json

- `signOnDateTime` (required): ISO 8601 datetime when crew signs on duty{

- `timeOfTO` (optional): ISO 8601 datetime of take over  "success": false,

- `departureDateTime` (optional): ISO 8601 datetime when train departs  "message": "Account is inactive or suspended"

- `signOnStation` (required): Station where crew signs on}

- `signOffStation` (optional): Station where crew signs off```

- `section` (required): Route section (e.g., "Mumbai-Delhi")

- `dutyType` (required): Type of duty - "SP" (Special), "WR" (Work Rest), "LR" (Local Run)---

- `signOffDateTime` (optional): ISO 8601 datetime when crew signs off

### 3. Refresh Token

**Response (201 Created):****POST** `/auth/refresh`

```json

{Generates new access token using refresh token.

  "success": true,

  "message": "Shift created successfully",#### Request Payload

  "data": {```json

    "id": "550e8400-e29b-41d4-a716-446655440000",{

    "trainNumber": "12345",  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    "trainName": "Rajdhani Express",}

    "locomotiveNo": "WAP-7-30456",```

    "trainArrivalDateTime": "2025-12-02T14:30:00.000Z",

    "signOnDateTime": "2025-12-02T14:45:00.000Z",#### Success Response (200 OK)

    "timeOfTO": "2025-12-02T14:40:00.000Z",```json

    "departureDateTime": "2025-12-02T15:00:00.000Z",{

    "signOffDateTime": null,  "success": true,

    "signOnStation": "MUMBAI",  "message": "Token refreshed successfully",

    "signOffStation": "DELHI",  "data": {

    "section": "Mumbai-Delhi",    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

    "dutyType": "SP",    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

    "status": "IN_PROGRESS",  }

    "dutyHours": null,}

    "locoPilotId": "uuid",```

    "trainManagerId": "uuid",

    "locomotiveId": "uuid",---

    "reliefPlanned": false,

    "reliefReason": null,### 4. Logout

    "createdAt": "2025-12-02T14:45:00.000Z",**POST** `/auth/logout`

    "updatedAt": "2025-12-02T14:45:00.000Z"

  }Logs out the current user (client should delete tokens).

}

```#### Headers

```

### 2. List ShiftsAuthorization: Bearer <accessToken>

**GET** `/shifts````



**Permission:** All authenticated users#### Success Response (200 OK)

```json

**Query Parameters:**{

- `status` (optional): Filter by status - "SCHEDULED", "IN_PROGRESS", "COMPLETED", "RELIEF_PLANNED", "CANCELLED"  "success": true,

- `trainNumber` (optional): Filter by train number  "message": "Logout successful"

- `locoPilotId` (optional): Filter by loco pilot UUID}

- `trainManagerId` (optional): Filter by train manager UUID```

- `startDate` (optional): Filter shifts from this date (ISO 8601)

- `endDate` (optional): Filter shifts until this date (ISO 8601)---

- `page` (optional): Page number (default: 1)

- `limit` (optional): Items per page (default: 10, max: 100)### 5. Get Current User

**GET** `/auth/me`

**Example Request:**

```Returns current authenticated user details.

GET /shifts?status=IN_PROGRESS&page=1&limit=20

```#### Headers

```

**Response (200 OK):**Authorization: Bearer <accessToken>

```json```

{

  "success": true,#### Success Response (200 OK)

  "data": {```json

    "shifts": [{

      {  "success": true,

        "id": "uuid",  "data": {

        "trainNumber": "12345",    "id": "uuid-string",

        "trainName": "Rajdhani Express",    "employeeId": "EMP001",

        "locomotiveNo": "WAP-7-30456",    "name": "John Doe",

        "signOnDateTime": "2025-12-02T14:45:00.000Z",    "email": "john.doe@railway.com",

        "departureDateTime": "2025-12-02T15:00:00.000Z",    "phone": "+91-9876543210",

        "signOffDateTime": null,    "role": "USER",

        "status": "IN_PROGRESS",    "status": "ACTIVE",

        "section": "Mumbai-Delhi",    "createdAt": "2025-11-24T13:30:00.000Z",

        "dutyType": "SP",    "updatedAt": "2025-11-24T13:30:00.000Z",

        "currentDutyHours": 5.25,    "lastLogin": "2025-11-24T13:35:00.000Z"

        "locoPilot": {  }

          "id": "uuid",}

          "name": "Rajesh Kumar",```

          "employeeId": "LP12345"

        },---

        "trainManager": {

          "id": "uuid",## Shift Routes

          "name": "Suresh Sharma",

          "employeeId": "TM67890"All shift routes require authentication.

        }

      }### Headers (Required for all shift routes)

    ],```

    "pagination": {Authorization: Bearer <accessToken>

      "page": 1,```

      "limit": 20,

      "total": 50,---

      "totalPages": 3

    }### 1. Create Shift

  }**POST** `/shifts`

}

```Creates a new shift entry.



### 3. Get Shift by ID#### Request Payload

**GET** `/shifts/:id````json

{

**Permission:** All authenticated users  "trainNumber": "12345",

  "trainName": "Express Train",

**Response (200 OK):**  "locomotiveNo": "WAP-7-30456",

```json  "locoPilot": {

{    "employeeId": "LP001",

  "success": true,    "name": "Rajesh Kumar",

  "data": {    "phone": "+91-9876543210"

    "id": "uuid",  },

    "trainNumber": "12345",  "trainManager": {

    "trainName": "Rajdhani Express",    "employeeId": "TM001",

    "locomotiveNo": "WAP-7-30456",    "name": "Suresh Singh",

    "trainArrivalDateTime": "2025-12-02T14:30:00.000Z",    "phone": "+91-9876543211"

    "signOnDateTime": "2025-12-02T14:45:00.000Z",  },

    "timeOfTO": "2025-12-02T14:40:00.000Z",  "trainArrivalDate": "2025-11-24T00:00:00.000Z",

    "departureDateTime": "2025-12-02T15:00:00.000Z",  "trainArrivalTime": "2025-11-24T08:30:00.000Z",

    "signOffDateTime": null,  "signOnTime": "2025-11-24T08:00:00.000Z",

    "signOnStation": "MUMBAI",  "signOnStation": "NDLS",

    "signOffStation": "DELHI",  "section": "Delhi-Mumbai",

    "section": "Mumbai-Delhi",  "dutyType": "SP",

    "dutyType": "SP",  "lobbySignOn": true,

    "status": "IN_PROGRESS",  "timeOfTO": "2025-11-24T08:45:00.000Z",

    "dutyHours": null,  "departureTime": "2025-11-24T09:00:00.000Z"

    "currentDutyHours": 5.25,}

    "reliefPlanned": false,```

    "reliefReason": null,

    "locoPilot": {#### Validation Rules

      "id": "uuid",- `trainNumber`: Required, string

      "employeeId": "LP12345",- `trainName`: Optional, string

      "name": "Rajesh Kumar",- `locomotiveNo`: Required, string (auto-creates locomotive if not exists)

      "phone": "+91-9876543210",- `locoPilot.employeeId`: Required, string

      "status": "ON_DUTY"- `locoPilot.name`: Required, string

    },- `locoPilot.phone`: Optional, string

    "trainManager": {- `trainManager.employeeId`: Required, string

      "id": "uuid",- `trainManager.name`: Required, string

      "employeeId": "TM67890",- `trainManager.phone`: Optional, string

      "name": "Suresh Sharma",- `trainArrivalDate`: Required, ISO 8601 date

      "phone": "+91-9876543211",- `trainArrivalTime`: Required, ISO 8601 datetime

      "status": "ON_DUTY"- `signOnTime`: Required, ISO 8601 datetime

    },- `signOnStation`: Required, string

    "locomotive": {- `section`: Required, string

      "id": "uuid",- `dutyType`: Required, enum: `SP`, `WR`, `LR`

      "locomotiveNo": "WAP-7-30456",- `lobbySignOn`: Optional, boolean

      "status": "IN_USE"- `timeOfTO`: Optional, ISO 8601 datetime

    },- `departureTime`: Optional, ISO 8601 datetime

    "createdAt": "2025-12-02T14:45:00.000Z",

    "updatedAt": "2025-12-02T14:45:00.000Z"#### Success Response (201 Created)

  }```json

}{

```  "success": true,

  "message": "Shift created successfully",

### 4. Update Shift  "data": {

**PATCH** `/shifts/:id`    "id": "shift-uuid",

    "trainNumber": "12345",

**Permission:** Admin, SuperAdmin    "trainName": "Express Train",

    "locomotiveId": "loco-uuid",

**Request Body:** (All fields optional)    "locomotive": {

```json      "id": "loco-uuid",

{      "locomotiveNo": "WAP-7-30456",

  "timeOfTO": "2025-12-02T14:40:00Z",      "status": "ACTIVE"

  "departureDateTime": "2025-12-02T15:00:00Z",    },

  "signOffDateTime": "2025-12-02T23:30:00Z",    "locoPilotId": "pilot-uuid",

  "signOffStation": "DELHI",    "locoPilot": {

  "section": "Mumbai-Delhi",      "id": "pilot-uuid",

  "dutyType": "SP",      "employeeId": "LP001",

  "status": "COMPLETED",      "name": "Rajesh Kumar",

  "reliefPlanned": true,      "phone": "+91-9876543210",

  "reliefReason": "Exceeded duty hours"      "staffType": "LOCO_PILOT",

}      "status": "ON_DUTY"

```    },

    "trainManagerId": "manager-uuid",

**Response (200 OK):**    "trainManager": {

```json      "id": "manager-uuid",

{      "employeeId": "TM001",

  "success": true,      "name": "Suresh Singh",

  "message": "Shift updated successfully",      "phone": "+91-9876543211",

  "data": {      "staffType": "TRAIN_MANAGER",

    "id": "uuid",      "status": "ON_DUTY"

    "trainNumber": "12345",    },

    "status": "COMPLETED",    "trainArrivalDate": "2025-11-24T00:00:00.000Z",

    "signOffDateTime": "2025-12-02T23:30:00.000Z",    "trainArrivalTime": "2025-11-24T08:30:00.000Z",

    "dutyHours": 8.75,    "signOnTime": "2025-11-24T08:00:00.000Z",

    "updatedAt": "2025-12-02T23:30:00.000Z"    "signOnStation": "NDLS",

  }    "signOffStation": null,

}    "section": "Delhi-Mumbai",

```    "dutyType": "SP",

    "lobbySignOn": true,

### 5. Complete Shift    "lobbySignOff": null,

**POST** `/shifts/:id/complete`    "timeOfTO": "2025-11-24T08:45:00.000Z",

    "departureTime": "2025-11-24T09:00:00.000Z",

**Permission:** Admin, SuperAdmin    "signOffDate": null,

    "signOffTime": null,

**Request Body:**    "dutyHours": null,

```json    "status": "IN_PROGRESS",

{    "reliefRequired": false,

  "signOffDateTime": "2025-12-02T23:30:00Z",    "reliefPlanned": false,

  "signOffStation": "DELHI"    "reliefTime": null,

}    "reliefReason": null,

```    "createdById": "user-uuid",

    "updatedById": null,

**Response (200 OK):**    "createdAt": "2025-11-24T13:40:00.000Z",

```json    "updatedAt": "2025-11-24T13:40:00.000Z"

{  }

  "success": true,}

  "message": "Shift completed successfully",```

  "data": {

    "id": "uuid",---

    "trainNumber": "12345",

    "status": "COMPLETED",### 2. Get All Shifts

    "signOffDateTime": "2025-12-02T23:30:00.000Z",**GET** `/shifts`

    "signOffStation": "DELHI",

    "dutyHours": 8.75Retrieves all shifts with optional filtering.

  }

}#### Query Parameters

```- `status`: Optional, filter by status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `RELIEF_PLANNED`, `CANCELLED`)

- `trainNumber`: Optional, filter by train number

### 6. Delete Shift- `section`: Optional, filter by section

**DELETE** `/shifts/:id`- `dutyType`: Optional, filter by duty type (`SP`, `WR`, `LR`)

- `fromDate`: Optional, filter from date (ISO 8601)

**Permission:** SuperAdmin only- `toDate`: Optional, filter to date (ISO 8601)

- `page`: Optional, page number (default: 1)

**Response (200 OK):**- `limit`: Optional, items per page (default: 10)

```json

{#### Example Request

  "success": true,```

  "message": "Shift deleted successfully"GET /shifts?status=IN_PROGRESS&section=Delhi-Mumbai&page=1&limit=20

}```

```

#### Success Response (200 OK)

### 7. Get Active Shifts Summary```json

**GET** `/shifts/active/summary`{

  "success": true,

**Permission:** All authenticated users  "data": {

    "shifts": [

**Response (200 OK):**      {

```json        "id": "shift-uuid",

{        "trainNumber": "12345",

  "success": true,        "trainName": "Express Train",

  "data": {        "locomotive": {

    "totalActive": 15,          "locomotiveNo": "WAP-7-30456"

    "byStatus": {        },

      "IN_PROGRESS": 12,        "locoPilot": {

      "RELIEF_PLANNED": 3          "employeeId": "LP001",

    },          "name": "Rajesh Kumar",

    "shifts": [          "phone": "+91-9876543210",

      {          "staffType": "LOCO_PILOT"

        "id": "uuid",        },

        "trainNumber": "12345",        "trainManager": {

        "status": "IN_PROGRESS",          "employeeId": "TM001",

        "currentDutyHours": 5.25,          "name": "Suresh Singh",

        "locoPilotName": "Rajesh Kumar",          "phone": "+91-9876543211",

        "trainManagerName": "Suresh Sharma"          "staffType": "TRAIN_MANAGER"

      }        },

    ]        "trainArrivalDate": "2025-11-24T00:00:00.000Z",

  }        "trainArrivalTime": "2025-11-24T08:30:00.000Z",

}        "signOnTime": "2025-11-24T08:00:00.000Z",

```        "signOnStation": "NDLS",

        "signOffStation": null,

---        "section": "Delhi-Mumbai",

        "dutyType": "SP",

## 🚨 Alert Endpoints        "lobbySignOn": true,

        "lobbySignOff": null,

### 1. Get Shift Alert History        "status": "IN_PROGRESS",

**GET** `/shifts/:id/alerts`        "dutyHours": null,

        "createdAt": "2025-11-24T13:40:00.000Z",

**Permission:** All authenticated users        "updatedAt": "2025-11-24T13:40:00.000Z"

      }

**Response (200 OK):**    ],

```json    "pagination": {

{      "currentPage": 1,

  "success": true,      "totalPages": 5,

  "data": {      "totalItems": 47,

    "shiftId": "uuid",      "itemsPerPage": 10

    "trainNumber": "12345",    }

    "signOnDateTime": "2025-12-02T14:45:00.000Z",  }

    "currentDutyHours": 8.5,}

    "status": "IN_PROGRESS",```

    "alertHistory": [

      {---

        "type": "7HR",

        "sent": true,### 3. Get Shift by ID

        "sentAt": "2025-12-02T21:45:00.000Z",**GET** `/shifts/:id`

        "response": null,

        "requiresAction": falseRetrieves a specific shift by ID.

      },

      {#### Success Response (200 OK)

        "type": "8HR",```json

        "sent": true,{

        "sentAt": "2025-12-02T22:45:00.000Z",  "success": true,

        "response": "CONTINUE",  "data": {

        "requiresAction": false    "id": "shift-uuid",

      }    "trainNumber": "12345",

    ]    "trainName": "Express Train",

  }    "locomotive": {

}      "id": "loco-uuid",

```      "locomotiveNo": "WAP-7-30456",

      "status": "ACTIVE"

### 2. Respond to Alert    },

**POST** `/alerts/:id/respond`    "locoPilot": {

      "id": "pilot-uuid",

**Permission:** Admin, SuperAdmin      "employeeId": "LP001",

      "name": "Rajesh Kumar",

**Request Body:**      "phone": "+91-9876543210",

```json      "staffType": "LOCO_PILOT",

{      "status": "ON_DUTY"

  "response": "CONTINUE",    },

  "remarks": "All systems normal, continuing journey"    "trainManager": {

}      "id": "manager-uuid",

```      "employeeId": "TM001",

      "name": "Suresh Singh",

**Response Options:**      "phone": "+91-9876543211",

- `"CONTINUE"` - Continue the shift      "staffType": "TRAIN_MANAGER",

- `"RELIEF_REQUIRED"` - Request relief      "status": "ON_DUTY"

- `"EMERGENCY_STOP"` - Emergency situation    },

    "trainArrivalDate": "2025-11-24T00:00:00.000Z",

---    "trainArrivalTime": "2025-11-24T08:30:00.000Z",

    "signOnTime": "2025-11-24T08:00:00.000Z",

## 📊 Dashboard Endpoints    "signOnStation": "NDLS",

    "signOffStation": "BCT",

### 1. Get Dashboard Statistics    "section": "Delhi-Mumbai",

**GET** `/dashboard/stats`    "dutyType": "SP",

    "lobbySignOn": true,

**Permission:** All authenticated users    "lobbySignOff": true,

    "timeOfTO": "2025-11-24T08:45:00.000Z",

**Response (200 OK):**    "departureTime": "2025-11-24T09:00:00.000Z",

```json    "signOffDate": "2025-11-24T00:00:00.000Z",

{    "signOffTime": "2025-11-24T18:00:00.000Z",

  "success": true,    "dutyHours": 10.0,

  "data": {    "status": "COMPLETED",

    "overview": {    "reliefRequired": false,

      "totalShifts": 150,    "reliefPlanned": false,

      "activeShifts": 15,    "reliefTime": null,

      "completedShifts": 130,    "reliefReason": null,

      "reliefPlanned": 5    "createdBy": {

    },      "name": "John Doe",

    "today": {      "employeeId": "EMP001"

      "totalShifts": 20,    },

      "completedShifts": 15,    "updatedBy": {

      "activeShifts": 5      "name": "John Doe",

    },      "employeeId": "EMP001"

    "thisWeek": {    },

      "totalShifts": 100,    "dutyLogs": [

      "completedShifts": 85      {

    },        "id": "log-uuid-1",

    "thisMonth": {        "logType": "SIGN_ON",

      "totalShifts": 400,        "logTime": "2025-11-24T08:00:00.000Z",

      "completedShifts": 350        "dutyHoursAtLog": 0,

    },        "remarks": "Sign on recorded"

    "alerts": {      },

      "total7HrAlerts": 45,      {

      "total8HrAlerts": 30,        "id": "log-uuid-2",

      "total9HrAlerts": 15,        "logType": "DEPARTURE",

      "total10HrAlerts": 8,        "logTime": "2025-11-24T09:00:00.000Z",

      "total11HrAlerts": 3,        "dutyHoursAtLog": 1.0,

      "total14HrAlerts": 1        "remarks": "Train departed"

    },      },

    "activeShiftsWithDutyHours": [      {

      {        "id": "log-uuid-3",

        "id": "uuid",        "logType": "RELEASE",

        "trainNumber": "12345",        "logTime": "2025-11-24T18:00:00.000Z",

        "status": "IN_PROGRESS",        "dutyHoursAtLog": 10.0,

        "currentDutyHours": 5.25        "remarks": "Shift completed"

      }      }

    ]    ],

  }    "createdAt": "2025-11-24T13:40:00.000Z",

}    "updatedAt": "2025-11-24T18:05:00.000Z"

```  }

}

### 2. Get Active Alerts```

**GET** `/dashboard/active-alerts`

#### Error Response (404 Not Found)

**Permission:** Admin, SuperAdmin```json

{

**Response (200 OK):**  "success": false,

```json  "message": "Shift not found"

{}

  "success": true,```

  "data": {

    "totalActiveAlerts": 5,---

    "pendingResponses": 2,

    "activeAlerts": [### 4. Update Shift

      {**PATCH** `/shifts/:id`

        "shift": {

          "id": "uuid",Updates an existing shift.

          "trainNumber": "12345",

          "trainName": "Rajdhani Express",#### Request Payload (All fields optional)

          "section": "Mumbai-Delhi",```json

          "status": "IN_PROGRESS",{

          "currentDutyHours": 8.5,  "trainName": "Updated Train Name",

          "signOnDateTime": "2025-12-02T14:45:00.000Z"  "timeOfTO": "2025-11-24T08:50:00.000Z",

        },  "departureTime": "2025-11-24T09:15:00.000Z",

        "crew": {  "signOffStation": "BCT",

          "locoPilot": {  "signOffDate": "2025-11-24T00:00:00.000Z",

            "name": "Rajesh Kumar",  "signOffTime": "2025-11-24T18:00:00.000Z",

            "employeeId": "LP12345",  "lobbySignOff": true,

            "phone": "+91-9876543210"  "status": "COMPLETED",

          },  "reliefRequired": false,

          "trainManager": {  "reliefPlanned": false,

            "name": "Suresh Sharma",  "reliefTime": null,

            "employeeId": "TM67890",  "reliefReason": null

            "phone": "+91-9876543211"}

          }```

        },

        "alerts": [#### Success Response (200 OK)

          {```json

            "type": "8HR",{

            "sentAt": "2025-12-02T22:45:00.000Z",  "success": true,

            "response": "CONTINUE",  "message": "Shift updated successfully",

            "requiresAction": false  "data": {

          }    "id": "shift-uuid",

        ],    "trainNumber": "12345",

        "pendingResponses": 0    "trainName": "Updated Train Name",

      }    "status": "COMPLETED",

    ]    "signOffStation": "BCT",

  }    "signOffDate": "2025-11-24T00:00:00.000Z",

}    "signOffTime": "2025-11-24T18:00:00.000Z",

```    "dutyHours": 10.0,

    "lobbySignOff": true,

---    "updatedAt": "2025-11-24T18:05:00.000Z"

  }

## 📝 Common Response Formats}

```

### Success Response

```json---

{

  "success": true,### 5. Delete Shift

  "data": { ... }**DELETE** `/shifts/:id`

}

```Deletes a shift (requires ADMIN or SUPERADMIN role).



### Error Response#### Success Response (200 OK)

```json```json

{{

  "success": false,  "success": true,

  "message": "Error message",  "message": "Shift deleted successfully"

  "errors": [}

    {```

      "field": "trainNumber",

      "message": "Train number is required"#### Error Response (403 Forbidden)

    }```json

  ]{

}  "success": false,

```  "message": "Insufficient permissions"

}

### Validation Error (400)```

```json

{---

  "success": false,

  "message": "Validation failed",### 6. Get Active Shifts

  "errors": [**GET** `/shifts/active`

    {

      "field": "signOnDateTime",Retrieves all currently active shifts (IN_PROGRESS status).

      "message": "Invalid date time format"

    }#### Success Response (200 OK)

  ]```json

}{

```  "success": true,

  "data": {

### Authentication Error (401)    "activeShifts": [

```json      {

{        "id": "shift-uuid",

  "success": false,        "trainNumber": "12345",

  "message": "Authentication required"        "trainName": "Express Train",

}        "locoPilot": {

```          "name": "Rajesh Kumar",

          "phone": "+91-9876543210"

### Authorization Error (403)        },

```json        "trainManager": {

{          "name": "Suresh Singh",

  "success": false,          "phone": "+91-9876543211"

  "message": "Insufficient permissions"        },

}        "signOnTime": "2025-11-24T08:00:00.000Z",

```        "currentDutyHours": 5.5,

        "status": "IN_PROGRESS"

### Not Found Error (404)      }

```json    ],

{    "count": 12

  "success": false,  }

  "message": "Shift not found"}

}```

```

---

---

### 7. Get Shift Statistics

## 📅 DateTime Format Guide**GET** `/shifts/stats`



All datetime fields use **ISO 8601** format:Retrieves shift statistics.



### Valid Formats:#### Query Parameters

- `"2025-12-02T14:30:00Z"` (UTC with Z)- `fromDate`: Optional, start date (ISO 8601)

- `"2025-12-02T14:30:00.000Z"` (UTC with milliseconds)- `toDate`: Optional, end date (ISO 8601)

- `"2025-12-02T14:30:00+05:30"` (With timezone offset)

#### Success Response (200 OK)

### JavaScript Example:```json

```javascript{

// Create ISO string from Date object  "success": true,

const now = new Date();  "data": {

const isoString = now.toISOString();    "totalShifts": 150,

// Result: "2025-12-02T14:30:00.000Z"    "activeShifts": 12,

    "completedShifts": 130,

// From date-time input    "cancelledShifts": 8,

const dateTimeInput = "2025-12-02T14:30";    "averageDutyHours": 9.2,

const isoString = new Date(dateTimeInput).toISOString();    "byStatus": {

```      "SCHEDULED": 5,

      "IN_PROGRESS": 12,

---      "COMPLETED": 130,

      "RELIEF_PLANNED": 3,

## 🔒 Permission Levels      "CANCELLED": 8

    },

| Role | View Shifts | Create Shift | Update Shift | Delete Shift | View Dashboard |    "byDutyType": {

|------|-------------|--------------|--------------|--------------|----------------|      "SP": 80,

| USER | ✅ | ❌ | ❌ | ❌ | ✅ |      "WR": 45,

| ADMIN | ✅ | ✅ | ✅ | ❌ | ✅ |      "LR": 25

| SUPERADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |    },

    "bySection": {

---      "Delhi-Mumbai": 60,

      "Mumbai-Delhi": 55,

## 🏥 Health & Metrics      "Delhi-Kolkata": 35

    }

### Health Check  }

**GET** `/health`}

```

**Response (200 OK):**

```json---

{---

  "status": "healthy",

  "timestamp": "2025-12-02T14:45:00.000Z",## User Management Routes (SUPERADMIN Only)

  "database": "connected",

  "uptime": 3600All user management routes require SUPERADMIN role.

}

```### Headers (Required)

```

### MetricsAuthorization: Bearer <accessToken>

**GET** `/metrics````



Returns Prometheus-compatible metrics for monitoring.---



---### 1. Get All Users

**GET** `/users`

## 🚀 Rate Limiting

Query Parameters: `status`, `role`, `isVerified`, `page`, `limit`

- **Authentication endpoints**: 5 requests per 15 minutes per IP

- **API endpoints**: 100 requests per 15 minutes per IP### 2. Get Pending Requests

- **Upload endpoints**: 10 requests per 15 minutes per IP**GET** `/users/pending-requests`



When rate limit is exceeded:### 3. Get User by ID

```json**GET** `/users/:id`

{

  "success": false,### 4. Approve User

  "message": "Too many requests, please try again later"**POST** `/users/:id/approve`

}

```### 5. Reject User

**POST** `/users/:id/reject`

---

Payload: `{ "reason": "string" }`

## 📌 Notes

### 6. Change User Role

1. All timestamps are in UTC (ISO 8601 format)**PATCH** `/users/:id/role`

2. UUIDs are version 4 (RFC 4122 compliant)

3. Phone numbers should include country code (e.g., +91-9876543210)Payload: `{ "role": "USER|ADMIN|SUPERADMIN" }`

4. Duty types: SP (Special), WR (Work Rest), LR (Local Run)

5. Status flow: SCHEDULED → IN_PROGRESS → COMPLETED (or CANCELLED/RELIEF_PLANNED)### 7. Update User

**PATCH** `/users/:id`

---

### 8. Activate User

**Last Updated:** December 2, 2025  **POST** `/users/:id/activate`

**API Version:** 1.0.0  

**Server:** Railway Shift Management System### 9. Deactivate User

**POST** `/users/:id/deactivate`

### 10. Delete User
**DELETE** `/users/:id`


---

## Automated Duty Hour Alert System

The system automatically monitors active shifts and sends alerts based on duty hours.

### Alert Thresholds

| Hours | Alert Type | Options | Action Required |
|-------|-----------|---------|-----------------|
| 7 hrs | Information | None | No - Informational only |
| 8 hrs | Plan Relief | • Plan to get relief<br>• Relief not required | Yes - Updates shift status |
| 9 hrs | Critical | • Crew will be relieved<br>• Crew not booked | Yes - May complete shift |
| 10 hrs | Extended Duty | • Relief arranged<br>• Continue duty | Yes - Requires approval |
| 11 hrs | Emergency | • Keep on duty<br>• Crew already relieved | Yes - Critical action |
| 14 hrs | Maximum Limit | • Emergency relief<br>• Shift ending | Yes - Immediate action |

---

### 1. Submit Alert Response
**POST** `/shifts/:id/alert-response`

Submit operator response to a duty hour alert.

#### Request Payload
```json
{
  "alertType": "8HR",
  "response": "PLAN_RELIEF",
  "remarks": "Relief crew arranged, arriving in 30 minutes"
}
```

#### Valid Responses by Alert Type

**8HR Alert:**
- `PLAN_RELIEF` - Updates shift status to RELIEF_PLANNED
- `RELIEF_NOT_REQUIRED` - Continues duty normally

**9HR Alert:**
- `CREW_RELIEVED` - Completes the shift
- `CREW_NOT_BOOKED` - Escalates issue, continues monitoring

**10HR Alert:**
- `RELIEF_ARRANGED` - Updates to RELIEF_PLANNED
- `CONTINUE_DUTY` - Continues with enhanced monitoring

**11HR Alert:**
- `KEEP_ON` - Emergency continuation with critical monitoring
- `CREW_ALREADY_RELIEVED` - Completes the shift

**14HR Alert:**
- `EMERGENCY_RELIEF` - Escalates to emergency status
- `SHIFT_ENDING` - Initiates shift completion process

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Alert response recorded successfully",
  "data": {
    "shiftId": "uuid-string",
    "alertType": "8HR",
    "response": "PLAN_RELIEF",
    "status": "RELIEF_PLANNED",
    "reliefPlanned": true,
    "reliefRequired": true
  }
}
```

---

### 2. Get Alert History
**GET** `/shifts/:id/alerts`

Retrieves complete alert history for a shift.

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "shiftId": "uuid-string",
    "trainNumber": "12345",
    "signOnTime": "2025-11-27T08:00:00.000Z",
    "currentDutyHours": 9.5,
    "status": "RELIEF_PLANNED",
    "alertHistory": [
      {
        "type": "7HR",
        "sentAt": "2025-11-27T15:00:00.000Z",
        "response": null,
        "requiresAction": false
      },
      {
        "type": "8HR",
        "sentAt": "2025-11-27T16:00:00.000Z",
        "response": "PLAN_RELIEF",
        "requiresAction": true
      },
      {
        "type": "9HR",
        "sentAt": "2025-11-27T17:00:00.000Z",
        "response": "CREW_NOT_BOOKED",
        "requiresAction": true
      }
    ]
  }
}
```

---

### 3. Complete Shift
**POST** `/shifts/:id/complete`

Completes a shift with sign-off details. Automatically calculates final duty hours.

#### Request Payload
```json
{
  "signOffTime": "2025-11-27T18:00:00.000Z",
  "signOffDate": "2025-11-27T00:00:00.000Z",
  "signOffStation": "BCT",
  "lobbySignOff": true
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Shift completed successfully",
  "data": {
    "id": "uuid-string",
    "trainNumber": "12345",
    "dutyHours": 10.0,
    "status": "COMPLETED",
    "signOffTime": "2025-11-27T18:00:00.000Z",
    "signOffStation": "BCT"
  }
}
```

---

## Socket.io Real-time Events

### Client Events to Listen

#### 1. Duty Alert
```javascript
socket.on('dutyAlert', (data) => {
  console.log('Duty alert received:', data);
});
```

**Event Data:**
```json
{
  "shiftId": "uuid-string",
  "trainNumber": "12345",
  "trainName": "Express Train",
  "locomotiveNo": "WAP-7-30456",
  "alertType": "8HR",
  "dutyHours": 8.0,
  "locoPilot": {
    "name": "Rajesh Kumar",
    "employeeId": "LP001",
    "phone": "+91-9876543210"
  },
  "trainManager": {
    "name": "Suresh Singh",
    "employeeId": "TM001",
    "phone": "+91-9876543211"
  },
  "signOnTime": "2025-11-27T08:00:00.000Z",
  "section": "Delhi-Mumbai",
  "timestamp": "2025-11-27T16:00:00.000Z",
  "options": {
    "message": "8 Hour Alert: Plan relief or confirm continuation",
    "requiresAction": true,
    "options": [
      {
        "value": "PLAN_RELIEF",
        "label": "Plan to get relief",
        "action": "updates shift status to RELIEF_PLANNED"
      },
      {
        "value": "RELIEF_NOT_REQUIRED",
        "label": "Relief not required",
        "action": "continues duty"
      }
    ]
  }
}
```

#### 2. Alert Response
```javascript
socket.on('alertResponse', (data) => {
  console.log('Alert response submitted:', data);
});
```

**Event Data:**
```json
{
  "shiftId": "uuid-string",
  "alertType": "8HR",
  "response": "PLAN_RELIEF",
  "status": "RELIEF_PLANNED",
  "timestamp": "2025-11-27T16:05:00.000Z"
}
```

#### 3. Shift Completed
```javascript
socket.on('shiftCompleted', (data) => {
  console.log('Shift completed:', data);
});
```

**Event Data:**
```json
{
  "shiftId": "uuid-string",
  "trainNumber": "12345",
  "dutyHours": 10.0,
  "timestamp": "2025-11-27T18:00:00.000Z"
}
```

---

## Duty Logs

All alert activities and responses are automatically logged in the `duty_logs` table and can be retrieved via the shift details endpoint.

### Log Types for Alerts:
- `ALERT_7HR` - 7 hour alert triggered
- `ALERT_8HR` - 8 hour alert triggered
- `ALERT_9HR` - 9 hour alert triggered
- `ALERT_10HR` - 10 hour alert triggered
- `ALERT_11HR` - 11 hour alert triggered
- `ALERT_14HR` - 14 hour alert triggered
- `RELIEF_PLANNED` - Relief has been planned
- `RELIEF_NOT_REQUIRED` - Relief confirmed not needed
- `CREW_RELIEVED` - Crew has been relieved
- `CREW_NOT_BOOKED` - Relief crew not available
- `KEEP_ON_DUTY` - Crew continuing on duty (emergency)
- `CREW_ALREADY_RELIEVED` - Crew already relieved
- `RELEASE` - Crew released from duty

### Example Duty Log Entry:
```json
{
  "id": "uuid-string",
  "shiftId": "shift-uuid",
  "staffId": "staff-uuid",
  "logType": "ALERT_8HR",
  "logTime": "2025-11-27T16:00:00.000Z",
  "dutyHoursAtLog": 8.0,
  "remarks": "8HR duty hour alert triggered",
  "metadata": {
    "trainNumber": "12345",
    "locomotiveNo": "WAP-7-30456",
    "alertType": "8HR",
    "timestamp": "2025-11-27T16:00:00.000Z"
  }
}
```

---

## Monitoring Configuration

- **Check Interval**: Every 5 minutes (configurable)
- **Alert Window**: ±15 minutes of threshold
- **Real-time Updates**: Via Socket.io
- **Persistence**: All alerts and responses saved to database
- **Duty Log**: Automatic logging for audit trail

