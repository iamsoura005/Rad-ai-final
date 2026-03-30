import { motion, useInView } from "framer-motion";
import {
  Bot,
  Brain,
  FileClock,
  HeartPulse,
  Pill,
  Salad,
  ScanSearch,
  Stethoscope,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";

const features = [
  {
    title: "Medical Image Analysis",
    description: "Upload X-rays, MRIs, CT scans for instant AI analysis.",
    icon: ScanSearch,
    to: "/scan",
  },
  {
    title: "Symptom Checker",
    description: "Describe symptoms and get probable conditions with confidence levels.",
    icon: Stethoscope,
    to: "/symptoms",
  },
  {
    title: "Medicine Information",
    description: "Understand prescriptions, dosage guidance, and side effects.",
    icon: Pill,
    to: "/medicine",
  },
  {
    title: "AI Health Chat",
    description: "Talk to an AI doctor assistant 24/7 for clear health guidance.",
    icon: Bot,
    to: "/chat",
  },
  {
    title: "Health Timeline",
    description: "Track symptoms, consultations, and progress over time.",
    icon: FileClock,
    to: "/history",
  },
  {
    title: "Dietary Guidance",
    description: "Get nutrition-friendly recommendations for better health decisions.",
    icon: Salad,
    to: "/chat",
  },
];

const testimonials = [
  {
    name: "Dr. Maya Rao",
    role: "Pulmonologist",
    quote:
      "RadiologyAI helps me triage image findings quickly with structured summaries that are easy to review.",
  },
  {
    name: "Arjun Sen",
    role: "Patient",
    quote: "The symptom checker gave me a clear urgency direction and helped me act faster.",
  },
  {
    name: "Dr. Lina Park",
    role: "Emergency Consultant",
    quote: "Reliable formatting, simple language, and clinically useful confidence cues.",
  },
];

const stats = [
  { label: "Analyses", value: 50000, suffix: "+" },
  { label: "Languages", value: 12, suffix: "+" },
  { label: "Uptime", value: 99.9, suffix: "%" },
  { label: "Stored Without Consent", value: 0, suffix: "" },
];

function CountStat({ value, suffix, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = value * progress;
      setCurrent(next);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  const display = value % 1 === 0 ? Math.round(current) : current.toFixed(1);

  return (
    <div ref={ref} className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 text-center">
      <p className="text-2xl font-semibold text-cyan-300">
        {display}
        {suffix}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}

function Landing() {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <section className="hero-mesh relative isolate overflow-hidden border-b border-gray-800">
        <div className="mx-auto flex min-h-[85vh] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <motion.h1
            className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            Your AI Doctor, Anytime, Anywhere
          </motion.h1>
          <p className="mt-5 max-w-3xl text-lg text-gray-300">
            AI-powered radiology analysis, symptom checking, medicine info, and health guidance
            all in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/scan"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
            >
              Analyze Medical Image →
            </Link>
            <Link
              to="/symptoms"
              className="rounded-xl border border-cyan-500/40 px-6 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/10"
            >
              Check Symptoms
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2 text-xs text-gray-300">
            {[
              "🔒 Privacy First",
              "⚡ Instant Analysis",
              "🧠 AI Powered",
              "🏥 Clinically Structured",
            ].map((item) => (
              <span key={item} className="rounded-full border border-gray-700 bg-gray-900/60 px-3 py-1">
                {item}
              </span>
            ))}
          </div>
        </div>

        <svg className="ecg-line absolute bottom-0 left-0 w-full" viewBox="0 0 1200 80" fill="none">
          <path
            d="M0 40 H150 L190 40 L210 10 L245 70 L280 40 H420 L455 40 L470 20 L500 60 L540 40 H1200"
            stroke="url(#ecgGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="ecgGradient" x1="0" y1="0" x2="1200" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-white">What We Offer</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="group rounded-2xl border border-gray-800 bg-gray-900 p-5 transition hover:border-cyan-500/40"
              >
                <Icon className="h-5 w-5 text-cyan-300" />
                <h3 className="mt-3 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{feature.description}</p>
                <Link className="mt-4 inline-block text-sm font-medium text-cyan-300" to={feature.to}>
                  Get Started →
                </Link>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-white">How It Works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            "Upload or Describe",
            "AI Analyzes",
            "Get Structured Report",
          ].map((step, idx) => (
            <div key={step} className="relative rounded-2xl border border-gray-800 bg-gray-900 p-5 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-cyan-500/20 text-cyan-300">
                {idx + 1}
              </div>
              <p className="mt-3 text-sm font-medium text-gray-200">{step}</p>
              {idx < 2 && (
                <span className="absolute right-[-30px] top-1/2 hidden h-0.5 w-[60px] -translate-y-1/2 border-t border-dashed border-cyan-500/50 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-3 rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-3 text-center text-sm text-cyan-100">
          50,000+ Analyses | 12+ Languages | 99.9% Uptime | 0 Data Stored Without Consent
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <CountStat key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-white">Testimonials</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="mb-3 flex items-center gap-1 text-yellow-300">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={`${item.name}-${idx}`} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-gray-300">"{item.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-500/20 text-cyan-300">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner text="⚠️ This platform provides AI-assisted insights only. Always consult a licensed medical professional for diagnosis and treatment." />
      </section>
    </motion.div>
  );
}

export default Landing;
