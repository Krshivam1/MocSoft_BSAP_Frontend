# Dynamic Menu Implementation

## Overview
This document explains the implementation of dynamic menus based on API responses where:
- **Parent Menus**: `menuUrl = "#"` - These are expandable containers that don't navigate
- **Routable Menus**: `menuUrl != "#"` - These navigate to specific routes

## API Response Structure
The menu API returns data in this format:
```json
{
  "status": "SUCCESS",
  "message": "User menus retrieved successfully",
  "data": [
    {
      "id": 1,
      "menuName": "Home",
      "menuUrl": "/homePage",
      "priority": 1,
      "active": true
    },
    {
      "id": 2,
      "menuName": "Permission Activity",
      "menuUrl": "#",
      "priority": 2,
      "active": true
    }
  ]
}
```

## Implementation Details

### 1. Menu Service (`src/app/services/menu.service.ts`)
- **`buildMenuHierarchy()`**: Processes API data to create parent-child relationships
- **Parent Menu Logic**: Items with `menuUrl = "#"` become parent containers
- **Child Menu Logic**: Items with specific URLs are grouped under appropriate parents
- **Icon Mapping**: Automatic icon assignment based on menu names

### 2. Dashboard Component (`src/app/dashboard/dashboard.component.ts`)
- **`toggleMenuItem()`**: Enhanced to handle both parent menus and routable items
- **Navigation Logic**: Only navigates for items with valid routes
- **Test Methods**: Added `loadTestData()` and `loadLiveData()` for testing

### 3. Template Updates (`src/app/dashboard/dashboard.component.html`)
- **Parent Menu Styling**: Special CSS classes for parent menus
- **Active State**: Visual indicators for active routes
- **Expand/Collapse**: Smooth animations for menu hierarchy
- **Badge Support**: Display notification badges on menu items

### 4. CSS Enhancements (`src/app/dashboard/dashboard.component.css`)
- **`.parent-menu`**: Special styling for non-navigable parent menus
- **`.active`**: Highlight currently active menu items
- **`.nav-badge`**: Notification badge styling
- **Hover Effects**: Different behaviors for parent vs child menus

## Menu Hierarchy Logic

### Parent Menu Identification
Menus with `menuUrl = "#"` are treated as parent containers:
- Permission Activity
- User Activity  
- Statistics Setup
- Data Entry
- Data Entry Previous Month
- CID

### Routable Menus
Menus with specific URLs navigate directly:
- Home → `/homePage`
- Report Generation → `/report`
- Communication → `/communications`

### Future Child Menu Grouping
The system is prepared to group child menus under parents using the `findParentMenu()` method, which can be enhanced to group related functionalities.

## Testing
Use the test buttons in the dashboard header:
- **🧪 Test**: Load the provided API sample data
- **🔄 Live**: Load data from the actual API

## Usage
1. The menu automatically loads when the dashboard initializes
2. Parent menus (with `#` URLs) can be clicked to expand/collapse
3. Child menus navigate to their specified routes
4. Active routes are highlighted
5. Permissions and roles are respected for menu visibility

## Benefits
- **Flexible Structure**: Easily accommodate new menu items from API
- **User Experience**: Clear distinction between navigable and organizational menus
- **Maintainable**: Centralized logic for menu behavior
- **Extensible**: Ready for additional features like badges, permissions, etc.