import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheckIcon,
  TruckIcon,
  HeartIcon,
  UsersIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  CheckCircleIcon,
  FacebookIcon,
  InstagramIcon,
  MessageCircleIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageLayout, Breadcrumb } from "../Homepage/sections/NavbarSection/NavbarSection";
import PremiumFooter from "../../components/PremiumFooter";

// ── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    started.current = true;
    const steps = 60;
    const step = target / steps;
    let current = 0;
    ref.current = setInterval(() => {
      current += step;
      if (current >= target) {
        setValue(target);
        if (ref.current) clearInterval(ref.current);
      } else {
        setValue(Math.floor(current));
      }
    }, duration / steps);
  };

  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);
  return { value, start };
}

// ── Data ───────────────────────────────────────────────────────────────────
const values = [
  {
    icon: ShieldCheckIcon,
    title: "Quality Assurance",
    description: "Every product is verified genuine before it reaches our customers — no grey-market goods.",
  },
  {
    icon: TruckIcon,
    title: "Fast Delivery",
    description: "Same-day dispatch within Kathmandu and next-day across Nepal.",
  },
  {
    icon: HeartIcon,
    title: "Customer First",
    description: "Our support team is available 7 days a week to resolve any issue, fast.",
  },
  {
    icon: UsersIcon,
    title: "Expert Team",
    description: "Certified technicians and product specialists guide every purchase decision.",
  },
];

const milestones = [
  { year: "2016", title: "Company Founded", description: "Started as a small electronics retailer with a vision to provide quality products." },
  { year: "2018", title: "Online Expansion", description: "Launched our e-commerce platform to serve customers nationwide." },
  { year: "2020", title: "Brand Partnerships", description: "Established authorized partnerships with Apple, Samsung, and Sony." },
  { year: "2022", title: "Multiple Locations", description: "Expanded to serve customers in both Kathmandu and Pokhara." },
  { year: "2024", title: "50K+ Customers", description: "Reached a milestone of serving over 50,000 satisfied customers." },
];

const leadership = [
  { name: "Sagar Dhakal",  role: "Chairperson",        initials: "SD", description: "Leading Joy Store with vision and strategic direction for sustainable growth." },
  { name: "Guru Sharma",   role: "Managing Director",  initials: "GS", description: "Managing daily operations and ensuring exceptional customer service standards." },
  { name: "Rajesh Thapa",  role: "Head of Sales",      initials: "RT", description: "Expert in customer relations and product expertise across all categories." },
  { name: "Anita Shrestha",role: "Operations Manager", initials: "AS", description: "Managing logistics and ensuring smooth operations across all locations." },
];

// ── Component ──────────────────────────────────────────────────────────────
const AboutUs = () => {
  const navigate = useNavigate();

  const c1 = useCounter(50000);
  const c2 = useCounter(10000);
  const c3 = useCounter(8);
  const c4 = useCounter(98);

  // Trigger counters when stats row enters viewport
  const statsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { c1.start(); c2.start(); c3.start(); c4.start(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { counter: c1, suffix: "+", label: "Happy Customers" },
    { counter: c2, suffix: "+", label: "Products Available" },
    { counter: c3, suffix: "", label: "Years Experience" },
    { counter: c4, suffix: "%", label: "Satisfaction Rate" },
  ];

  return (
    <div>
      <PageLayout>
        <Breadcrumb
          bgColor="black"
          items={[
            { name: "Home", href: "/" },
            { name: "About Us", href: "/about-us", current: true },
          ]}
        />

        <div className="min-h-screen bg-white">

          {/* ── Hero ── */}
          <section className="bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  About Joy Store
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
                  Nepal's Trusted<br />
                  <span className="text-red-500">Electronics Partner</span>
                </h1>
                <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-xl">
                  Since 2016, Joy Store has been bringing authentic electronics, smartphones, and lifestyle products to customers across Nepal — with certified service and unbeatable after-sales support.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/products")}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-all"
                  >
                    Explore Products <ArrowRightIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate("/contact-us")}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-all"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Stats ── */}
          <div ref={statsRef} className="border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
                {stats.map((s, i) => (
                  <div key={i} className="px-8 py-10 text-center">
                    <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 tabular-nums">
                      {s.counter.value.toLocaleString()}{s.suffix}
                    </div>
                    <div className="text-sm text-gray-500 font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Our Story ── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-1 h-6 bg-red-600 rounded-full" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Story</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                  Building Trust Through Quality
                </h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Founded in 2016, Joy Store began with a simple mission: give Nepal access to the world's best electronics at fair prices. What set us apart was our commitment to authenticity, manufacturer warranty, and post-sale support.
                </p>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Today we're authorized retailers for Apple, Samsung, Sony, and many others. Every product is genuine — our expert team ensures that, and our support team backs it up.
                </p>
                <ul className="space-y-3">
                  {["100% Authentic Products", "Official Brand Warranties", "Expert Technical Support", "Nationwide Delivery"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual block */}
              <div className="relative">
                <div className="bg-gray-900 rounded-2xl aspect-[4/3] flex items-end p-8">
                  <div className="space-y-1">
                    <p className="text-white/40 text-xs uppercase tracking-widest">Established</p>
                    <p className="text-white text-5xl font-extrabold">2016</p>
                    <p className="text-white/60 text-sm">Kathmandu, Nepal</p>
                  </div>
                </div>
                <div className="absolute -bottom-5 -right-5 bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-lg flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-900">4.9 / 5 Rating</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Values ── */}
          <section className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-1 h-6 bg-red-600 rounded-full" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Values</span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-10">What We Stand For</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((v) => (
                  <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                      <v.icon className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{v.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Timeline ── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-1 h-6 bg-red-600 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Journey</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-12">Key Milestones</h2>

            <div className="relative">
              {/* Vertical line — hidden on mobile */}
              <div className="hidden md:block absolute left-[120px] top-0 bottom-0 w-px bg-gray-200" />

              <div className="space-y-8">
                {milestones.map((m) => (
                  <div key={m.year} className="flex gap-8 items-start">
                    {/* Year */}
                    <div className="hidden md:flex flex-col items-end w-[120px] flex-shrink-0 pt-1">
                      <span className="text-base font-extrabold text-red-600">{m.year}</span>
                    </div>
                    {/* Dot */}
                    <div className="hidden md:flex items-center justify-center flex-shrink-0 w-3 mt-2">
                      <div className="w-3 h-3 rounded-full bg-red-600 ring-4 ring-red-100" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                      <span className="md:hidden text-xs font-bold text-red-600 mb-1 block">{m.year}</span>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{m.title}</h3>
                      <p className="text-sm text-gray-500">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Leadership ── */}
          <section className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-1 h-6 bg-red-600 rounded-full" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Leadership</span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-10">Our Team</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {leadership.map((m) => (
                  <div key={m.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{m.initials}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{m.name}</h3>
                    <p className="text-xs text-red-600 font-semibold mt-0.5 mb-3">{m.role}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Visit Us ── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-1 h-6 bg-red-600 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Visit Us</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-10">Find Our Stores</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                { icon: MapPinIcon, title: "Kathmandu", lines: ["Tamrakar Complex Shop 9", "Newroad, Kathmandu"] },
                { icon: MapPinIcon, title: "Pokhara",   lines: ["Mahendrapool", "Infront of Sita Bhawan"] },
                { icon: ClockIcon,  title: "Store Hours",lines: ["Mon – Sat: 10 AM – 8 PM", "Sunday: 11 AM – 6 PM"] },
              ].map((info) => (
                <div key={info.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                    <info.icon className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{info.title}</h3>
                  {info.lines.map((l) => <p key={l} className="text-sm text-gray-500">{l}</p>)}
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Contact */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Contact Numbers</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Kathmandu", href: "tel:9851343371", display: "9851343371" },
                    { label: "Pokhara",   href: "tel:9856060163", display: "985-6060163" },
                    { label: "Email",     href: "mailto:support@joystore.com", display: "support@joystore.com" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-400 font-medium">{c.label}</span>
                      <a href={c.href} className="text-xs font-semibold text-gray-900 hover:text-red-600 transition-colors">{c.display}</a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UsersIcon className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Follow Us</h3>
                    <p className="text-xs text-gray-400">Stay updated on deals and new arrivals</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { icon: FacebookIcon,    label: "Facebook",  url: "https://www.facebook.com/share/1936QwaPGq/?mibextid=wwXIfr" },
                    { icon: InstagramIcon,   label: "Instagram", url: "https://www.instagram.com/joy_store_nepal?igsh=MW9uMTVxeGJlam9mZw==" },
                    { icon: MessageCircleIcon,label:"WhatsApp",  url: "https://wa.me/9779851343371" },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <s.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{s.label}</span>
                      <ArrowRightIcon className="w-3 h-3 text-gray-400 ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Experience the Joy Store Difference?
              </h2>
              <p className="text-white/50 text-base mb-8 max-w-xl mx-auto">
                Join thousands of satisfied customers who trust us for their electronics needs.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate("/products")}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-all"
                >
                  Shop Now
                </button>
                <button
                  onClick={() => navigate("/contact-us")}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-all"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </section>

        </div>
      </PageLayout>

      <PremiumFooter />
    </div>
  );
};

export default AboutUs;
