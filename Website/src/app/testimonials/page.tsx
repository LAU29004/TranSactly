'use client'
import styles from './test.module.css'

const testimonials = [
  {
    quote: 'Saved more than $150 in a month.',
    body: 'Managing my income from multiple clients used to be chaotic. This app gives me a clean dashboard where I can see everything in one place — a total game changer.',
    name: 'Alex Morgan',
    role: 'Freelance Designer',
    initials: 'AM',
    color: '#F5A800',
  },
  {
    quote: 'Faster payments with QR.',
    body: 'The QR payment feature is a lifesaver. Instead of sending bank details every time, customers just scan and pay instantly. It reduced my payment delays by 80%.',
    name: 'Sofia Ramirez',
    role: 'Small Business Owner',
    initials: 'SR',
    color: '#FFD166',
  },
  {
    quote: 'Smooth card management.',
    body: "I've tried many budgeting apps, but most were either too complicated or ugly. This one is different. The card management system is super clean and intuitive.",
    name: 'Daniel Kim',
    role: 'Product Manager',
    initials: 'DK',
    color: '#F5A800',
  },
  {
    quote: 'Best finance app, period.',
    body: 'The spending insights changed how I think about money. I finally understand my habits and have started saving consistently for the first time in years.',
    name: 'Emma Wilson',
    role: 'Startup Founder',
    initials: 'EW',
    color: '#FFD166',
  },
]

export default function Testimonials() {
  return (
    <section className={styles['testimonials-section']} id="testimonials">
      <div className={styles['t-dot-field']} />

      <div className={styles['testimonials-inner']}>

        {/* Header */}
        <div className={styles['t-header']}>
          <div className={styles['t-badge']}>
            <span className={styles['t-badge-pip']} />
            What Users Say
          </div>

          <h2 className={styles['t-heading']}>
            User reviews &{' '}
            <span className={styles['t-heading-accent']}>feedback</span>
          </h2>

          <div className={styles['t-section-rule']} />

          <p className={styles['t-sub']}>
            See how the app helps people track spending, stay organized, and make
            smarter financial decisions every day.
          </p>
        </div>

        {/* Cards */}
        <div className={styles['t-grid']}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles['t-card']}>

              {/* Quote mark */}
              <div className={styles['t-quote-mark']} style={{ color: t.color, opacity: 0.45 }}>"</div>

              <p className={styles['t-quote-title']}>{t.quote}</p>
              <p className={styles['t-body']}>{t.body}</p>

              {/* Stars */}
              <div className={styles['t-stars']}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg key={si} className={styles['t-star']} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 1l1.4 2.8L10.5 4.3l-2.2 2.1.5 3-2.8-1.5L3.2 9.4l.5-3L1.5 4.3l3.1-.5z" />
                  </svg>
                ))}
              </div>

              {/* Author */}
              <div className={styles['t-author']}>
                <div className={styles['t-avatar']} style={{ background: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <p className={styles['t-name']}>{t.name}</p>
                  <p className={styles['t-role']}>{t.role}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}