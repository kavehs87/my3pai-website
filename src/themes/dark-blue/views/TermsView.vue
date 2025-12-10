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
        <h1 class="text-4xl font-bold text-primary mb-4">Terms of Service</h1>
        <p class="text-text-muted">
          Last updated: {{ lastUpdated }}
        </p>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12 prose prose-lg max-w-none">
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">1. Acceptance of Terms</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            By accessing and using My3Pai ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">2. Description of Service</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            My3Pai is a platform that enables content creators ("Creators") to publish, distribute, and monetize their digital content, 
            including but not limited to:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li>Online courses and masterclasses</li>
            <li>Curated maps and travel guides</li>
            <li>Podcast episodes</li>
            <li>Blog articles and written content</li>
            <li>Digital assets and media files</li>
            <li>Consultation services</li>
          </ul>
          <p class="text-text-muted leading-relaxed">
            Users ("Subscribers") can browse, purchase, and subscribe to access premium content from Creators.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">3. User Accounts</h2>
          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">3.1 Account Creation</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            To use certain features of the Platform, you must register for an account. You agree to:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Maintain the security of your password</li>
            <li>Accept all responsibility for activities that occur under your account</li>
          </ul>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">3.2 Creator Accounts</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            Creators must provide additional information for payment processing and tax purposes. 
            You are responsible for ensuring all content you publish complies with applicable laws and does not infringe on third-party rights.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">4. Content and Intellectual Property</h2>
          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">4.1 Creator Content</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            Creators retain all ownership rights to their content. By publishing content on My3Pai, Creators grant My3Pai a non-exclusive, 
            worldwide, royalty-free license to host, display, and distribute their content through the Platform.
          </p>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">4.2 User-Generated Content</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            Users may not copy, reproduce, distribute, or create derivative works from Creator content without explicit permission. 
            Purchased or subscribed content is for personal use only unless otherwise specified.
          </p>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">4.3 Prohibited Content</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            Content that is illegal, harmful, threatening, abusive, or violates intellectual property rights is prohibited. 
            My3Pai reserves the right to remove such content and terminate accounts.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">5. Payments and Subscriptions</h2>
          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">5.1 Payment Processing</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            Payments are processed through secure third-party payment processors (e.g., Stripe). 
            My3Pai does not store your full payment card information.
          </p>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">5.2 Subscriptions</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            Subscriptions automatically renew unless cancelled. You may cancel your subscription at any time, 
            and access to premium content will continue until the end of the current billing period.
          </p>

          <h3 class="text-xl font-semibold text-primary mb-3 mt-4">5.3 Refunds</h3>
          <p class="text-text-muted leading-relaxed mb-4">
            Refund policies are determined by individual Creators. My3Pai may facilitate refund requests, 
            but final decisions rest with the Creator. Digital content purchases are generally non-refundable 
            unless required by law or specified by the Creator.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">6. Creator Responsibilities</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            Creators are responsible for:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li>Ensuring all content is original or properly licensed</li>
            <li>Complying with all applicable laws and regulations</li>
            <li>Fulfilling any promises or commitments made to Subscribers</li>
            <li>Providing accurate descriptions of their content and services</li>
            <li>Handling customer service inquiries related to their content</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">7. Platform Fees</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            My3Pai charges platform fees on transactions. These fees are deducted from Creator earnings before payout. 
            Fee structures are subject to change with notice to Creators.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">8. Limitation of Liability</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            My3Pai acts as a platform connecting Creators and Subscribers. We are not responsible for:
          </p>
          <ul class="list-disc pl-6 text-text-muted space-y-2 mb-4">
            <li>The quality, accuracy, or legality of Creator content</li>
            <li>Disputes between Creators and Subscribers</li>
            <li>Technical issues beyond our reasonable control</li>
            <li>Loss of data or content</li>
          </ul>
          <p class="text-text-muted leading-relaxed">
            To the maximum extent permitted by law, My3Pai's liability is limited to the amount you paid in the 12 months 
            preceding the claim.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">9. Termination</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            Either party may terminate this agreement at any time. My3Pai reserves the right to suspend or terminate accounts 
            that violate these terms. Upon termination, your right to use the Platform ceases immediately.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">10. Changes to Terms</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            My3Pai reserves the right to modify these terms at any time. Material changes will be communicated to users. 
            Continued use of the Platform after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">11. Governing Law</h2>
          <p class="text-text-muted leading-relaxed mb-4">
            These terms are governed by the laws of the jurisdiction in which My3Pai operates. 
            Any disputes will be resolved through binding arbitration or in the appropriate courts.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold text-primary mb-4">12. Contact Information</h2>
          <p class="text-text-muted leading-relaxed">
            For questions about these Terms of Service, please contact us at 
            <a href="mailto:legal@my3pai.com" class="text-secondary hover:text-secondary/80">legal@my3pai.com</a>.
          </p>
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

