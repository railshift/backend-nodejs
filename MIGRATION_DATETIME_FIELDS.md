# DateTime Fields Migration Guide

## Schema Changes (✅ Applied)

### Old Fields → New Fields

| Old Field Name | New Field Name | Type | Description |
|----------------|----------------|------|-------------|
| `trainArrivalDate` + `trainArrivalTime` | `trainArrivalDateTime` | DateTime | Train arrival date + time combined |
| `signOnTime` | `signOnDateTime` | DateTime | Sign on date + time |
| `departureTime` | `departureDateTime` | DateTime | Departure date + time |
| `signOffDate` + `signOffTime` | `signOffDateTime` | DateTime | Sign off date + time combined |

## API Request/Response Changes

### Creating a Shift (POST /api/v1/shifts)

**Old Format:**
```json
{
  "trainArrivalDate": "2025-12-02T00:00:00.000Z",
  "trainArrivalTime": "2025-12-02T14:30:00.000Z",
  "signOnTime": "2025-12-02T14:45:00.000Z"
}
```

**New Format:**
```json
{
  "trainArrivalDateTime": "2025-12-02T14:30:00.000Z",
  "signOnDateTime": "2025-12-02T14:45:00.000Z"
}
```

### Completing a Shift (POST /api/v1/shifts/:id/complete)

**Old Format:**
```json
{
  "signOffDate": "2025-12-02T00:00:00.000Z",
  "signOffTime": "2025-12-02T22:30:00.000Z",
  "signOffStation": "MUMBAI"
}
```

**New Format:**
```json
{
  "signOffDateTime": "2025-12-02T22:30:00.000Z",
  "signOffStation": "MUMBAI"
}
```

## Code Update Checklist

### Files to Update:

- [ ] `/src/validators/shift.validator.js` - Update validation rules
- [ ] `/src/services/shift.service.js` - Update field names in queries
- [ ] `/src/services/dutyHours.service.js` - Update field references
- [ ] `/src/controllers/alert.controller.js` - Update select queries
- [ ] `/src/controllers/dashboard.controller.js` - Update filter queries
- [ ] `/src/jobs/shiftMonitor.job.js` - Update field references
- [ ] `/src/routes/shift.routes.js` - Update validation middleware
- [ ] `/scripts/createTestShift.js` - Update test script

### Search & Replace Patterns:

```bash
# In validators and route files
trainArrivalDate → trainArrivalDateTime
trainArrivalTime → trainArrivalDateTime (merge with above)
signOnTime → signOnDateTime
departureTime → departureDateTime  
signOffDate → signOffDateTime
signOffTime → signOffDateTime (merge with above)

# In service files (reading from DB)
shift.signOnTime → shift.signOnDateTime
shift.signOffTime → shift.signOffDateTime
shift.trainArrivalDate → shift.trainArrivalDateTime

# In queries
where: { signOffTime: null } → where: { signOffDateTime: null }
select: { signOnTime: true } → select: { signOnDateTime: true }
```

## Migration SQL (Already Applied)

```sql
-- Rename columns
ALTER TABLE "shifts" RENAME COLUMN "trainArrivalDate" TO "trainArrivalDateTime";
ALTER TABLE "shifts" DROP COLUMN "trainArrivalTime";
ALTER TABLE "shifts" RENAME COLUMN "signOnTime" TO "signOnDateTime";
ALTER TABLE "shifts" RENAME COLUMN "departureTime" TO "departureDateTime";
ALTER TABLE "shifts" RENAME COLUMN "signOffDate" TO "signOffDateTime";
ALTER TABLE "shifts" DROP COLUMN "signOffTime";

-- Update indexes
DROP INDEX IF EXISTS "shifts_signOnTime_idx";
DROP INDEX IF EXISTS "shifts_trainArrivalDate_idx";
CREATE INDEX "shifts_signOnDateTime_idx" ON "shifts"("signOnDateTime");
CREATE INDEX "shifts_trainArrivalDateTime_idx" ON "shifts"("trainArrivalDateTime");
```

## Benefits

✅ **Simpler API**: One field per timestamp instead of two
✅ **No confusion**: Date and time always stored together
✅ **Standard**: DateTime is the correct SQL type for timestamps
✅ **Accurate**: Eliminates timezone/date mismatch issues

## Notes

- `DateTime` in Prisma/PostgreSQL stores full timestamp with timezone
- Frontend can display date and time separately by parsing the DateTime value
- ISO 8601 format recommended: `2025-12-02T14:30:00.000Z`
