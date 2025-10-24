# Updated API Month-Year Format - Space Format

## Change Summary
Updated the API request format to send "SEP 2025" (with space) instead of "SEP-2025" (with dash).

## API Request Format

### Previous:
```json
{
  "reportType": "SUMMARY",
  "battalionIds": [1, 2, 3],
  "moduleId": "18",
  "page": 0,
  "size": 50,
  "monthYear": "SEP-2025",  // ❌ With dash
  "viewType": "BOTH"
}
```

### Current:
```json
{
  "reportType": "SUMMARY",
  "battalionIds": [1, 2, 3],
  "moduleId": "18",
  "page": 0,
  "size": 50,
  "monthYear": "SEP 2025",  // ✅ With space
  "viewType": "BOTH"
}
```

## Updated Methods

### 1. formatMonthYearForAPI():
```typescript
// Returns "SEP 2025" format for API
return `${monthNames[monthIndex]} ${year}`;  // Space instead of dash
```

### 2. formatMonthYear() for display:
```typescript
// Handles "SEP 2025" format (space separated) - keep as is
if (monthYear.includes(' ')) {
  return monthYear;
}
```

## Format Examples

| Form Input | API Request | Display Output |
|------------|-------------|----------------|
| Month: "09", Year: "2025" | "SEP 2025" | "SEP 2025" |
| Month: "01", Year: "2024" | "JAN 2024" | "JAN 2024" |
| Month: "12", Year: "2025" | "DEC 2025" | "DEC 2025" |

## Benefits

✅ **Correct API Format**: Sends "SEP 2025" as expected by backend  
✅ **Consistent Display**: Shows "SEP 2025" in the table  
✅ **Clean Format**: Space-separated format is more readable  
✅ **Backward Compatibility**: Still handles dash-separated formats if needed