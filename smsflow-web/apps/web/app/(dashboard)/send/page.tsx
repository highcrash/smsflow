'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Clock, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';

const SMS_MAX = 160;
const SMS_MULTI = 153;

function smsCount(body: string) {
  const len = body.length;
  if (len <= SMS_MAX) return 1;
  return Math.ceil(len / SMS_MULTI);
}

const sendSchema = z.object({
  phoneNumber: z.string().min(7, 'Enter a valid phone number'),
  body: z.string().min(1, 'Message body is required').max(1600, 'Message too long'),
  deviceId: z.string().optional(),
  templateId: z.string().optional(),
  scheduledAt: z.string().optional(),
});

type SendForm = z.infer<typeof sendSchema>;

export default function SendPage() {
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => apiClient.get('/devices').then((r) => r.data),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => apiClient.get('/templates').then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SendForm>({
    resolver: zodResolver(sendSchema),
    defaultValues: { body: '' },
  });

  const body = watch('body') || '';
  const segments = smsCount(body);

  const sendMutation = useMutation({
    mutationFn: (data: SendForm) => apiClient.post('/messages/send', data).then((r) => r.data),
    onSuccess: (msg) => {
      setSuccess(`Message sent! ID: ${msg.id}`);
      setError(null);
      reset();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to send message');
      setSuccess(null);
    },
  });

  const handleTemplateChange = (templateId: string) => {
    const tpl = templates.find((t: any) => t.id === templateId);
    if (tpl) setValue('body', tpl.body);
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 border rounded-md text-sm outline-none transition-all ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
        : 'border-surface-cool focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10'
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-dark-900">Send SMS</h1>
        <p className="text-sm text-dark-500 mt-0.5">Send a single SMS message to any phone number.</p>
      </div>

      {success && (
        <div className="rounded-md bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit((d) => sendMutation.mutate(d))} className="space-y-5">
          {/* Phone number */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Phone number
            </label>
            <input
              {...register('phoneNumber')}
              type="tel"
              placeholder="+1 212 555 1234"
              className={`${inputClass(!!errors.phoneNumber)} font-mono`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Template selector */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">
                Template <span className="text-dark-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <select
                  {...register('templateId')}
                  onChange={(e) => {
                    register('templateId').onChange(e);
                    if (e.target.value) handleTemplateChange(e.target.value);
                  }}
                  className={`${inputClass(false)} appearance-none pr-8`}
                >
                  <option value="">Select a template...</option>
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Message body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-dark-700">Message</label>
              <span className={`text-xs ${body.length > SMS_MAX * 3 ? 'text-error' : 'text-dark-400'}`}>
                {body.length} chars · {segments} SMS segment{segments !== 1 ? 's' : ''}
              </span>
            </div>
            <textarea
              {...register('body')}
              rows={4}
              placeholder="Type your message here..."
              className={`${inputClass(!!errors.body)} resize-none`}
            />
            {errors.body && (
              <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>
            )}
          </div>

          {/* Device selector */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">
              Device <span className="text-dark-400 font-normal">(optional — auto-selects if empty)</span>
            </label>
            <div className="relative">
              <select {...register('deviceId')} className={`${inputClass(false)} appearance-none pr-8`}>
                <option value="">Auto-select best device</option>
                {devices
                  .filter((d: any) => d.status === 'ONLINE')
                  .map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.model})
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
            </div>
          </div>

          {/* Schedule toggle */}
          <div>
            <button
              type="button"
              onClick={() => setScheduleEnabled((v) => !v)}
              className="flex items-center gap-2 text-sm text-dark-600 hover:text-dark-900 transition-colors"
            >
              <Clock className="w-4 h-4" />
              {scheduleEnabled ? 'Cancel scheduling' : 'Schedule for later'}
            </button>
            {scheduleEnabled && (
              <div className="mt-2">
                <input
                  {...register('scheduledAt')}
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  className={inputClass(false)}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={sendMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {sendMutation.isPending ? 'Sending...' : scheduleEnabled ? 'Schedule SMS' : 'Send SMS'}
          </button>
        </form>
      </Card>
    </div>
  );
}
