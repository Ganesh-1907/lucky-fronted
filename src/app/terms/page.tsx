export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 2024</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          {[
            {
              title: "1. Acceptance of Terms",
              content: "By accessing or using Lucky Marketplace, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.",
            },
            {
              title: "2. Description of Service",
              content: "Lucky Marketplace is a multi-vendor event booking platform connecting customers with verified service providers for decorations, events, and celebration services. We act as an intermediary and are not directly responsible for the services provided by vendors.",
            },
            {
              title: "3. User Accounts",
              content: "You must register for an account to book services. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration.",
            },
            {
              title: "4. Booking & Payments",
              content: "Bookings are confirmed only after successful payment of the advance amount. Full payment or balance amount is due as per the payment terms agreed upon during booking. All payments are processed securely through Razorpay.",
            },
            {
              title: "5. Cancellation Policy",
              content: "Cancellations made 48+ hours before the event: Full refund minus processing fee. Cancellations made 24-48 hours before: 50% refund. Cancellations within 24 hours: No refund. Vendor-initiated cancellations: Full refund guaranteed.",
            },
            {
              title: "6. Vendor Responsibilities",
              content: "Vendors are independent service providers. They must deliver services as described in their listings, maintain quality standards, and communicate promptly with customers. Lucky Marketplace reserves the right to suspend vendors who violate these terms.",
            },
            {
              title: "7. Intellectual Property",
              content: "All content on Lucky Marketplace, including logos, design, and text, is protected by intellectual property laws. Vendor-uploaded content remains the property of the respective vendors.",
            },
            {
              title: "8. Limitation of Liability",
              content: "Lucky Marketplace shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform or services booked through it. Our total liability is limited to the amount paid for the specific booking in question.",
            },
            {
              title: "9. Changes to Terms",
              content: "We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or platform notification.",
            },
            {
              title: "10. Contact",
              content: "For questions about these Terms, contact us at legal@luckymarketplace.com or through our Contact page.",
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
