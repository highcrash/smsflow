export const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 9,
    smsLimit: 500,
    deviceLimit: 1,
    contactLimit: 500,
    templateLimit: 10,
    webhookLimit: 2,
    teamLimit: 1,
    features: { bulkSms: false, wordpress: false, fullAnalytics: false, analyticsExport: false },
  },
  PRO: {
    id: 'pro',
    name: 'Professional',
    price: 29,
    smsLimit: 5000,
    deviceLimit: 3,
    contactLimit: 5000,
    templateLimit: 50,
    webhookLimit: 10,
    teamLimit: 3,
    features: { bulkSms: true, wordpress: true, fullAnalytics: true, analyticsExport: false },
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 79,
    smsLimit: 25000,
    deviceLimit: 10,
    contactLimit: -1, // unlimited
    templateLimit: -1,
    webhookLimit: -1,
    teamLimit: 10,
    features: { bulkSms: true, wordpress: true, fullAnalytics: true, analyticsExport: true },
  },
} as const;

export type PlanId = keyof typeof PLANS;
