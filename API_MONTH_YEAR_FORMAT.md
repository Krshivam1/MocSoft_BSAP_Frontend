# API Month-Year Format Enhancement

## Problem
The form sends numeric month format "09-2025" to the API, but the API expects abbreviated month format "SEP-2025".

## Solution
Added `formatMonthYearForAPI()` method to convert form values before sending to API.

## Implementation Changes

### 1. New Helper Method Added:
```typescript
private formatMonthYearForAPI(month: string, year: string): string {
  if (!month || !year) return '';
  
  // Convert numeric month to abbreviated month name for API
  const monthNames = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];
  
  const monthIndex = parseInt(month, 10) - 1;
  if (monthIndex >= 0 && monthIndex < 12) {
    return `${monthNames[monthIndex]}-${year}`;
  }
  
  // Fallback to original format
  return `${month}-${year}`;
}
```

### 2. Updated buildReportData() Method:
```typescript
// Before
if (formValues.month && formValues.year) {
  const monthYear = `${formValues.month}-${formValues.year}`;
  reportData.monthYear = monthYear;
}

// After
if (formValues.month && formValues.year) {
  // Format month-year for API as "SEP-2025" instead of "09-2025"
  const formattedMonthYear = this.formatMonthYearForAPI(formValues.month, formValues.year);
  reportData.monthYear = formattedMonthYear;
}
```

## API Request Transformation

### Form Values:
- **Month:** "09" (from dropdown)
- **Year:** "2025" (from dropdown)

### Previous API Request:
```json
{
  "reportType": "SUMMARY",
  "battalionIds": [1, 2, 3],
  "moduleId": "18",
  "page": 0,
  "size": 50,
  "monthYear": "09-2025",  // ❌ Numeric format
  "viewType": "BOTH"
}
```

### New API Request:
```json
{
  "reportType": "SUMMARY",
  "battalionIds": [1, 2, 3],
  "moduleId": "18", 
  "page": 0,
  "size": 50,
  "monthYear": "SEP-2025", // ✅ Abbreviated format
  "viewType": "BOTH"
}
```

## Month Conversion Table

| Form Value | API Value |
|------------|-----------|
| "01"       | "JAN"     |
| "02"       | "FEB"     |
| "03"       | "MAR"     |
| "04"       | "APR"     |
| "05"       | "MAY"     |
| "06"       | "JUN"     |
| "07"       | "JUL"     |
| "08"       | "AUG"     |
| "09"       | "SEP"     |
| "10"       | "OCT"     |
| "11"       | "NOV"     |
| "12"       | "DEC"     |

## Benefits

✅ **API Compatibility**: Sends the expected format to the backend  
✅ **User Experience**: Form still uses standard numeric month dropdowns  
✅ **Automatic Conversion**: Transparent conversion between form and API  
✅ **Error Handling**: Graceful fallback for invalid month values  
✅ **Type Safety**: Full TypeScript support with proper validation  

## Flow Overview

1. **User selects:** Month "09" and Year "2025" from dropdowns
2. **Form stores:** month: "09", year: "2025" 
3. **API conversion:** "09" → "SEP", combined as "SEP-2025"
4. **API request:** Contains `"monthYear": "SEP-2025"`
5. **Display:** Uses `formatMonthYear()` to show "SEP-2025" in table

This ensures the API receives the expected abbreviated month format while maintaining a user-friendly form interface.