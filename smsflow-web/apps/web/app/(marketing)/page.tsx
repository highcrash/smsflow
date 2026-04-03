import Link from 'next/link';
import {
  Smartphone,
  Zap,
  Globe,
  Shield,
  BarChart3,
  Webhook,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Users,
  Code2,
  Star,
} from 'lucide-react';

/* ── Shared types ── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

/* ── Sub-components ── */
function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, period = '/month', description, features, cta, highlighted }: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-8 ${
        highlighted
          ? 'border-brand-500 bg-brand-600 text-white shadow-2xl scale-105'
          : 'border-gray-200 bg-white text-gray-900'
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-400 text-white text-xs font-bold rounded-full tracking-wide uppercase">
          Most Popular
        </span>
      )}
      <h3 className={`text-lg font-bold mb-1 ${highlighted ? 'text-white' : 'text-gray-900'}`}>
        {name}
      </h3>
      <p className={`text-sm mb-4 ${highlighted ? 'text-brand-200' : 'text-gray-500'}`}>
        {description}
      </p>
      <div className="flex items-end gap-1 mb-6">
        <span className={`text-4xl font-extrabold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
          {price}
        </span>
        {price !== 'Free' && (
          <span className={`text-sm mb-1 ${highlighted ? 'text-brand-200' : 'text-gray-500'}`}>
            {period}
          </span>
        )}
      </div>
      <ul className="space-y-2.5 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <CheckCircle
              className={`w-4 h-4 shrink-0 mt-0.5 ${highlighted ? 'text-brand-300' : 'text-brand-500'}`}
            />
            <span className={highlighted ? 'text-brand-100' : 'text-gray-600'}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`w-full py-3 text-center text-sm font-bold rounded-xl transition-all ${
          highlighted
            ? 'bg-white text-brand-600 hover:bg-brand-50 shadow-md'
            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function Testimonial({ quote, author, role, avatar }: TestimonialProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-5">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">
          {avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{author}</p>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">SMSFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#developers" className="hover:text-gray-900 transition-colors">Developers</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-20 pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-100 rounded-full opacity-30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-200 rounded-full opacity-20 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Turn any Android phone into an SMS gateway
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Send SMS at scale
            <br />
            <span className="text-brand-600">without carrier fees</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            SMSFlow turns your Android devices into a powerful SMS platform. Send transactional
            alerts, marketing campaigns, and OTPs through your own SIM cards — no per-message costs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50"
            >
              Start free — no card needed
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#developers"
              className="flex items-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Code2 className="w-4 h-4" />
              View API docs
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 pt-10 border-t border-gray-100">
            {[
              { value: '50M+', label: 'Messages sent' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '< 2s', label: 'Avg delivery' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Everything you need to send SMS
            </h2>
            <p className="text-base text-gray-500 max-w-xl mx-auto">
              A complete platform for businesses that need reliable, cost-effective messaging at scale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Smartphone className="w-5 h-5" />}
              title="Android Device Gateway"
              description="Pair your Android phones via QR code. Each device acts as a dedicated SMS gateway with real-time status and auto-failover."
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Instant Delivery"
              description="Messages queue intelligently across your device pool. BullMQ-powered processing ensures zero message loss even during spikes."
            />
            <FeatureCard
              icon={<Globe className="w-5 h-5" />}
              title="REST API & SDKs"
              description="Full-featured REST API with scoped API keys. Integrate in minutes with any language or framework using our documented endpoints."
            />
            <FeatureCard
              icon={<Webhook className="w-5 h-5" />}
              title="Webhooks"
              description="Get real-time delivery receipts and inbound SMS pushed to your endpoint. HMAC-signed for security."
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Analytics"
              description="Track delivery rates, device performance, and message volume over time with interactive charts."
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Contact Management"
              description="Import contacts from Excel, organize into groups, and use templates with dynamic {{variables}} for personalized campaigns."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Enterprise Security"
              description="JWT auth, API key scopes, HMAC webhook signatures, rate limiting, and encrypted credentials at rest."
            />
            <FeatureCard
              icon={<MessageSquare className="w-5 h-5" />}
              title="Two-Way Messaging"
              description="Receive inbound SMS directly to your dashboard and webhook endpoints. Full conversation threading coming soon."
            />
            <FeatureCard
              icon={<Code2 className="w-5 h-5" />}
              title="WordPress Plugin"
              description="Native WooCommerce integration sends order confirmations, shipping updates, and OTPs without any custom code."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Up and running in 5 minutes</h2>
            <p className="text-base text-gray-500">No SIM card contracts, no carrier approvals, no per-message fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create an account',
                desc: 'Sign up free. No credit card required for the starter plan.',
              },
              {
                step: '02',
                title: 'Pair your Android phone',
                desc: 'Install our lightweight companion app and scan the QR code. Takes 60 seconds.',
              },
              {
                step: '03',
                title: 'Send your first SMS',
                desc: 'Use the dashboard, REST API, or our WordPress plugin. Your messages go out immediately.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white text-lg font-extrabold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developers */}
      <section id="developers" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-4">
                <Code2 className="w-3.5 h-3.5" />
                Developer-first API
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Integrate SMS in minutes
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Our REST API is fully documented with scoped API keys, rate limiting, and
                HMAC-signed webhook delivery. Works with any stack.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Scoped API keys (per-permission)',
                  'HMAC-signed webhooks',
                  'Paginated REST endpoints',
                  'Real-time Socket.io events',
                  'Excel bulk import',
                  'Template variable rendering',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-brand-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-gray-900 p-6 shadow-2xl">
              <div className="flex gap-1.5 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-sm font-mono text-gray-300 leading-6 overflow-x-auto">
                <code>{`# Send an SMS via the REST API
curl -X POST https://api.smsflow.io/messages \\
  -H "Authorization: Bearer sk_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "+15551234567",
    "body": "Hello {{name}}, your OTP is {{code}}",
    "variables": {
      "name": "Sarah",
      "code": "849201"
    }
  }'

# Response
{
  "id": "msg_01JXXXXXXXXXX",
  "status": "QUEUED",
  "phoneNumber": "+15551234567",
  "createdAt": "2025-01-15T10:30:00Z"
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Trusted by teams worldwide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Testimonial
              quote="We cut our SMS costs by 80% after switching to SMSFlow. The WooCommerce plugin had us live in under an hour."
              author="Maria González"
              role="Head of E-commerce, ShopBright"
              avatar="MG"
            />
            <Testimonial
              quote="The webhook integration is rock-solid. We process 50,000 OTPs a month without a single missed delivery."
              author="David Chen"
              role="CTO, AuthStack"
              avatar="DC"
            />
            <Testimonial
              quote="Finally an SMS gateway that doesn't require a 12-month contract. The API is clean and the dashboard is beautiful."
              author="Priya Nair"
              role="Developer, Notify.io"
              avatar="PN"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Simple, transparent pricing</h2>
            <p className="text-base text-gray-500">No per-message fees. Pay once, send as many SMS as your SIM allows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <PricingCard
              name="Starter"
              price="Free"
              description="For individuals and small projects"
              features={[
                '1 device',
                '500 messages / month',
                '1 API key',
                'Basic analytics',
                'Email support',
              ]}
              cta="Get started free"
            />
            <PricingCard
              name="Pro"
              price="$29"
              description="For growing businesses"
              features={[
                '5 devices',
                '10,000 messages / month',
                'Unlimited API keys',
                'Advanced analytics',
                'Webhooks',
                '3 team members',
                'Priority support',
              ]}
              cta="Start Pro trial"
              highlighted
            />
            <PricingCard
              name="Business"
              price="$99"
              description="For high-volume teams"
              features={[
                'Unlimited devices',
                'Unlimited messages',
                'Unlimited API keys',
                'Advanced analytics',
                'Webhooks + logs',
                '10 team members',
                'Dedicated support',
                'SLA guarantee',
              ]}
              cta="Start Business trial"
            />
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to send your first SMS?
          </h2>
          <p className="text-brand-200 mb-8">
            Join thousands of businesses using SMSFlow. Set up in minutes, no card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 text-sm font-bold rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
          >
            Create your free account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-white">SMSFlow</span>
              </div>
              <p className="text-xs leading-relaxed">
                Turn Android phones into a professional SMS gateway platform.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-3">Product</h4>
              <ul className="space-y-2 text-xs">
                {['Features', 'Pricing', 'Changelog', 'Roadmap'].map((l) => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-3">Developers</h4>
              <ul className="space-y-2 text-xs">
                {['API Reference', 'Webhooks', 'SDKs', 'WordPress Plugin'].map((l) => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-3">Company</h4>
              <ul className="space-y-2 text-xs">
                {['About', 'Blog', 'Privacy', 'Terms'].map((l) => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs">© {new Date().getFullYear()} SMSFlow. All rights reserved.</p>
            <p className="text-xs">Built with Next.js, NestJS, and ♥</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
