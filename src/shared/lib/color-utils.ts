/**
 * Returns a Mantine color name for a refund status string.
 */
export function getRefundStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "succeeded":
    case "completed":
      return "green";
    case "pending":
      return "blue";
    case "failed":
      return "red";
    default:
      return "gray";
  }
}

/**
 * Returns a Mantine color name for a subscription / entitlement status string.
 */
export function getSubscriptionStatusColor(status: string): string {
  return status === "active" ? "green" : "orange";
}

/**
 * Returns a Mantine color name for a notification severity string.
 * Covers INFO / WARNING / ERROR / SUCCESS values from the notification API.
 */
export function getNotificationSeverityColor(severity: string): string {
  switch (severity) {
    case "SUCCESS":
      return "green";
    case "WARNING":
      return "yellow";
    case "ERROR":
      return "red";
    case "INFO":
    default:
      return "blue";
  }
}

/**
 * Returns a Mantine color name for a webhook log status string.
 */
export function getWebhookLogStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "PROCESSED":
    case "DELIVERED":
    case "SUCCESS":
      return "green";
    case "FAILED":
      return "red";
    case "PENDING":
      return "blue";
    case "IGNORED":
      return "gray";
    default:
      return "gray";
  }
}

/**
 * Returns a Mantine color name for a CMS page status string.
 */
export function getCmsPageStatusColor(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "green";
    case "PENDING":
      return "yellow";
    case "ARCHIVED":
      return "violet";
    case "DRAFT":
    default:
      return "gray";
  }
}
