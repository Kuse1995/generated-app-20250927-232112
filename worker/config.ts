export const API_RESPONSES = {
  MISSING_MESSAGE: 'Message required',
  INVALID_MODEL: 'Invalid model',
  PROCESSING_ERROR: 'Failed to process message',
  NOT_FOUND: 'Not Found',
  AGENT_ROUTING_FAILED: 'Agent routing failed',
  INTERNAL_ERROR: 'Internal Server Error',
  TWILIO_SIGNATURE_INVALID: 'Twilio signature validation failed',
} as const;
// Email configuration for lead notifications
export const LEAD_NOTIFICATION_EMAIL = 'abkanyanta@gmail.com'; // Replace with the actual recipient email