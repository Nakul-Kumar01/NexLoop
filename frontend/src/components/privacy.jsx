import Footer from "./Footer";


export default function Privacy() {
  return (
    <div>
        <section className="w-full bg-gradient-to-b from-[#0b1220] to-[#060b16] py-20 px-6 text-gray-300">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Privacy Policy
        </h1>

        <p className="mb-6 text-lg">
          At <span className="text-yellow-400 font-semibold">NexLoop</span>, your
          privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your information when you use our coding
          platform.
        </p>

        {/* Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-3">
            1. Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Personal information such as name and email address</li>
            <li>Account and authentication details</li>
            <li>Usage data including solved problems and activity logs</li>
            <li>Technical data like browser type and device information</li>
          </ul>
        </div>

        {/* Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-3">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide and improve NexLoop’s services</li>
            <li>To personalize your learning experience</li>
            <li>To communicate updates, features, or important notices</li>
            <li>To ensure platform security and prevent misuse</li>
          </ul>
        </div>

        {/* Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-3">
            3. Data Security
          </h2>
          <p>
            We implement appropriate security measures to protect your data.
            However, no method of transmission over the internet is 100% secure,
            and we cannot guarantee absolute security.
          </p>
        </div>

        {/* Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-3">
            4. Third-Party Services
          </h2>
          <p>
            NexLoop may use third-party tools and services (such as analytics or
            authentication providers). These services have their own privacy
            policies, and we are not responsible for their practices.
          </p>
        </div>

        {/* Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-3">
            5. Your Rights
          </h2>
          <p>
            You have the right to access, update, or delete your personal
            information. If you have any concerns regarding your data, you can
            contact us at any time.
          </p>
        </div>

        {/* Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-3">
            6. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will
            be reflected on this page with an updated revision date.
          </p>
        </div>

        {/* Contact */}
        <div className="border-t border-gray-700 pt-6">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a
              href="mailto:parmarnakul277@gmail.com"
              className="text-orange-500 font-semibold hover:underline"
            >
              parmarnakul277@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
    <Footer></Footer>
    </div>
  );
}
