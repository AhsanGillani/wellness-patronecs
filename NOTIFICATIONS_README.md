# Notifications System

This document explains how the notification system works in the Wellness Patronecs platform and how to use it.

## Overview

The notification system allows users to receive personalized notifications based on their role (patient, professional, admin) and specific actions. Notifications are filtered so that users only see notifications relevant to them.

## How It Works

### 1. Notification Types

Notifications can be created in two ways:

- **User-specific notifications**: Sent to a specific user profile
- **Role-based notifications**: Sent to all users with a specific role

### 2. Database Structure

The `notifications` table has the following key fields:

- `recipient_profile_id`: UUID of the specific user (optional)
- `recipient_role`: Role of users to notify (optional)
- `title`: Notification title
- `body`: Notification message
- `link_url`: Optional link to related content
- `data`: JSON data for additional context
- `read_at`: Timestamp when notification was read
- `created_at`: When notification was created

### 3. Row Level Security (RLS)

The system uses RLS policies to ensure users can only see notifications intended for them:

- Users can read notifications where `recipient_profile_id` matches their profile ID
- Users can read notifications where `recipient_role` matches their role
- Admins can manage all notifications

## Usage Examples

### Creating Notifications

#### 1. Using the Hook (Recommended)

```typescript
import {
  useCreateUserNotification,
  useCreateNotification,
} from "@/hooks/useMarketplace";

// For specific users
const createUserNotification = useCreateUserNotification();
await createUserNotification.mutateAsync({
  recipientProfileId: "user-uuid",
  title: "Appointment confirmed",
  body: "Your appointment has been confirmed",
  linkUrl: "/appointments",
});

// For admins creating system notifications
const createNotification = useCreateNotification();
await createNotification.mutateAsync({
  recipientRole: "patient",
  title: "System maintenance",
  body: "Platform will be down for maintenance",
  linkUrl: "/announcements",
});
```

#### 2. Using Helper Functions

```typescript
import { createNotificationHelpers } from "@/hooks/useMarketplace";

// When a patient books an appointment
await createNotificationHelpers.appointmentBooked(
  professionalProfileId,
  patientName,
  serviceName,
  appointmentDate
);

// When a reschedule request is made
await createNotificationHelpers.rescheduleRequested(
  professionalProfileId,
  patientName,
  serviceName,
  oldDate,
  newDate
);

// System notification for all professionals
await createNotificationHelpers.systemNotification(
  "professional",
  "New feature available",
  "Check out our new scheduling system",
  "/features"
);
```

#### 3. Direct Database Insert

```typescript
import { supabase } from "@/integrations/supabase/client";

// Create notification for specific user
await supabase.from("notifications").insert({
  recipient_profile_id: userProfileId,
  recipient_role: null,
  title: "Welcome!",
  body: "Welcome to Wellness Patronecs",
  link_url: "/dashboard",
});

// Create notification for all patients
await supabase.from("notifications").insert({
  recipient_profile_id: null,
  recipient_role: "patient",
  title: "New service available",
  body: "We now offer telehealth consultations",
  link_url: "/services",
});
```

### Reading Notifications

```typescript
import { useNotifications, useNotification } from "@/hooks/useMarketplace";

// Get all notifications for current user
const { data: notifications, isLoading } = useNotifications();

// Get specific notification
const { data: notification } = useNotification(notificationId);
```

### Marking Notifications as Read

```typescript
import { useMarkNotificationRead } from "@/hooks/useMarketplace";

const markRead = useMarkNotificationRead();

// Mark notification as read
await markRead.mutateAsync({ id: notificationId });
```

## Common Notification Scenarios

### 1. Appointment Management

- **New appointment booked**: Notify professional when patient books
- **Appointment confirmed**: Notify patient when professional confirms
- **Appointment cancelled**: Notify both parties
- **Reschedule requests**: Notify professional of patient's request
- **Reschedule response**: Notify patient of professional's decision

### 2. System Notifications

- **Platform updates**: Notify all users
- **Maintenance alerts**: Notify affected users
- **New features**: Notify relevant user roles
- **Security alerts**: Notify all users

### 3. Professional-Patient Communication

- **Service availability**: Notify patients when slots open
- **Message notifications**: Notify when new messages arrive
- **Review requests**: Notify patients to leave reviews
- **Payment confirmations**: Notify both parties

## Admin Interface

Admins can manage notifications through the Admin Dashboard:

1. Navigate to Admin Dashboard
2. Click on "Notifications" tab
3. View all system notifications
4. Create new notifications for specific users or roles
5. Monitor notification delivery and read status

## Best Practices

### 1. Notification Content

- Keep titles concise (under 60 characters)
- Provide clear, actionable messages
- Include relevant links when possible
- Use consistent language and tone

### 2. Timing

- Don't spam users with too many notifications
- Group related notifications when possible
- Consider time zones for global users
- Allow users to control notification frequency

### 3. Security

- Always validate user permissions before creating notifications
- Use RLS policies to ensure data isolation
- Sanitize user input in notification content
- Log notification creation for audit purposes

## Testing

### 1. Create Test Notifications

Use the admin interface to create test notifications:

1. Log in as admin
2. Go to Admin Dashboard > Notifications
3. Click "Create Notification"
4. Fill in the form with test data
5. Verify notifications appear for intended recipients

### 2. Test User Permissions

1. Log in as different user types (patient, professional)
2. Verify they only see relevant notifications
3. Test notification read/unread functionality
4. Verify link navigation works correctly

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check RLS policies and user authentication
2. **Wrong recipients**: Verify `recipient_profile_id` and `recipient_role` values
3. **Permission errors**: Ensure user has proper role and permissions
4. **Database errors**: Check notification table structure and constraints

### Debug Steps

1. Check browser console for errors
2. Verify user authentication status
3. Check database RLS policies
4. Validate notification data structure
5. Test with admin user first

## Future Enhancements

- Push notifications for mobile apps
- Email notification integration
- Notification preferences and settings
- Notification templates and customization
- Advanced filtering and search
- Notification analytics and reporting
- Bulk notification operations
- Scheduled notifications
