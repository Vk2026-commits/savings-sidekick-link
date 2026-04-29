import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Faithnancial'

interface AffiliateWelcomeProps {
  firstName?: string
  referralCode?: string
  referralLink?: string
  commissionRate?: number
  payoutDurationMonths?: number
  portalUrl?: string
}

const AffiliateWelcomeEmail = ({
  firstName,
  referralCode,
  referralLink,
  commissionRate,
  payoutDurationMonths,
  portalUrl,
}: AffiliateWelcomeProps) => {
  const greeting = firstName ? `Congratulations, ${firstName}!` : 'Congratulations!'
  const portal = portalUrl || 'https://budget.faithnancial.com/partner-dashboard'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You're officially a {SITE_NAME} Affiliate Partner</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={brand}>{SITE_NAME}</Heading>
            <Text style={tagline}>Affiliate Program</Text>
          </Section>

          <Heading style={h1}>{greeting}</Heading>
          <Text style={text}>
            You have been chosen to be a part of the <strong>{SITE_NAME} Affiliate
            Program</strong>. We're thrilled to partner with you in helping families
            steward their finances with faith and confidence.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Your Referral Code</Text>
            <Text style={detailValue}>{referralCode || '—'}</Text>

            {referralLink ? (
              <>
                <Text style={detailLabel}>Your Referral Link</Text>
                <Link href={referralLink} style={detailLink}>
                  {referralLink}
                </Link>
              </>
            ) : null}

            {commissionRate ? (
              <>
                <Text style={detailLabel}>Commission Rate</Text>
                <Text style={detailValue}>{commissionRate}%</Text>
              </>
            ) : null}

            {payoutDurationMonths ? (
              <>
                <Text style={detailLabel}>Payout Duration</Text>
                <Text style={detailValue}>
                  {payoutDurationMonths} months per referred customer
                </Text>
              </>
            ) : null}
          </Section>

          <Section style={ctaWrap}>
            <Button href={portal} style={button}>
              Log in to Your Partner Portal
            </Button>
          </Section>

          <Heading style={h2}>What's next</Heading>
          <Text style={text}>
            <strong>1. Sign in.</strong> Use the email this message was sent to and
            either set a password or sign in with Google. Your partner profile is
            already linked.
          </Text>
          <Text style={text}>
            <strong>2. Grab your link.</strong> Your portal has your referral link,
            real-time stats, marketing templates, and payout history.
          </Text>
          <Text style={text}>
            <strong>3. Share with integrity.</strong> Share {SITE_NAME} wherever it
            naturally fits — your church, podcast, blog, social, or community.
          </Text>
          <Text style={text}>
            <strong>4. Get paid.</strong> You earn commission on every paid
            subscription from your referrals during the payout window above.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Just reply to this email — we read every message.
          </Text>
          <Text style={footer}>
            Welcome to the team,<br />
            The {SITE_NAME} Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AffiliateWelcomeEmail,
  subject: 'Welcome to the Faithnancial Affiliate Program 🎉',
  displayName: 'Affiliate welcome',
  previewData: {
    firstName: 'Jordan',
    referralCode: 'AB12CD34',
    referralLink: 'https://budget.faithnancial.com/auth?signup=true&ref=AB12CD34',
    commissionRate: 20,
    payoutDurationMonths: 12,
    portalUrl: 'https://budget.faithnancial.com/partner-dashboard',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const header = { paddingBottom: '8px' }
const brand = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0',
  letterSpacing: '-0.02em',
}
const tagline = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#10b981',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  margin: '4px 0 24px',
}
const h1 = {
  fontSize: '26px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 16px',
  lineHeight: '1.2',
}
const h2 = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '32px 0 12px',
}
const text = {
  fontSize: '15px',
  color: '#334155',
  lineHeight: '1.6',
  margin: '0 0 14px',
}
const detailsBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
}
const detailLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  margin: '12px 0 4px',
}
const detailValue = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0',
  wordBreak: 'break-all' as const,
}
const detailLink = {
  fontSize: '14px',
  color: '#10b981',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}
const ctaWrap = { textAlign: 'center' as const, margin: '28px 0' }
const button = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e2e8f0', margin: '32px 0 20px' }
const footer = { fontSize: '13px', color: '#64748b', margin: '0 0 10px' }
