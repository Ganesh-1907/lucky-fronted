export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 2024</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          {[
            {
              title: "1. Information We Collect",
              content: "We collect personal information you provide during registration (name, email, phone, city), booking details (address, dates, preferences), and automatically collected data (IP address, device info, browsing behavior).",
            },
            {
              title: "2. How We Use Your Information",
              content: "We use your information to: process bookings, communicate with vendors on your behalf, send booking confirmations and updates, improve our platform, personalize your experience, and send marketing communications (with your consent).",
            },
            {
              title: "3. Information Sharing",
              content: "We share your information with: vendors (to fulfill bookings), payment processors (Razorpay for secure payments), and service providers who help us operate the platform. We never sell your personal data to third parties.",
            },
            {
              title: "4. Data Security",
              content: "We use industry-standard security measures including encrypted data transmission (SSL/TLS), secure password hashing (bcrypt), JWT-based authentication, and regular security audits. Payment data is handled exclusively by Razorpay's PCI-DSS compliant infrastructure.",
            },
            {
              title: "5. Cookies & Tracking",
              content: "We use essential cookies for authentication, preferences for city selection, and analytical cookies to understand usage patterns. You can control cookie preferences through your browser settings.",
            },
            {
              title: "6. Your Rights",
              content: "You have the right to: access your personal data, correct inaccurate data, request deletion of your account, opt out of marketing emails, and download your data. Contact us to exercise these rights.",
            },
            {
              title: "7. Data Retention",
              content: "We retain your account data as long as your account is active. Booking records are kept for 3 years for tax and legal purposes. You can request account deletion at any time.",
            },
            {
              title: "8. Children's Privacy",
              content: "Lucky Marketplace is not intended for children under 18. We do not knowingly collect data from minors. If we learn we have collected such data, we will delete it promptly.",
            },
            {
              title: "9. Changes to This Policy",
              content: "We may update this privacy policy periodically. We will notify you of material changes via email or a prominent notice on our platform.",
            },
            {
              title: "10. Contact Us",
              content: "For privacy-related questions or concerns, email us at privacy@luckymarketplace.com or write to: Lucky Marketplace, Privacy Team, Mumbai, India 400001.",
            },
          ].map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
