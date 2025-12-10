<template>
  <div class="min-h-screen bg-surface pt-28 pb-20">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <!-- Back Button -->
      <button
        @click="router.push({ name: 'influencer-home', params: { username: route.params.username } })"
        class="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" /> Back
      </button>

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
        <p class="text-text-muted">
          Last updated: {{ lastUpdated }}
        </p>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12 prose prose-lg max-w-none">
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">1. Introduction</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            My3Pai ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our platform, including our website, mobile applications, 
            and related services (collectively, the "Service").
          </p>
          <p class="text-text-muted leading-relaxed">
            Please read this Privacy Policy carefully. By using our Service, you agree to the collection and use of information 
            in accordance with this policy.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">2. Information We Collect</h2>
          
          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">2.1 Information You Provide</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li><strong>Account Information:</strong> Name, email address, username, password, and profile information</li>
            <li><strong>Payment Information:</strong> Billing address, payment card information (processed securely through third-party processors)</li>
            <li><strong>Content:</strong> Information you post, upload, or share on the platform (for Creators)</li>
            <li><strong>Communications:</strong> Messages, feedback, and correspondence with us or other users</li>
            <li><strong>Preferences:</strong> Cookie preferences, notification settings, and other user preferences</li>
          </ul>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">2.2 Automatically Collected Information</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            When you use our Service, we automatically collect certain information, including:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li><strong>Usage Data:</strong> Pages visited, time spent, features used, and interaction patterns</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
            <li><strong>Location Data:</strong> General location information (with your permission)</li>
            <li><strong>Cookies and Tracking:</strong> Information collected through cookies, web beacons, and similar technologies</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">3. How We Use Your Information</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li>Provide, maintain, and improve our Service</li>
            <li>Process transactions and manage payments</li>
            <li>Send you transactional communications (order confirmations, account updates)</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Personalize your experience and content recommendations</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Detect, prevent, and address technical issues and security threats</li>
            <li>Comply with legal obligations and enforce our terms</li>
            <li>Analyze usage patterns to improve our platform</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">4. Cookie Policy</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            We use cookies and similar tracking technologies to enhance your experience. Our cookie categories include:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li><strong>Strictly Necessary:</strong> Required for basic site functionality (shopping cart, login sessions)</li>
            <li><strong>Functional:</strong> Remember your preferences (e.g., podcast listening history, language settings)</li>
            <li><strong>Analytics:</strong> Help us understand how visitors use our platform</li>
            <li><strong>Marketing:</strong> Deliver relevant advertisements and measure campaign effectiveness</li>
          </ul>
          <p class="text-text-muted leading-relaxed">
            You can manage your cookie preferences through our Cookie Consent banner. Note that disabling certain cookies 
            may limit your ability to use some features of our Service.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">5. Information Sharing and Disclosure</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            We do not sell your personal information. We may share your information in the following circumstances:
          </p>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">5.1 With Creators</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            When you purchase or subscribe to a Creator's content, we share necessary information (name, email, purchase details) 
            to enable the transaction and allow Creators to provide their services.
          </p>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">5.2 Service Providers</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            We share information with third-party service providers who perform services on our behalf, including:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li>Payment processors (e.g., Stripe)</li>
            <li>Cloud hosting and storage providers</li>
            <li>Analytics and marketing service providers</li>
            <li>Customer support platforms</li>
          </ul>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">5.3 Legal Requirements</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            We may disclose information if required by law, court order, or government regulation, or to protect our rights, 
            property, or safety, or that of our users.
          </p>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">5.4 Business Transfers</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">6. Data Security</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure payment processing through PCI-compliant providers</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
          </ul>
          <p class="text-text-muted leading-relaxed">
            However, no method of transmission over the Internet or electronic storage is 100% secure. 
            While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">7. Your Rights and Choices</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
            <li><strong>Restriction:</strong> Request restriction of processing</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
          </ul>
          <p class="text-text-muted leading-relaxed">
            To exercise these rights, please contact us at <a href="mailto:privacy@my3pai.com" class="text-secondary hover:text-secondary/80">privacy@my3pai.com</a>.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">8. Data Retention</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, 
            unless a longer retention period is required or permitted by law. When you delete your account, we will delete or 
            anonymize your personal information, except where we are required to retain it for legal or business purposes.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">9. Children's Privacy</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information 
            from children. If you believe we have collected information from a child, please contact us immediately, and we 
            will take steps to delete such information.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">10. International Data Transfers</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            Your information may be transferred to and processed in countries other than your country of residence. 
            These countries may have data protection laws that differ from those in your country. We take appropriate 
            safeguards to ensure your information is protected in accordance with this Privacy Policy.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">11. Changes to This Privacy Policy</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the 
            new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy 
            Policy periodically.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">12. Contact Us</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
          </p>
          <div class="bg-secondary/5 rounded-lg p-4">
            <p class="text-text-muted mb-2">
              <strong>Email:</strong> <a href="mailto:privacy@my3pai.com" class="text-secondary hover:text-secondary/80">privacy@my3pai.com</a>
            </p>
            <p class="text-text-muted">
              <strong>Data Protection Officer:</strong> <a href="mailto:dpo@my3pai.com" class="text-secondary hover:text-secondary/80">dpo@my3pai.com</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const lastUpdated = new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})
</script>

<style scoped>
.prose ul {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
</style>

