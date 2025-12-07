<template>
  <div class="creator-settings">
    <div class="container">
      <div class="settings-intro">
        <h1>Creator Profile</h1>
        <p>Manage your public influencer profile. These details appear on your public profile page.</p>
      </div>

      <!-- Intro Video Section -->
      <div class="settings-section intro-video-section">
        <div class="section-header">
          <h2><i class="fas fa-video"></i> Intro Video</h2>
        </div>
        
        <p class="section-description">
          Add a short video introduction (max 60 seconds) to make your profile stand out.
        </p>
        
        <div v-if="introVideo.loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="introVideo.url" class="video-preview">
          <div class="video-container">
            <video 
              :src="introVideo.url" 
              :poster="introVideo.thumbnail"
              controls
              playsinline
              class="preview-video"
            />
          </div>
          <div class="video-info">
            <div class="video-status" :class="introVideo.status">
              <i :class="getVideoStatusIcon(introVideo.status)"></i>
              {{ formatVideoStatus(introVideo.status) }}
            </div>
            <span v-if="introVideo.duration" class="video-duration">
              {{ formatDuration(introVideo.duration) }}
            </span>
          </div>
          <div class="video-actions">
            <button class="action-btn replace" @click="triggerVideoUpload">
              <i class="fas fa-sync-alt"></i> Replace
            </button>
            <button class="action-btn delete" @click="deleteIntroVideo" :disabled="introVideo.deleting">
              <i :class="introVideo.deleting ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
              {{ introVideo.deleting ? 'Deleting...' : 'Remove' }}
            </button>
          </div>
        </div>
        
        <div v-else class="upload-area" @click="triggerVideoUpload" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.prevent="onDrop" :class="{ 'drag-over': isDragging }">
          <div class="upload-content">
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h3>Upload Intro Video</h3>
            <p>Drag and drop or click to upload</p>
            <span class="upload-hint">MP4, MOV or WebM • Max 100MB • Max 60 seconds</span>
          </div>
        </div>
        
        <!-- Hidden file input outside the clickable area -->
        <input
          ref="videoInputRef"
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          class="file-input-hidden"
          @change="handleVideoSelect"
        />
        
        <div v-if="introVideo.uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: introVideo.progress + '%' }"></div>
          </div>
          <span class="progress-text">Uploading... {{ introVideo.progress }}%</span>
        </div>
      </div>

      <!-- Intro Picture Section -->
      <div class="settings-section intro-picture-section">
        <div class="section-header">
          <h2><i class="fas fa-image"></i> Intro Picture</h2>
        </div>
        
        <p class="section-description">
          Upload a portrait picture (9:16 aspect ratio) to display as your intro thumbnail. This will be shown as a fallback if no video is uploaded or while the video loads.
        </p>
        
        <ThumbnailUpload
          label="Portrait Picture"
          placeholder="Upload portrait picture (9:16)"
          :model-value="introPicture.file || introVideo.thumbnail"
          :aspect-ratio="9 / 16"
          :output-width="720"
          @update:model-value="handleIntroPictureChange"
          @change="handleIntroPictureChange"
        />
      </div>

      <!-- Logo Section -->
      <div class="settings-section logo-section">
        <div class="section-header">
          <h2><i class="fas fa-image"></i> Logo</h2>
        </div>
        
        <p class="section-description">
          Upload your logo to display in the navigation/header section of your public profile page. Recommended square aspect ratio (1:1) for best display.
        </p>
        
        <div v-if="logo.loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="logo.url" class="logo-preview">
          <div class="logo-container">
            <img :src="logo.url" alt="Logo" class="preview-logo" />
          </div>
          <div class="logo-actions">
            <button class="action-btn replace" @click="triggerLogoUpload">
              <i class="fas fa-sync-alt"></i> Replace
            </button>
            <button class="action-btn delete" @click="deleteLogo" :disabled="logo.deleting">
              <i :class="logo.deleting ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
              {{ logo.deleting ? 'Deleting...' : 'Remove' }}
            </button>
          </div>
        </div>
        
        <div v-else class="upload-area" @click="triggerLogoUpload" @dragover.prevent="onLogoDragOver" @dragleave="onLogoDragLeave" @drop.prevent="onLogoDrop" :class="{ 'drag-over': isLogoDragging }">
          <div class="upload-content">
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h3>Upload Logo</h3>
            <p>Drag and drop or click to upload</p>
            <span class="upload-hint">JPEG, PNG, WebP or SVG • Max 2MB • Recommended 1:1 aspect ratio</span>
          </div>
        </div>
        
        <!-- Hidden file input -->
        <input
          ref="logoInputRef"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
          class="file-input-hidden"
          @change="handleLogoSelect"
        />
        
        <div v-if="logo.uploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: logo.progress + '%' }"></div>
          </div>
          <span class="progress-text">Uploading... {{ logo.progress }}%</span>
        </div>
      </div>

      <!-- Profile Theme Selector -->
      <ProfileThemeSelector
        :current-theme="profileTheme"
        :profile-username="profileUsername"
        @theme-changed="handleThemeChanged"
      />

      <!-- Social Links Section -->
      <div class="settings-section">
        <div class="section-header">
          <h2><i class="fas fa-share-alt"></i> Social Links</h2>
          <button class="add-btn" @click="openSocialModal()">
            <i class="fas fa-plus"></i> Add Social
          </button>
        </div>
        
        <div v-if="loading.socials" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="socials.length === 0" class="empty-state">
          <i class="fab fa-instagram"></i>
          <p>No social links added yet</p>
        </div>
        
        <div v-else class="items-list">
          <div v-for="social in socials" :key="social.id" class="list-item">
            <div class="item-icon" :class="social.platform">
              <i :class="getPlatformIcon(social.platform)"></i>
            </div>
            <div class="item-content">
              <span class="item-title">{{ formatPlatform(social.platform) }}</span>
              <span class="item-subtitle">{{ social.handle || social.url }}</span>
            </div>
            <div class="item-actions">
              <button class="icon-btn" @click="openSocialModal(social)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="icon-btn delete" @click="deleteSocial(social.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Languages Section -->
      <div class="settings-section">
        <div class="section-header">
          <h2><i class="fas fa-language"></i> Languages</h2>
          <button class="add-btn" @click="openLanguageModal()">
            <i class="fas fa-plus"></i> Add Language
          </button>
        </div>
        
        <div v-if="loading.languages" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="languages.length === 0" class="empty-state">
          <i class="fas fa-globe"></i>
          <p>No languages added yet</p>
        </div>
        
        <div v-else class="items-list">
          <div v-for="lang in languages" :key="lang.id" class="list-item">
            <div class="item-icon language">
              <span class="flag">{{ getLanguageFlag(lang.languageCode) }}</span>
            </div>
            <div class="item-content">
              <span class="item-title">{{ lang.languageName }}</span>
              <span class="item-subtitle">{{ formatLevel(lang.level) }}</span>
            </div>
            <div class="item-actions">
              <button class="icon-btn" @click="openLanguageModal(lang)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="icon-btn delete" @click="deleteLanguage(lang.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Skills Section -->
      <div class="settings-section">
        <div class="section-header">
          <h2><i class="fas fa-tools"></i> Skills</h2>
          <button class="add-btn" @click="openSkillModal()">
            <i class="fas fa-plus"></i> Add Skill
          </button>
        </div>
        
        <div v-if="loading.skills" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="skills.length === 0" class="empty-state">
          <i class="fas fa-star"></i>
          <p>No skills added yet</p>
        </div>
        
        <div v-else class="tags-list">
          <div v-for="skill in skills" :key="skill.id" class="tag-item">
            <span>{{ skill.skill }}</span>
            <button class="tag-delete" @click="deleteSkill(skill.id)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Certifications Section -->
      <div class="settings-section">
        <div class="section-header">
          <h2><i class="fas fa-certificate"></i> Certifications</h2>
          <button class="add-btn" @click="openCertificationModal()">
            <i class="fas fa-plus"></i> Add Certification
          </button>
        </div>
        
        <div v-if="loading.certifications" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="certifications.length === 0" class="empty-state">
          <i class="fas fa-award"></i>
          <p>No certifications added yet</p>
        </div>
        
        <div v-else class="items-list">
          <div v-for="cert in certifications" :key="cert.id" class="list-item">
            <div class="item-icon cert">
              <i class="fas fa-award"></i>
            </div>
            <div class="item-content">
              <span class="item-title">{{ cert.name }}</span>
              <span v-if="cert.issuer" class="item-subtitle">{{ cert.issuer }}</span>
            </div>
            <div class="item-actions">
              <button class="icon-btn" @click="openCertificationModal(cert)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="icon-btn delete" @click="deleteCertification(cert.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- External Links Section -->
      <div class="settings-section">
        <div class="section-header">
          <h2><i class="fas fa-external-link-alt"></i> External Links</h2>
          <button class="add-btn" @click="openExternalLinkModal()">
            <i class="fas fa-plus"></i> Add Link
          </button>
        </div>
        
        <div v-if="loading.externalLinks" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        
        <div v-else-if="externalLinks.length === 0" class="empty-state">
          <i class="fas fa-link"></i>
          <p>No external links added yet</p>
        </div>
        
        <div v-else class="items-list">
          <div v-for="link in externalLinks" :key="link.id" class="list-item">
            <div class="item-icon link">
              <i class="fas fa-link"></i>
            </div>
            <div class="item-content">
              <span class="item-title">{{ link.title }}</span>
              <span class="item-subtitle">{{ link.platform }} {{ link.rating ? `• ★ ${link.rating}` : '' }}</span>
            </div>
            <div class="item-actions">
              <button class="icon-btn" @click="openExternalLinkModal(link)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="icon-btn delete" @click="deleteExternalLink(link.id)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Social Modal -->
    <transition name="fade">
      <div v-if="modals.social.visible" class="modal-overlay" @click.self="closeSocialModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modals.social.editId ? 'Edit' : 'Add' }} Social Link</h3>
            <button class="close-btn" @click="closeSocialModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="saveSocial">
            <div class="form-group">
              <label>Platform</label>
              <select v-model="modals.social.form.platform" class="form-input" required>
                <option value="">Select platform...</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter/X</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>URL</label>
              <input v-model="modals.social.form.url" type="url" class="form-input" placeholder="https://..." required />
            </div>
            <div class="form-group">
              <label>Handle (optional)</label>
              <input v-model="modals.social.form.handle" type="text" class="form-input" placeholder="@username" />
            </div>
            <div class="modal-actions">
              <button type="button" class="modal-btn ghost" @click="closeSocialModal">Cancel</button>
              <button type="submit" class="modal-btn primary" :disabled="modals.social.saving">
                <span v-if="modals.social.saving"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>{{ modals.social.editId ? 'Update' : 'Add' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Language Modal -->
    <transition name="fade">
      <div v-if="modals.language.visible" class="modal-overlay" @click.self="closeLanguageModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modals.language.editId ? 'Edit' : 'Add' }} Language</h3>
            <button class="close-btn" @click="closeLanguageModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="saveLanguage">
            <div class="form-group">
              <label>Language</label>
              <select v-model="modals.language.form.languageCode" class="form-input" required @change="onLanguageSelect">
                <option value="">Select language...</option>
                <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
                  {{ lang.flag }} {{ lang.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Proficiency Level</label>
              <select v-model="modals.language.form.level" class="form-input" required>
                <option value="">Select level...</option>
                <option value="native">Native</option>
                <option value="fluent">Fluent</option>
                <option value="conversational">Conversational</option>
                <option value="basic">Basic</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="modal-btn ghost" @click="closeLanguageModal">Cancel</button>
              <button type="submit" class="modal-btn primary" :disabled="modals.language.saving">
                <span v-if="modals.language.saving"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>{{ modals.language.editId ? 'Update' : 'Add' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Skill Modal -->
    <transition name="fade">
      <div v-if="modals.skill.visible" class="modal-overlay" @click.self="closeSkillModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Add Skill</h3>
            <button class="close-btn" @click="closeSkillModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="saveSkill">
            <div class="form-group">
              <label>Skill</label>
              <input v-model="modals.skill.form.skill" type="text" class="form-input" placeholder="e.g., Itinerary Design" required maxlength="255" />
            </div>
            <div class="modal-actions">
              <button type="button" class="modal-btn ghost" @click="closeSkillModal">Cancel</button>
              <button type="submit" class="modal-btn primary" :disabled="modals.skill.saving">
                <span v-if="modals.skill.saving"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>Add</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Certification Modal -->
    <transition name="fade">
      <div v-if="modals.certification.visible" class="modal-overlay" @click.self="closeCertificationModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modals.certification.editId ? 'Edit' : 'Add' }} Certification</h3>
            <button class="close-btn" @click="closeCertificationModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="saveCertification">
            <div class="form-group">
              <label>Certification Name</label>
              <input v-model="modals.certification.form.name" type="text" class="form-input" placeholder="e.g., Certified Hiking Guide" required maxlength="255" />
            </div>
            <div class="form-group">
              <label>Issuer (optional)</label>
              <input v-model="modals.certification.form.issuer" type="text" class="form-input" placeholder="e.g., Swiss Alpine Club" maxlength="255" />
            </div>
            <div class="form-group">
              <label>Issue Date (optional)</label>
              <input v-model="modals.certification.form.issuedAt" type="date" class="form-input" />
            </div>
            <div class="modal-actions">
              <button type="button" class="modal-btn ghost" @click="closeCertificationModal">Cancel</button>
              <button type="submit" class="modal-btn primary" :disabled="modals.certification.saving">
                <span v-if="modals.certification.saving"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>{{ modals.certification.editId ? 'Update' : 'Add' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- External Link Modal -->
    <transition name="fade">
      <div v-if="modals.externalLink.visible" class="modal-overlay" @click.self="closeExternalLinkModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ modals.externalLink.editId ? 'Edit' : 'Add' }} External Link</h3>
            <button class="close-btn" @click="closeExternalLinkModal"><i class="fas fa-times"></i></button>
          </div>
          <form class="modal-body" @submit.prevent="saveExternalLink">
            <div class="form-group">
              <label>Platform</label>
              <input v-model="modals.externalLink.form.platform" type="text" class="form-input" placeholder="e.g., GetYourGuide, Airbnb" required maxlength="255" />
            </div>
            <div class="form-group">
              <label>Title</label>
              <input v-model="modals.externalLink.form.title" type="text" class="form-input" placeholder="e.g., Certified Guide" required maxlength="255" />
            </div>
            <div class="form-group">
              <label>Subtitle (optional)</label>
              <input v-model="modals.externalLink.form.subtitle" type="text" class="form-input" placeholder="e.g., Book my official tours" maxlength="255" />
            </div>
            <div class="form-group">
              <label>URL</label>
              <input v-model="modals.externalLink.form.url" type="url" class="form-input" placeholder="https://..." required />
            </div>
            <div class="form-group">
              <label>Rating (optional)</label>
              <input v-model.number="modals.externalLink.form.rating" type="number" class="form-input" min="0" max="5" step="0.1" placeholder="4.9" />
            </div>
            <div class="modal-actions">
              <button type="button" class="modal-btn ghost" @click="closeExternalLinkModal">Cancel</button>
              <button type="submit" class="modal-btn primary" :disabled="modals.externalLink.saving">
                <span v-if="modals.externalLink.saving"><i class="fas fa-spinner fa-spin"></i></span>
                <span v-else>{{ modals.externalLink.editId ? 'Update' : 'Add' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import api from '@/services/api'
import toast from '@/utils/toast'
import ProfileThemeSelector from './ProfileThemeSelector.vue'
import ThumbnailUpload from '../../map-builder/components/poi-form/components/ThumbnailUpload.vue'

export default {
  name: 'ProfileCreatorSettings',
  components: {
    ProfileThemeSelector,
    ThumbnailUpload
  },
  data() {
    return {
      socials: [],
      languages: [],
      skills: [],
      certifications: [],
      externalLinks: [],
      introVideo: {
        url: null,
        thumbnail: null,
        status: null,
        duration: null,
        loading: false,
        uploading: false,
        deleting: false,
        progress: 0,
        pollInterval: null
      },
      introPicture: {
        file: null,
        uploading: false
      },
      logo: {
        url: null,
        loading: false,
        uploading: false,
        deleting: false,
        progress: 0
      },
      isDragging: false,
      isLogoDragging: false,
      loading: {
        socials: false,
        languages: false,
        skills: false,
        certifications: false,
        externalLinks: false
      },
      modals: {
        social: {
          visible: false,
          editId: null,
          saving: false,
          form: { platform: '', url: '', handle: '' }
        },
        language: {
          visible: false,
          editId: null,
          saving: false,
          form: { languageCode: '', languageName: '', level: '' }
        },
        skill: {
          visible: false,
          saving: false,
          form: { skill: '' }
        },
        certification: {
          visible: false,
          editId: null,
          saving: false,
          form: { name: '', issuer: '', issuedAt: '' }
        },
        externalLink: {
          visible: false,
          editId: null,
          saving: false,
          form: { platform: '', title: '', subtitle: '', url: '', rating: null }
        }
      },
      availableLanguages: [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'it', name: 'Italian', flag: '🇮🇹' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
        { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
        { code: 'pl', name: 'Polish', flag: '🇵🇱' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
        { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
        { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
        { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
        { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
        { code: 'da', name: 'Danish', flag: '🇩🇰' },
        { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
        { code: 'cs', name: 'Czech', flag: '🇨🇿' },
        { code: 'el', name: 'Greek', flag: '🇬🇷' },
        { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
        { code: 'th', name: 'Thai', flag: '🇹🇭' },
        { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
        { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
        { code: 'ms', name: 'Malay', flag: '🇲🇾' },
        { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' }
      ],
      profileTheme: 'modern',
      profileUsername: null
    }
  },
  async mounted() {
    await this.loadProfileData()
    await this.loadAllData()
    // Start polling if video is currently processing
    if (this.introVideo.status === 'processing') {
      this.startVideoStatusPolling()
    }
  },
  methods: {
    async loadProfileData() {
      try {
        const result = await api.getProfile()
        if (result.success) {
          const user = result.data?.data?.user || result.data?.user || {}
          this.profileTheme = user.theme || 'modern'
          this.profileUsername = user.username || null
        }
      } catch (err) {
        console.error('Failed to load profile data:', err)
      }
    },
    handleThemeChanged(themeId) {
      this.profileTheme = themeId
    },
  beforeUnmount() {
    // Clean up polling interval
    this.stopVideoStatusPolling()
  },
    async loadAllData() {
      await Promise.all([
        this.loadIntroVideo(),
        this.loadLogo(),
        this.loadSocials(),
        this.loadLanguages(),
        this.loadSkills(),
        this.loadCertifications(),
        this.loadExternalLinks()
      ])
    },

    // Intro Video
    async loadIntroVideo() {
      this.introVideo.loading = true
      try {
        // Try dedicated influencer settings endpoint first (silently fail if not available)
        let videoData = null
        
        try {
          const settingsResult = await api.getInfluencerSettings()
          if (settingsResult.success) {
            const data = settingsResult.data?.data || settingsResult.data || {}
            videoData = {
              url: data.introVideoUrl,
              thumbnail: data.introVideoThumbnail,
              status: data.introVideoStatus,
              duration: data.introVideoDuration
            }
          }
        } catch {
          // Silently continue - endpoint may not exist yet
        }
        
        // Fallback to profile endpoint if no video data yet
        if (!videoData?.url) {
          const profileResult = await api.getProfile()
          if (profileResult.success) {
            const user = profileResult.data?.data?.user || profileResult.data?.user || profileResult.data?.data || {}
            
            // Check multiple possible field locations
            videoData = {
              url: user.introVideoUrl || user.intro_video_url,
              thumbnail: user.introVideoThumbnail || user.intro_video_thumbnail,
              status: user.introVideoStatus || user.intro_video_status,
              duration: user.introVideoDuration || user.intro_video_duration
            }
            
            // If still no video data and we have username, try public influencer profile
            if (!videoData.url && user.username) {
              try {
                const influencerResult = await api.getInfluencerProfile(user.username)
                if (influencerResult.success) {
                  const influencer = influencerResult.data?.data || influencerResult.data || {}
                  videoData = {
                    url: influencer.introVideoUrl || influencer.intro_video_url,
                    thumbnail: influencer.introVideoThumbnail || influencer.intro_video_thumbnail,
                    status: influencer.introVideoStatus || influencer.intro_video_status || 'ready',
                    duration: influencer.introVideoDuration || influencer.intro_video_duration
                  }
                }
              } catch (e) {
                console.log('Influencer profile not available')
              }
            }
          }
        }
        
        // Apply the video data
        if (videoData) {
          this.introVideo.url = videoData.url || null
          this.introVideo.thumbnail = videoData.thumbnail || null
          this.introVideo.status = videoData.status || null
          this.introVideo.duration = videoData.duration || null
          
          // Initialize intro picture with existing thumbnail
          if (videoData.thumbnail) {
            this.introPicture.file = videoData.thumbnail
          }
        }
      } catch (err) {
        console.error('Failed to load intro video:', err)
      } finally {
        this.introVideo.loading = false
      }
    },
    
    triggerVideoUpload() {
      this.$refs.videoInputRef?.click()
    },
    
    async handleVideoSelect(event) {
      const file = event.target.files?.[0]
      if (!file) return
      await this.uploadVideo(file)
      // Reset input so the same file can be selected again
      event.target.value = ''
    },
    
    async uploadVideo(file) {
      // Validate file size (100MB max)
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error('Video file must be less than 100MB')
        return
      }
      
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload an MP4, MOV, or WebM video')
        return
      }
      
      this.introVideo.uploading = true
      this.introVideo.progress = 0
      
      try {
        // Simulate progress (real progress would come from XHR)
        const progressInterval = setInterval(() => {
          if (this.introVideo.progress < 90) {
            this.introVideo.progress += 10
          }
        }, 500)
        
        const result = await api.uploadIntroVideo(file)
        
        clearInterval(progressInterval)
        this.introVideo.progress = 100
        
        if (result.success) {
          const data = result.data?.data || result.data
          this.introVideo.url = data.introVideoUrl
          this.introVideo.thumbnail = data.introVideoThumbnail
          this.introVideo.status = data.introVideoStatus
          this.introVideo.duration = data.introVideoDuration
          toast.success('Video uploaded! Processing...')
          
          // Start polling if video is still processing
          if (this.introVideo.status === 'processing') {
            this.startVideoStatusPolling()
          }
        } else {
          toast.error(result.error || 'Failed to upload video')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to upload video')
      } finally {
        this.introVideo.uploading = false
        this.introVideo.progress = 0
      }
    },
    
    startVideoStatusPolling() {
      // Clear any existing polling
      this.stopVideoStatusPolling()
      
      // Poll every 3 seconds
      this.introVideo.pollInterval = setInterval(async () => {
        try {
          await this.loadIntroVideo()
          
          // Stop polling if status is no longer processing
          if (this.introVideo.status !== 'processing') {
            this.stopVideoStatusPolling()
            
            if (this.introVideo.status === 'ready') {
              toast.success('Video processing complete!')
            } else if (this.introVideo.status === 'failed') {
              toast.error('Video processing failed. Please try uploading again.')
            }
          }
        } catch (err) {
          console.error('Error polling video status:', err)
        }
      }, 3000)
    },
    
    stopVideoStatusPolling() {
      if (this.introVideo.pollInterval) {
        clearInterval(this.introVideo.pollInterval)
        this.introVideo.pollInterval = null
      }
    },
    
    async deleteIntroVideo() {
      if (!confirm('Remove your intro video?')) return
      
      this.introVideo.deleting = true
      try {
        const result = await api.deleteIntroVideo()
        if (result.success) {
          this.introVideo.url = null
          this.introVideo.thumbnail = null
          this.introVideo.status = null
          this.introVideo.duration = null
          toast.success('Video removed')
        } else {
          toast.error(result.error || 'Failed to remove video')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.introVideo.deleting = false
      }
    },
    
    // Intro Picture (Portrait Thumbnail)
    async handleIntroPictureChange(file) {
      if (!file) {
        // If file is null, user removed the picture - we'll need an endpoint to delete it
        // For now, just clear local state
        this.introPicture.file = null
        return
      }
      
      if (!(file instanceof File)) {
        // If it's a string URL, it's the existing thumbnail - store it
        this.introPicture.file = file
        return
      }
      
      // Upload the cropped picture
      this.introPicture.uploading = true
      try {
        // Upload as intro video thumbnail using a dedicated endpoint
        // We'll use a multipart form with 'thumbnail' field
        const formData = new FormData()
        formData.append('thumbnail', file)
        
        const result = await api.request('/influencer/intro-video/thumbnail', {
          method: 'POST',
          body: formData
        })
        
        if (result.success) {
          const data = result.data?.data || result.data || {}
          const thumbnailUrl = data.introVideoThumbnail || data.thumbnail
          
          // Update local state
          this.introVideo.thumbnail = thumbnailUrl
          this.introPicture.file = thumbnailUrl
          
          toast.success('Intro picture uploaded successfully!')
          
          // Reload profile to get updated thumbnail
          await this.loadIntroVideo()
        } else {
          toast.error(result.error || 'Failed to upload intro picture')
        }
      } catch (err) {
        console.error('Error uploading intro picture:', err)
        toast.error('Failed to upload intro picture. Please try again.')
      } finally {
        this.introPicture.uploading = false
      }
    },
    
    // Logo Upload
    async loadLogo() {
      this.logo.loading = true
      try {
        // Try to get logo from profile data
        const profileResult = await api.getProfile()
        if (profileResult.success) {
          const user = profileResult.data?.data?.user || profileResult.data?.user || profileResult.data?.data || {}
          this.logo.url = user.logo || null
        }
        
        // Also try influencer profile endpoint if we have username
        if (!this.logo.url && this.profileUsername) {
          try {
            const influencerResult = await api.getInfluencerProfile(this.profileUsername)
            if (influencerResult.success) {
              const influencer = influencerResult.data?.data || influencerResult.data || {}
              this.logo.url = influencer.logo || null
            }
          } catch (e) {
            // Silently continue
          }
        }
      } catch (err) {
        console.error('Failed to load logo:', err)
      } finally {
        this.logo.loading = false
      }
    },
    
    triggerLogoUpload() {
      this.$refs.logoInputRef?.click()
    },
    
    async handleLogoSelect(event) {
      const file = event.target.files?.[0]
      if (!file) return
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file size must be less than 2MB')
        return
      }
      
      await this.uploadLogo(file)
      // Reset input so the same file can be selected again
      event.target.value = ''
    },
    
    async uploadLogo(file) {
      this.logo.uploading = true
      this.logo.progress = 0
      
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          if (this.logo.progress < 90) {
            this.logo.progress += 10
          }
        }, 200)
        
        const result = await api.uploadInfluencerLogo(file)
        
        clearInterval(progressInterval)
        this.logo.progress = 100
        
        if (result.success) {
          const data = result.data?.data || result.data || {}
          this.logo.url = data.logo || null
          toast.success('Logo uploaded successfully!')
          
          // Reload logo to get updated URL
          await this.loadLogo()
        } else {
          toast.error(result.error || 'Failed to upload logo')
        }
      } catch (err) {
        console.error('Error uploading logo:', err)
        toast.error('Failed to upload logo. Please try again.')
      } finally {
        this.logo.uploading = false
        this.logo.progress = 0
      }
    },
    
    async deleteLogo() {
      if (!confirm('Remove your logo?')) return
      
      this.logo.deleting = true
      try {
        const result = await api.deleteInfluencerLogo()
        if (result.success) {
          this.logo.url = null
          toast.success('Logo removed')
        } else {
          toast.error(result.error || 'Failed to remove logo')
        }
      } catch (err) {
        toast.error(err.message || 'Failed to remove logo')
      } finally {
        this.logo.deleting = false
      }
    },
    
    onLogoDragOver(e) {
      e.preventDefault()
      this.isLogoDragging = true
    },
    
    onLogoDragLeave() {
      this.isLogoDragging = false
    },
    
    onLogoDrop(e) {
      this.isLogoDragging = false
      const file = e.dataTransfer?.files?.[0]
      if (file && file.type.startsWith('image/')) {
        this.uploadLogo(file)
      }
    },
    
    onDragOver(e) {
      e.preventDefault()
      this.isDragging = true
    },
    
    onDragLeave() {
      this.isDragging = false
    },
    
    onDrop(e) {
      this.isDragging = false
      const file = e.dataTransfer?.files?.[0]
      if (file && file.type.startsWith('video/')) {
        this.uploadVideo(file)
      }
    },
    
    formatDuration(seconds) {
      if (!seconds) return ''
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    getVideoStatusIcon(status) {
      const icons = {
        processing: 'fas fa-spinner fa-spin',
        ready: 'fas fa-check-circle',
        failed: 'fas fa-exclamation-circle'
      }
      return icons[status] || 'fas fa-video'
    },
    
    formatVideoStatus(status) {
      const labels = {
        processing: 'Processing...',
        ready: 'Ready',
        failed: 'Failed'
      }
      return labels[status] || status
    },

    // Socials
    async loadSocials() {
      this.loading.socials = true
      try {
        const result = await api.getInfluencerSocials()
        if (result.success) {
          this.socials = result.data?.data || result.data || []
        }
      } catch (err) {
        console.error('Failed to load socials:', err)
      } finally {
        this.loading.socials = false
      }
    },
    openSocialModal(social = null) {
      this.modals.social.editId = social?.id || null
      this.modals.social.form = social ? { ...social } : { platform: '', url: '', handle: '' }
      this.modals.social.visible = true
    },
    closeSocialModal() {
      this.modals.social.visible = false
    },
    async saveSocial() {
      this.modals.social.saving = true
      try {
        const data = this.modals.social.form
        const result = this.modals.social.editId
          ? await api.updateInfluencerSocial(this.modals.social.editId, data)
          : await api.createInfluencerSocial(data)
        if (result.success) {
          toast.success(this.modals.social.editId ? 'Social link updated' : 'Social link added')
          this.closeSocialModal()
          await this.loadSocials()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.modals.social.saving = false
      }
    },
    async deleteSocial(id) {
      if (!confirm('Delete this social link?')) return
      try {
        const result = await api.deleteInfluencerSocial(id)
        if (result.success) {
          toast.success('Deleted')
          await this.loadSocials()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      }
    },

    // Languages
    async loadLanguages() {
      this.loading.languages = true
      try {
        const result = await api.getInfluencerLanguages()
        if (result.success) {
          this.languages = result.data?.data || result.data || []
        }
      } catch (err) {
        console.error('Failed to load languages:', err)
      } finally {
        this.loading.languages = false
      }
    },
    openLanguageModal(lang = null) {
      this.modals.language.editId = lang?.id || null
      this.modals.language.form = lang
        ? { languageCode: lang.languageCode, languageName: lang.languageName, level: lang.level }
        : { languageCode: '', languageName: '', level: '' }
      this.modals.language.visible = true
    },
    closeLanguageModal() {
      this.modals.language.visible = false
    },
    onLanguageSelect() {
      const selected = this.availableLanguages.find(l => l.code === this.modals.language.form.languageCode)
      if (selected) {
        this.modals.language.form.languageName = selected.name
      }
    },
    async saveLanguage() {
      this.modals.language.saving = true
      try {
        const data = this.modals.language.form
        const result = this.modals.language.editId
          ? await api.updateInfluencerLanguage(this.modals.language.editId, data)
          : await api.createInfluencerLanguage(data)
        if (result.success) {
          toast.success(this.modals.language.editId ? 'Language updated' : 'Language added')
          this.closeLanguageModal()
          await this.loadLanguages()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.modals.language.saving = false
      }
    },
    async deleteLanguage(id) {
      if (!confirm('Delete this language?')) return
      try {
        const result = await api.deleteInfluencerLanguage(id)
        if (result.success) {
          toast.success('Deleted')
          await this.loadLanguages()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      }
    },

    // Skills
    async loadSkills() {
      this.loading.skills = true
      try {
        const result = await api.getInfluencerSkills()
        if (result.success) {
          this.skills = result.data?.data || result.data || []
        }
      } catch (err) {
        console.error('Failed to load skills:', err)
      } finally {
        this.loading.skills = false
      }
    },
    openSkillModal() {
      this.modals.skill.form = { skill: '' }
      this.modals.skill.visible = true
    },
    closeSkillModal() {
      this.modals.skill.visible = false
    },
    async saveSkill() {
      this.modals.skill.saving = true
      try {
        const result = await api.createInfluencerSkill(this.modals.skill.form)
        if (result.success) {
          toast.success('Skill added')
          this.closeSkillModal()
          await this.loadSkills()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.modals.skill.saving = false
      }
    },
    async deleteSkill(id) {
      try {
        const result = await api.deleteInfluencerSkill(id)
        if (result.success) {
          toast.success('Deleted')
          await this.loadSkills()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      }
    },

    // Certifications
    async loadCertifications() {
      this.loading.certifications = true
      try {
        const result = await api.getInfluencerCertifications()
        if (result.success) {
          this.certifications = result.data?.data || result.data || []
        }
      } catch (err) {
        console.error('Failed to load certifications:', err)
      } finally {
        this.loading.certifications = false
      }
    },
    openCertificationModal(cert = null) {
      this.modals.certification.editId = cert?.id || null
      this.modals.certification.form = cert
        ? { name: cert.name, issuer: cert.issuer || '', issuedAt: cert.issuedAt || '' }
        : { name: '', issuer: '', issuedAt: '' }
      this.modals.certification.visible = true
    },
    closeCertificationModal() {
      this.modals.certification.visible = false
    },
    async saveCertification() {
      this.modals.certification.saving = true
      try {
        const data = this.modals.certification.form
        const result = this.modals.certification.editId
          ? await api.updateInfluencerCertification(this.modals.certification.editId, data)
          : await api.createInfluencerCertification(data)
        if (result.success) {
          toast.success(this.modals.certification.editId ? 'Certification updated' : 'Certification added')
          this.closeCertificationModal()
          await this.loadCertifications()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.modals.certification.saving = false
      }
    },
    async deleteCertification(id) {
      if (!confirm('Delete this certification?')) return
      try {
        const result = await api.deleteInfluencerCertification(id)
        if (result.success) {
          toast.success('Deleted')
          await this.loadCertifications()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      }
    },

    // External Links
    async loadExternalLinks() {
      this.loading.externalLinks = true
      try {
        const result = await api.getInfluencerExternalLinks()
        if (result.success) {
          this.externalLinks = result.data?.data || result.data || []
        }
      } catch (err) {
        console.error('Failed to load external links:', err)
      } finally {
        this.loading.externalLinks = false
      }
    },
    openExternalLinkModal(link = null) {
      this.modals.externalLink.editId = link?.id || null
      this.modals.externalLink.form = link
        ? { platform: link.platform, title: link.title, subtitle: link.subtitle || '', url: link.url, rating: link.rating }
        : { platform: '', title: '', subtitle: '', url: '', rating: null }
      this.modals.externalLink.visible = true
    },
    closeExternalLinkModal() {
      this.modals.externalLink.visible = false
    },
    async saveExternalLink() {
      this.modals.externalLink.saving = true
      try {
        const data = this.modals.externalLink.form
        const result = this.modals.externalLink.editId
          ? await api.updateInfluencerExternalLink(this.modals.externalLink.editId, data)
          : await api.createInfluencerExternalLink(data)
        if (result.success) {
          toast.success(this.modals.externalLink.editId ? 'Link updated' : 'Link added')
          this.closeExternalLinkModal()
          await this.loadExternalLinks()
        } else {
          toast.error(result.error || 'Failed to save')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        this.modals.externalLink.saving = false
      }
    },
    async deleteExternalLink(id) {
      if (!confirm('Delete this link?')) return
      try {
        const result = await api.deleteInfluencerExternalLink(id)
        if (result.success) {
          toast.success('Deleted')
          await this.loadExternalLinks()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error(err.message)
      }
    },

    // Helpers
    getPlatformIcon(platform) {
      const icons = {
        instagram: 'fab fa-instagram',
        youtube: 'fab fa-youtube',
        tiktok: 'fab fa-tiktok',
        twitter: 'fab fa-twitter',
        facebook: 'fab fa-facebook',
        linkedin: 'fab fa-linkedin'
      }
      return icons[platform] || 'fas fa-link'
    },
    formatPlatform(platform) {
      return platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : ''
    },
    formatLevel(level) {
      const map = { native: 'Native', fluent: 'Fluent', conversational: 'Conversational', basic: 'Basic' }
      return map[level] || level
    },
    getLanguageFlag(code) {
      const lang = this.availableLanguages.find(l => l.code === code)
      return lang?.flag || '🌐'
    }
  }
}
</script>

<style scoped>
.creator-settings {
  padding: var(--spacing-xl) 0;
  background: var(--bg-secondary);
  min-height: 60vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.settings-intro {
  margin-bottom: var(--spacing-xl);
}

.settings-intro h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.settings-intro p {
  color: var(--text-secondary);
  margin: 0;
}

.settings-section {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-header h2 i {
  color: var(--secondary-color);
}

.add-btn {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.add-btn:hover {
  background: var(--secondary-hover);
  transform: translateY(-1px);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.empty-state i {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
  opacity: 0.3;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.list-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  color: white;
  background: var(--text-secondary);
}

.item-icon.instagram { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
.item-icon.youtube { background: #ff0000; }
.item-icon.tiktok { background: #000; }
.item-icon.twitter { background: #1da1f2; }
.item-icon.facebook { background: #1877f2; }
.item-icon.linkedin { background: #0a66c2; }
.item-icon.language { background: var(--secondary-color); font-size: var(--font-size-xl); }
.item-icon.cert { background: var(--warning-color, #f59e0b); }
.item-icon.link { background: var(--text-secondary); }

.item-icon .flag {
  font-size: var(--font-size-xl);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.item-subtitle {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.icon-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.icon-btn.delete:hover {
  background: var(--error-color);
  color: white;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--secondary-light);
  color: var(--secondary-color);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.tag-delete {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 2px;
  opacity: 0.6;
  transition: opacity var(--transition-normal);
}

.tag-delete:hover {
  opacity: 1;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: var(--spacing-md);
}

.modal-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: min(420px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--secondary-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-sm);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
}

.close-btn:hover {
  background: var(--bg-secondary);
}

.modal-body {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.form-input {
  padding: var(--spacing-md);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: var(--bg-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px var(--secondary-light);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.modal-btn {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 600;
  cursor: pointer;
  transition: filter var(--transition-normal);
}

.modal-btn.ghost {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-primary);
}

.modal-btn.primary {
  background: var(--secondary-color);
  color: #fff;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Intro Video Section */
.intro-video-section .section-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

/* Intro Picture Section */
.intro-picture-section .section-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

/* Logo Section */
.logo-section .section-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.logo-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
}

.logo-container {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--border-light);
  padding: var(--spacing-md);
  max-width: 200px;
  width: 100%;
}

.preview-logo {
  width: 100%;
  height: auto;
  object-fit: contain;
  max-height: 200px;
}

.logo-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

.video-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.video-container {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #000;
  aspect-ratio: 9 / 16;
  max-height: 400px;
  margin: 0 auto;
  width: 100%;
  max-width: 280px;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.video-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.video-status.ready {
  color: #22c55e;
}

.video-status.processing {
  color: #f59e0b;
}

.video-status.failed {
  color: #ef4444;
}

.video-duration {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.video-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

.video-actions .action-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.video-actions .action-btn.replace {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.video-actions .action-btn.replace:hover {
  background: var(--bg-primary);
  border-color: var(--text-secondary);
}

.video-actions .action-btn.delete {
  background: transparent;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.video-actions .action-btn.delete:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.video-actions .action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-area {
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.upload-area:hover {
  border-color: var(--secondary-color);
  background: rgba(99, 102, 241, 0.02);
}

.upload-area.drag-over {
  border-color: var(--secondary-color);
  background: rgba(99, 102, 241, 0.05);
}

.file-input-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon i {
  font-size: 24px;
  color: var(--secondary-color);
}

.upload-content h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.upload-content p {
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.upload-hint {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  opacity: 0.7;
}

.upload-progress {
  margin-top: var(--spacing-md);
  text-align: center;
}

.progress-bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: var(--secondary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .settings-section {
    padding: var(--spacing-md);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>

