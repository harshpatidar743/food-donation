import Link from "next/link";
import "./Footer.css";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Donate Food", href: "/Donation" },
  { label: "Get Food", href: "/GetFood" },
  { label: "About Us", href: "/AboutUs" },
  { label: "Contact Us", href: "/ContactUs" },
];

const resourceLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQs", href: "/#faqs" },
  { label: "Privacy Policy", href: "/#privacy-policy" },
  { label: "Terms of Service", href: "/#terms-of-service" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 21v-7.15h2.4l.36-2.8H13.5V9.27c0-.81.23-1.36 1.39-1.36H16.4V5.4c-.26-.03-1.16-.1-2.2-.1-2.18 0-3.67 1.33-3.67 3.78v1.97H8.1v2.8h2.43V21h2.97Z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.9 3H22l-6.78 7.75L23 21h-6.1l-4.78-6.25L6.65 21H3.54l7.25-8.29L1.33 3h6.24l4.32 5.74L18.9 3Zm-1.07 16.17h1.69L6.66 4.74H4.84l12.99 14.43Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6A5.2 5.2 0 0 1 16.8 22H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm-.18 1.8A3.21 3.21 0 0 0 3.8 7.02v9.96a3.21 3.21 0 0 0 3.22 3.22h9.96a3.21 3.21 0 0 0 3.22-3.22V7.02a3.21 3.21 0 0 0-3.22-3.22H7.02Zm10.77 1.35a1.08 1.08 0 1 1 0 2.16 1.08 1.08 0 0 1 0-2.16ZM12 6.86A5.14 5.14 0 1 1 6.86 12 5.14 5.14 0 0 1 12 6.86Zm0 1.8A3.34 3.34 0 1 0 15.34 12 3.34 3.34 0 0 0 12 8.66Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.94 8.43H3.56V20h3.38V8.43ZM5.25 3A1.97 1.97 0 1 0 5.3 6.94 1.97 1.97 0 0 0 5.25 3Zm15.19 9.93c0-3.5-1.87-5.12-4.37-5.12a3.8 3.8 0 0 0-3.43 1.89V8.43H9.26c.04.84 0 11.57 0 11.57h3.38v-6.46c0-.35.03-.69.13-.94a2.24 2.24 0 0 1 2.1-1.5c1.48 0 2.07 1.13 2.07 2.79V20h3.38v-7.07Z" />
      </svg>
    ),
  },
];

function BrandMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M12 23.25c0 6.63 5.37 12 12 12s12-5.37 12-12v-8.5c0-1.52-1.23-2.75-2.75-2.75h-18.5c-1.52 0-2.75 1.23-2.75 2.75v8.5Z" />
      <path d="M18.25 8.75c0 2.65-1.2 4.8-2.67 4.8s-2.66-2.15-2.66-4.8 1.19-4.79 2.66-4.79 2.67 2.14 2.67 4.79Zm8.42 0c0 2.65-1.2 4.8-2.67 4.8s-2.67-2.15-2.67-4.8 1.2-4.79 2.67-4.79 2.67 2.14 2.67 4.79Zm8.41 0c0 2.65-1.19 4.8-2.66 4.8s-2.67-2.15-2.67-4.8 1.2-4.79 2.67-4.79 2.66 2.14 2.66 4.79Z" />
      <path d="M10.5 20.5h27" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <section className="site-footer__section site-footer__section--brand" aria-labelledby="footer-brand">
            <Link href="/" className="site-footer__brand-link" id="footer-brand">
              <span className="site-footer__brand-mark">
                <BrandMark />
              </span>
              <span className="site-footer__brand-name">FoodMatch</span>
            </Link>
            <p className="site-footer__description">
              Connecting donors, businesses, and NGOs to reduce food waste and help communities.
            </p>
          </section>

          <section className="site-footer__section" aria-labelledby="footer-quick-links">
            <h2 className="site-footer__heading" id="footer-quick-links">Quick Links</h2>
            <nav aria-label="Quick links">
              <ul className="site-footer__links">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="site-footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <section className="site-footer__section" aria-labelledby="footer-resources">
            <h2 className="site-footer__heading" id="footer-resources">Resources</h2>
            <nav aria-label="Resources">
              <ul className="site-footer__links">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="site-footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <section className="site-footer__section" aria-labelledby="footer-contact">
            <h2 className="site-footer__heading" id="footer-contact">Contact</h2>
            <ul className="site-footer__contact-list">
              <li>
                <a href="mailto:foodmatch.in@gmail.com" className="site-footer__link">
                  foodmatch.in@gmail.com
                </a>
              </li>
              <li className="site-footer__meta">India</li>
            </ul>
            <div className="site-footer__socials" aria-label="Social media links">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="site-footer__social-link"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="site-footer__divider" />

        <div className="site-footer__bottom">
          <p className="site-footer__bottom-copy">&copy; 2024-2026 FoodMatch</p>
          <p className="site-footer__bottom-note">Making a difference, one meal at a time.</p>
        </div>
      </div>
    </footer>
  );
}
