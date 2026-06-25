'use client'
import { useState } from 'react'
import styles from './styles/FAQ.module.css'

const faqs = [
  {
    q: 'Connect your financial data',
    a: 'Install the centfluence mobile app and allow SMS access. centfluence automatically detects transaction messages and converts them into structured financial records.',
  },
  {
    q: 'AI categorizes transactions',
    a: 'Our AI engine identifies merchants, classifies spending categories, detects income, bills, subscriptions, travel expenses, and continuously improves transaction accuracy.',
  },
  {
    q: 'Analyze spending on the website',
    a: 'Login to the centfluence web dashboard to view spending trends, category breakdowns, monthly performance, top merchants, and financial summaries in a larger analytics workspace.',
  },
  {
    q: 'Upload Excel statements',
    a: 'Import Excel transaction data directly into centfluence. The platform automatically analyzes transactions, categorizes expenses, and generates actionable financial insights.',
  },
  {
    q: 'Ask centfluence AI',
    a: 'Use the AI Financial Assistant to ask questions such as "Where am I spending most?", "How much did I save this month?", or "What subscriptions should I review?".',
  },
  {
    q: 'Stay secure',
    a: 'Your financial information is protected with AES-256 encryption, secure authentication, and privacy-first architecture designed for sensitive financial data.',
  },
]

export default function Workflow() {
  const [activeCount, setActiveCount] = useState(1)

  const handleNextStep = () => {
    if (activeCount < faqs.length) {
      setActiveCount((prev) => prev + 1)
    }
  }

  return (
    <section id="workflow" className={styles.faqSection}>
      <div className={styles.faqDotField} />

      <div className={styles.faqInner}>

        {/* Header */}
        <div className={styles.faqHeader}>
          <div className={styles.faqBadge}>
            <span className={styles.faqBadgePip} />
            How It Works
          </div>

          <h2 className={styles.faqHeading}>
            How{' '}
            <span className={styles.faqHeadingAccent}>centfluence works</span>
          </h2>

          <div className={styles.faqRule} />

          <p className={styles.faqSub}>
            From SMS transactions to AI-powered financial intelligence in six simple steps.
          </p>
        </div>

        {/* Horizontal Timeline Flow layout */}
        <div className={styles.faqList}>
          {faqs.map((faq, i) => {
            const isVisible = i < activeCount
            return (
              <div
                key={i}
                className={`${styles.faqItem} ${isVisible ? styles.faqItemVisible : ''}`}
              >
                {/* Connector Graphics */}
                <div className={styles.faqStepTop}>
                  <div className={styles.faqStepNumber}>{i + 1}</div>
                  <div className={styles.faqStepLine} />
                </div>

                {/* Card Container Layout */}
                <div className={styles.faqBody}>
                  <h3 className={styles.faqQuestion}>Step {i + 1}</h3>
                  <p className={styles.faqAnswer}>{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Button Trigger */}
        <div className={styles.faqActionSpace}>
          {activeCount < faqs.length && (
            <button className={styles.faqNextBtn} onClick={handleNextStep}>
              See Next Step →
            </button>
          )}
        </div>

      </div>
    </section>
  )
}