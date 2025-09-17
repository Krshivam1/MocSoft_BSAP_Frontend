# BSAP Frontend - API Integration & Dynamic Menu Implementation

This document provides a comprehensive guide on the implemented API services, login functionality, and dynamic menu system.

## 🚀 Features Implemented

### 1. Enhanced Authentication Service (`auth.service.ts`)

#### Key Features:
- **JWT Token Management**: Automatic token storage, refresh, and expiration handling
- **User Profile Management**: Load and update user profiles
- **Permission & Role-based Access**: Check user permissions and roles
- **Secure Storage**: Support for both session and persistent storage
- **Error Handling**: Comprehensive error handling with automatic logout on auth failures

#### API Methods:
```typescript
// Login with credentials
login(loginData: LoginRequest, remember: boolean = false): Observable<LoginResponse>

// Load user profile
loadUserProfile(): Observable<User>

// Update user profile
updateProfile(profileData: Partial<User>): Observable<User>

// Change password
changePassword(oldPassword: string, newPassword: string): Observable<any>

// Refresh JWT token
refreshToken(): Observable<LoginResponse>

// Logout user
logout(): Observable<any>

// Check permissions
hasPermission(permission: string): boolean
hasRole(role: string): boolean
```

#### Usage Example:
```typescript
// In login component
this.authService.login({ email, password }, this.rememberMe).subscribe({
  next: (response) => {
    if (response.success) {
      this.router.navigate(['/dashboard']);
    }
  },
  error: (error) => {
    this.errorMessage = error.message;
  }
});

// Check permissions in components
if (this.authService.hasPermission('user.create')) {
  // Show create user button
}
```

### 2. Dynamic Menu Service (`menu.service.ts`)

#### Key Features:
- **API-driven Menu**: Load menu items from backend API
- **Permission-based Filtering**: Automatically filter menu items based on user permissions
- **Role-based Access**: Support for role-based menu visibility
- **Hierarchical Structure**: Support for nested menu items with expansion/collapse
- **Real-time Updates**: Observable-based menu updates
- **Fallback Support**: Default menu items when API is unavailable

#### API Methods:
```typescript
// Initialize menu based on user role
initializeMenu(): Observable<MenuItem[]>

// Load user-specific menu
loadMenuFromApi(): Observable<MenuItem[]>

// Load admin menu
loadAdminMenu(): Observable<MenuItem[]>

// Toggle menu item expansion
toggleMenuItem(itemId: string): void

// Update menu item badge
updateMenuBadge(itemId: string, badge: { text: string; color: string } | null): void

// Find menu item by ID
findMenuItem(itemId: string): MenuItem | null

// Refresh menu
refreshMenu(): Observable<MenuItem[]>
```

#### Menu Item Structure:
```typescript
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  url?: string;
  target?: '_blank' | '_self';
  children?: MenuItem[];
  expanded?: boolean;
  permissions?: string[];
  roles?: string[];
  order?: number;
  visible?: boolean;
  disabled?: boolean;
  badge?: {
    text: string;
    color: string;
  };
}
```

### 3. Enhanced Login Component

#### New Features:
- **API Integration**: Uses real API calls instead of mock authentication
- **Remember Me**: Persistent login option
- **Password Visibility Toggle**: Show/hide password functionality
- **Email Validation**: Client-side email format validation
- **Enhanced Error Handling**: Detailed error messages from API
- **Loading States**: Visual feedback during authentication

#### Usage:
```html
<!-- Login form with new features -->
<input [(ngModel)]="email" type="email" placeholder="Email">
<input [(ngModel)]="password" [type]="showPassword ? 'text' : 'password'" placeholder="Password">
<label>
  <input [(ngModel)]="rememberMe" type="checkbox"> Remember Me
</label>
<button (click)="togglePasswordVisibility()">👁️</button>
<button (click)="onLogin()" [disabled]="isLoading">Login</button>
```

### 4. Enhanced Dashboard Component

#### New Features:
- **Dynamic Menu Loading**: Loads menu from API on initialization
- **Permission-based UI**: Shows/hides UI elements based on user permissions
- **Real-time User Data**: Subscribes to user profile changes
- **Menu State Management**: Handles menu expansion/collapse states
- **Error Recovery**: Graceful fallback when menu API fails

#### Key Methods:
```typescript
// Load user data and menu
ngOnInit() {
  this.loadUserData();
  this.loadMenu();
  this.subscribeToMenuChanges();
}

// Check if user has specific permission
hasPermission(permission: string): boolean {
  return this.authService.hasPermission(permission);
}

// Get visible menu items based on permissions
getVisibleMenuItems(): MenuItem[] {
  return this.menuItems.filter(item => this.isMenuItemVisible(item));
}
```

### 5. HTTP Interceptors

#### Token Interceptor (`token.interceptor.ts`)
- **Automatic Token Attachment**: Adds JWT token to all API requests
- **Token Refresh**: Automatically refreshes expired tokens
- **Request Retry**: Retries failed requests after token refresh
- **Logout on Auth Failure**: Redirects to login when refresh fails

#### Error Interceptor (`error.interceptor.ts`)
- **Global Error Handling**: Catches and processes all HTTP errors
- **User-friendly Messages**: Converts technical errors to user-friendly messages
- **Notification Integration**: Shows appropriate notifications for different error types
- **Error Logging**: Logs errors for debugging purposes

### 6. Notification Service (`notification.service.ts`)

#### Features:
- **Multiple Notification Types**: Success, error, warning, info
- **Auto-dismiss**: Configurable auto-dismiss timers
- **Observable Notifications**: Real-time notification updates
- **Dismissible**: Manual notification dismissal
- **Queue Management**: Handles multiple simultaneous notifications

#### Usage:
```typescript
// Show different types of notifications
this.notificationService.success('Operation completed successfully!');
this.notificationService.error('An error occurred');
this.notificationService.warning('Please check your input');
this.notificationService.info('New feature available');
```

## 📋 API Endpoints Configuration

The environment configuration includes all necessary API endpoints:

### Authentication Endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Menu Endpoints:
- `GET /api/menu/user-menu` - Get user-specific menu
- `GET /api/menu/admin-menu` - Get admin menu
- `GET /api/menu/permissions` - Get user permissions

### Expected API Response Formats:

#### Login Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",
      "permissions": ["user.read", "user.write"]
    }
  }
}
```

#### Menu Response:
```json
{
  "success": true,
  "message": "Menu loaded successfully",
  "data": [
    {
      "id": "dashboard",
      "label": "Dashboard",
      "icon": "🏠",
      "route": "/dashboard/home",
      "order": 1,
      "visible": true
    },
    {
      "id": "users",
      "label": "User Management",
      "icon": "👥",
      "route": "/dashboard/users",
      "permissions": ["user.read"],
      "order": 2,
      "visible": true
    }
  ]
}
```

## 🔧 Setup Instructions

1. **Install Dependencies**: All services are included in the app module
2. **Configure API Base URL**: Update `environment.ts` with your API URL
3. **Backend API**: Ensure your backend implements the expected endpoints
4. **Token Storage**: The system uses both sessionStorage and localStorage

## 🛡️ Security Features

- **JWT Token Management**: Secure token storage and automatic refresh
- **Route Guards**: Authentication guard protects dashboard routes
- **Permission-based Access**: Fine-grained permission system
- **Automatic Logout**: Logout on token expiration or auth failures
- **HTTPS Support**: Configured for secure API communication

## 📱 Usage Flow

1. **User Login**: User enters credentials → API call → Token storage → Menu loading
2. **Dashboard Access**: Token validation → User profile loading → Dynamic menu rendering
3. **Navigation**: Permission checks → Route access → Menu state updates
4. **Logout**: API call → Token cleanup → Redirect to login

## 🎯 Benefits

- **Scalable Architecture**: Modular services for easy maintenance
- **Type Safety**: Full TypeScript support with interfaces
- **Error Resilience**: Comprehensive error handling and recovery
- **User Experience**: Real-time feedback and smooth interactions
- **Security**: Industry-standard authentication and authorization
- **Maintainability**: Clean code structure with clear separation of concerns

This implementation provides a robust foundation for a secure, scalable Angular application with dynamic menu management and comprehensive API integration.