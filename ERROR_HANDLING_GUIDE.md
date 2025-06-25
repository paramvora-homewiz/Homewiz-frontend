# Enhanced Error Handling & User Feedback System

This guide explains how to use the enhanced error handling system that provides proper error messages, success notifications, loading states, and recovery mechanisms for users.

## Overview

The system replaces basic `alert()` dialogs with modern toast notifications, provides contextual error messages with actionable suggestions, and includes comprehensive loading states and error recovery mechanisms.

## Key Components

### 1. Enhanced Error Handler (`src/lib/error-handler.ts`)

The core error handling service that:
- Categorizes errors by type and severity
- Provides user-friendly error messages with suggestions
- Integrates with toast notifications
- Offers recovery actions

### 2. Toast System (`src/components/ui/toast.tsx`)

Modern toast notifications that support:
- Different types (success, error, warning, info)
- Action buttons
- Auto-dismiss with configurable duration
- Animated appearance/disappearance

### 3. Error Boundary (`src/components/ui/error-boundary.tsx`)

React Error Boundary that:
- Catches unhandled component errors
- Displays user-friendly error pages
- Provides recovery options
- Shows technical details in development

### 4. Loading States (`src/components/ui/loading-states.tsx`)

Comprehensive loading indicators including:
- Spinners and progress bars
- Form loading overlays
- Button loading states
- Operation status indicators

### 5. Error Recovery (`src/lib/error-recovery.ts`)

Advanced recovery mechanisms:
- Automatic retry with exponential backoff
- Offline operation queuing
- Network status monitoring
- Recovery suggestions

## Usage Examples

### Basic Error Handling

```typescript
import { 
  showSuccessMessage, 
  showErrorMessage, 
  handleApiError,
  handleFormSubmissionError 
} from '@/lib/error-handler'

// Show success message
showSuccessMessage(
  'Data Saved',
  'Your information has been saved successfully.',
  {
    action: {
      label: 'View Details',
      onClick: () => navigateToDetails()
    }
  }
)

// Handle API errors
try {
  const result = await apiCall()
  showSuccessMessage('Success', 'Operation completed')
} catch (error) {
  handleApiError(error, {
    additionalInfo: {
      operation: 'save_user_data',
      userId: user.id
    }
  })
}
```

### Form Error Handling

```typescript
// Replace alert() with enhanced error handling
const handleSubmit = async (formData) => {
  try {
    await submitForm(formData)
    showFormSuccessMessage('user', 'saved')
  } catch (error) {
    handleFormSubmissionError(error, {
      additionalInfo: {
        formType: 'user',
        operation: 'create'
      }
    })
  }
}
```

### Loading States

```typescript
import { FormLoadingOverlay, ButtonLoadingState } from '@/components/ui/loading-states'

function MyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  return (
    <>
      <ButtonLoadingState
        isLoading={isLoading}
        loadingText="Saving..."
        icon="save"
        onClick={handleSave}
      >
        Save Changes
      </ButtonLoadingState>

      <FormLoadingOverlay
        isLoading={isLoading}
        operation="Saving Data"
        progress={progress}
        steps={['Validating', 'Processing', 'Saving', 'Complete']}
        currentStep={Math.floor(progress / 25)}
      />
    </>
  )
}
```

### Error Recovery with Retry

```typescript
import ErrorRecovery from '@/lib/error-recovery'

// Automatic retry for network operations
const saveData = async (data) => {
  return ErrorRecovery.withRetry(
    async () => {
      const response = await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Save failed')
      return response.json()
    },
    {
      maxAttempts: 3,
      baseDelay: 1000
    },
    {
      operation: 'save_data',
      dataType: 'user_profile'
    }
  )
}

// Offline support
const saveWithOfflineSupport = async (data) => {
  return ErrorRecovery.withOfflineSupport(
    () => saveData(data),
    data,
    {
      operationId: `save_${data.id}`,
      description: 'Save user profile',
      priority: 'high'
    }
  )
}
```

### Setting Up Error Boundary

```typescript
// Wrap your app or components
import ErrorBoundary from '@/components/ui/error-boundary'
import ErrorToastProvider from '@/components/providers/error-toast-provider'

function App() {
  return (
    <ErrorToastProvider>
      <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
        <YourAppContent />
      </ErrorBoundary>
    </ErrorToastProvider>
  )
}
```

## Error Types and Handling

### Validation Errors
- **When**: Form validation fails
- **User sees**: Specific field errors with suggestions
- **Actions**: Fix highlighted fields, retry submission

### Network Errors
- **When**: Connection issues, timeouts
- **User sees**: Connection problem message with retry option
- **Actions**: Automatic retry, offline queuing

### API Errors
- **When**: Server errors, rate limiting
- **User sees**: Server issue message with appropriate actions
- **Actions**: Retry after delay, contact support

### File Upload Errors
- **When**: File size/format issues, upload failures
- **User sees**: Specific file problem with requirements
- **Actions**: Choose different file, check format/size

### Authentication Errors
- **When**: Session expired, unauthorized access
- **User sees**: Sign-in required message
- **Actions**: Redirect to login, refresh session

## Best Practices

### 1. Always Provide Context
```typescript
handleApiError(error, {
  additionalInfo: {
    operation: 'user_registration',
    step: 'email_verification',
    userId: user.id
  }
})
```

### 2. Use Appropriate Error Types
```typescript
// For form validation
handleValidationError(error)

// For network issues
handleNetworkError(error)

// For file uploads
handleFileUploadError(error)
```

### 3. Show Loading States
```typescript
// Always show loading state for async operations
setIsLoading(true)
try {
  await operation()
} finally {
  setIsLoading(false)
}
```

### 4. Provide Recovery Actions
```typescript
showErrorMessage('Upload Failed', 'File too large', {
  action: {
    label: 'Choose Different File',
    onClick: () => openFileDialog()
  }
})
```

### 5. Use Progress Indicators
```typescript
// For long operations, show progress
const uploadFile = async (file) => {
  setProgress(0)
  // Update progress during upload
  // setProgress(percentage)
}
```

## Migration from alert()

### Before
```typescript
try {
  await saveData()
  alert('Data saved successfully!')
} catch (error) {
  alert('Error saving data. Please try again.')
}
```

### After
```typescript
try {
  await saveData()
  showSuccessMessage('Data Saved', 'Your information has been saved successfully.')
} catch (error) {
  handleFormSubmissionError(error, {
    additionalInfo: { operation: 'save_data' }
  })
}
```

## Demo Page

Visit `/error-handling-demo` to see all features in action:
- Different error types
- Loading states and progress bars
- Success and warning messages
- Error boundary demonstration
- Recovery mechanisms

## Configuration

The system can be configured through the error handler:

```typescript
// Customize retry behavior
ErrorRecovery.withRetry(operation, {
  maxAttempts: 5,
  baseDelay: 2000,
  maxDelay: 30000
})

// Customize toast duration
showSuccessMessage('Title', 'Message', { duration: 3000 })
```

This enhanced error handling system provides a much better user experience by giving clear, actionable feedback and handling errors gracefully with proper recovery mechanisms.
