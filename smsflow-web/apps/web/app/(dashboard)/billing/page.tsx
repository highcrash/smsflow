'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Check, Zap, Building2, Rocket, ExternalLink, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PLANS } from '@smsflow/shared';
import { formatDate } from '@/lib/utils';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  messagesUsed: number;
  devicesUsed: number;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  starter: <Zap className="w-5 h-5" />,
  pro: <Rocket className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
};

const PLAN_ORDER = ['starter', 'pro', 'business'];

export default function BillingPage() {
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: sub, isLoading } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: () => apiClient.get('/billing/subscription').then((r) => r.data),
  });

  const portalMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/billing/portal').then((r) => r.data),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  const startCheckout = async (planId: string) => {
    setLoadingCheckout(planId);
    try {
      const { data } = await apiClient.post('/billing/checkout', { planId });
      window.location.href = data.url;
    } catch {
      setLoadingCheckout(null);
    }
  };

  const currentPlanKey = sub?.plan?.toLowerCase() ?? 'starter';
  const currentPlan = PLANS[currentPlanKey as keyof typeof PLANS];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-dark-900">Billing</h1>
        <p className="text-sm text-dark-500 mt-0.5">Manage your subscription and usage.</p>
      </div>

      {/* Current subscription */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-dark-600 uppercase tracking-wide mb-2">
              Current Plan
            </h2>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-dark-900 capitalize">
                  {currentPlanKey}
                </span>
                <Badge variant={sub?.status === 'ACTIVE' ? 'green' : 'warning'}>
                  {sub?.status ?? 'Free'}
                </Badge>
                {sub?.cancelAtPeriodEnd && (
                  <Badge variant="error">Cancels {formatDate(sub.currentPeriodEnd)}</Badge>
                )}
              </div>
            )}
            {sub && !isLoading && (
              <p className="text-xs text-dark-400 mt-1.5">
                Current period: {formatDate(sub.currentPeriodStart)} –{' '}
                {formatDate(sub.currentPeriodEnd)}
              </p>
            )}
          </div>
          {sub?.status === 'ACTIVE' && (
            <button
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 border border-surface-cool rounded-md text-sm font-medium text-dark-700 hover:bg-surface-warm transition-colors shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              {portalMutation.isPending ? 'Opening...' : 'Manage billing'}
            </button>
          )}
        </div>

        {/* Usage meters */}
        {sub && currentPlan && !isLoading && (
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-surface-cool">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-dark-600">Messages</span>
                <span className="text-xs text-dark-500">
                  {sub.messagesUsed.toLocaleString()} /{' '}
                  {(currentPlan.smsLimit as number) === -1 ? '∞' : currentPlan.smsLimit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-surface-warm rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{
                    width:
                      (currentPlan.smsLimit as number) === -1
                        ? '10%'
                        : `${Math.min(100, (sub.messagesUsed / currentPlan.smsLimit) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-dark-600">Devices</span>
                <span className="text-xs text-dark-500">
                  {sub.devicesUsed} / {(currentPlan.deviceLimit as number) === -1 ? '\u221e' : currentPlan.deviceLimit}
                </span>
              </div>
              <div className="h-2 bg-surface-warm rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{
                    width:
                      currentPlan.deviceLimit === -1
                        ? '10%'
                        : `${Math.min(100, (sub.devicesUsed / currentPlan.deviceLimit) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Plan cards */}
      <div>
        <h2 className="text-sm font-semibold text-dark-700 mb-3">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_ORDER.map((planKey) => {
            const plan = PLANS[planKey as keyof typeof PLANS];
            if (!plan) return null;
            const isCurrent = currentPlanKey === planKey;
            const isPopular = planKey === 'pro';

            return (
              <div
                key={planKey}
                className={`relative rounded-xl border-2 p-5 flex flex-col transition-all ${
                  isCurrent
                    ? 'border-brand-500 bg-brand-50'
                    : isPopular
                    ? 'border-brand-300 bg-white shadow-md'
                    : 'border-surface-cool bg-white'
                }`}
              >
                {isPopular && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-600 text-white text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-2.5 mb-3">
                  <span
                    className={`p-2 rounded-lg ${isCurrent ? 'bg-brand-100 text-brand-600' : 'bg-surface-soft text-dark-500'}`}
                  >
                    {PLAN_ICONS[planKey]}
                  </span>
                  <div>
                    <h3 className="font-bold text-dark-900 capitalize">{planKey}</h3>
                    <p className="text-xs text-dark-400">
                      ${plan.price}
                      <span className="text-dark-300">/mo</span>
                    </p>
                  </div>
                </div>

                <ul className="space-y-1.5 mb-5 flex-1">
                  {plan.features.teamMembers > 1 && (
                    <li className="flex items-center gap-2 text-xs text-dark-600">
                      <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      Up to {plan.features.teamMembers} team members
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-xs text-dark-600">
                    <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    {(plan.smsLimit as number) === -1 ? 'Unlimited messages' : `${plan.smsLimit.toLocaleString()} messages/mo`}
                  </li>
                  <li className="flex items-center gap-2 text-xs text-dark-600">
                    <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    {plan.deviceLimit === -1 ? 'Unlimited devices' : `${plan.deviceLimit} device${plan.deviceLimit > 1 ? 's' : ''}`}
                  </li>
                  {plan.features.analytics && (
                    <li className="flex items-center gap-2 text-xs text-dark-600">
                      <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      Advanced analytics
                    </li>
                  )}
                  {plan.features.webhooks && (
                    <li className="flex items-center gap-2 text-xs text-dark-600">
                      <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      Webhook integrations
                    </li>
                  )}
                  {plan.features.apiAccess && (
                    <li className="flex items-center gap-2 text-xs text-dark-600">
                      <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      Full API access
                    </li>
                  )}
                  {plan.features.prioritySupport && (
                    <li className="flex items-center gap-2 text-xs text-dark-600">
                      <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      Priority support
                    </li>
                  )}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2 text-xs font-semibold text-brand-700 bg-brand-100 rounded-md cursor-default"
                  >
                    Current plan
                  </button>
                ) : (
                  <button
                    onClick={() => startCheckout(planKey)}
                    disabled={loadingCheckout === planKey}
                    className={`w-full py-2 text-xs font-semibold rounded-md transition-colors ${
                      isPopular
                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                        : 'border border-surface-cool text-dark-700 hover:bg-surface-warm'
                    } disabled:opacity-60`}
                  >
                    {loadingCheckout === planKey ? 'Redirecting...' : `Upgrade to ${planKey}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise CTA */}
      <Card className="p-5 flex items-start gap-4 bg-surface-soft border-surface-cool">
        <Building2 className="w-8 h-8 text-dark-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-dark-800 mb-0.5">Enterprise</h3>
          <p className="text-xs text-dark-500">
            Need unlimited scale, SLA guarantees, SSO, or custom integrations? Contact us for an
            enterprise plan tailored to your needs.
          </p>
        </div>
        <a
          href="mailto:enterprise@smsflow.io"
          className="px-4 py-2 text-xs font-semibold text-dark-700 border border-surface-cool bg-white hover:bg-surface-warm rounded-md transition-colors shrink-0"
        >
          Contact sales
        </a>
      </Card>

      {/* Important note */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Billing is powered by Stripe. Your payment details are never stored on our servers. All
          plan changes take effect immediately at the start of your next billing cycle.
        </p>
      </div>
    </div>
  );
}
