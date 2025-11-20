<template>
  <div>
    <!-- Markers are rendered directly on the map via AdvancedMarker components -->
    <!-- Always render AdvancedMarker components - they will create markers when ready -->
    <AdvancedMarker
      v-for="(poi, index) in validPOIs"
      :key="getPOIKey(poi, index)"
      :position="getPOIPosition(poi)"
      :title="getPOITitle(poi)"
      :content="getPOIContent(poi, index)"
      :map="map"
      :AdvancedMarkerElement="AdvancedMarkerElement"
      :zIndex="1000 + index"
      :visible="true"
      @created="handleMarkerCreated(poi, $event)"
      @error="handleMarkerError(poi, $event)"
    />
  </div>
</template>

<script>
import AdvancedMarker from './AdvancedMarker.vue'

export default {
  name: 'POIMarkers',
  components: {
    AdvancedMarker
  },
  props: {
    pois: {
      type: Array,
      default: () => []
    },
    map: {
      type: Object,
      default: null
    },
    AdvancedMarkerElement: {
      type: Function,
      default: null
    }
  },
  created() {
    console.log('[POIMarkers] Component created', {
      poisCount: this.pois?.length || 0,
      hasMap: !!this.map,
      hasAdvancedMarkerElement: !!this.AdvancedMarkerElement
    })
  },
  mounted() {
    console.log('[POIMarkers] Component mounted', {
      poisCount: this.pois?.length || 0,
      validPOIsCount: this.validPOIs.length,
      hasMap: !!this.map,
      hasAdvancedMarkerElement: !!this.AdvancedMarkerElement,
      shouldRenderMarkers: this.map && this.AdvancedMarkerElement
    })
  },
  watch: {
    pois: {
      handler(newPois) {
        console.log('[POIMarkers] POIs changed:', newPois?.length || 0, 'POIs')
      },
      immediate: true,
      deep: true
    },
    map(newMap) {
      console.log('[POIMarkers] Map changed:', !!newMap)
    },
    AdvancedMarkerElement(newElement) {
      console.log('[POIMarkers] AdvancedMarkerElement changed:', !!newElement, typeof newElement)
    }
  },
  computed: {
    validPOIs() {
      // Filter POIs that have valid latitude and longitude
      const valid = this.pois.filter(poi => this.hasValidPosition(poi))
      console.log('[POIMarkers] validPOIs computed:', {
        total: this.pois.length,
        valid: valid.length,
        map: !!this.map,
        AdvancedMarkerElement: !!this.AdvancedMarkerElement,
        AdvancedMarkerElementType: typeof this.AdvancedMarkerElement,
        pois: this.pois.map((poi, idx) => ({
          index: idx,
          name: poi?.basic?.name,
          lat: poi?.basic?.latitude,
          lng: poi?.basic?.longitude,
          latType: typeof poi?.basic?.latitude,
          lngType: typeof poi?.basic?.longitude,
          isValid: this.hasValidPosition(poi)
        }))
      })
      return valid
    }
  },
  methods: {
    hasValidPosition(poi) {
      const lat = poi?.basic?.latitude
      const lng = poi?.basic?.longitude
      
      // Handle both number and string types (strings might come from form inputs)
      const latNum = typeof lat === 'string' ? parseFloat(lat) : lat
      const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng
      
      const isValid = (
        (typeof latNum === 'number' || typeof lat === 'number') &&
        (typeof lngNum === 'number' || typeof lng === 'number') &&
        !isNaN(latNum) &&
        !isNaN(lngNum) &&
        latNum >= -90 &&
        latNum <= 90 &&
        lngNum >= -180 &&
        lngNum <= 180
      )
      
      if (!isValid && (lat !== undefined || lng !== undefined)) {
        console.warn('[POIMarkers] Invalid position for POI:', {
          name: poi?.basic?.name,
          lat,
          lng,
          latType: typeof lat,
          lngType: typeof lng,
          latNum,
          lngNum
        })
      }
      
      return isValid
    },
    getPOIPosition(poi) {
      const lat = poi?.basic?.latitude
      const lng = poi?.basic?.longitude
      return {
        lat: Number(lat),
        lng: Number(lng)
      }
    },
    getPOITitle(poi) {
      return poi?.basic?.name || poi?.basic?.tagline || 'Point of Interest'
    },
    getPOIContent(poi, index) {
      // Create a simple marker content with POI number
      const poiNumber = index + 1
      const poiName = poi?.basic?.name || `POI ${poiNumber}`
      
      // Try PinElement first (recommended for AdvancedMarkerElement)
      if (window.google?.maps?.marker?.PinElement) {
        try {
          const PinElement = window.google.maps.marker.PinElement
          const pinElement = new PinElement({
            background: '#3b82f6',
            borderColor: '#1e40af',
            glyphColor: '#ffffff',
            glyphText: String(poiNumber), // Use glyphText (not deprecated glyph)
            scale: 1.5 // Make it larger
          })
          console.log('[POIMarkers] Using PinElement for POI:', poiName, pinElement)
          return pinElement.element
        } catch (error) {
          console.warn('[POIMarkers] PinElement creation failed, falling back to custom div:', error)
        }
      }
      
      // Fallback to custom div - match the EXACT style from MapPanel which works
      const content = document.createElement('div')
      // EXACT same styling as MapPanel line 416-429
      content.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #3b82f6;
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 3px solid white;
      `
      content.textContent = String(poiNumber) // Use String() like MapPanel line 430
      content.title = poiName
      
      console.log('[POIMarkers] Created marker content for POI:', poiName, {
        element: content,
        textContent: content.textContent,
        style: content.style.cssText,
        isConnected: content.isConnected,
        tagName: content.tagName
      })
      
      return content
    },
    getPOIKey(poi, index) {
      // Use remoteId if available, otherwise use id, otherwise use index
      return poi?.remoteId || poi?.id || `poi-${index}`
    },
    escapeHtml(text) {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    },
    handleMarkerCreated(poi, marker) {
      // Emit event when marker is created for potential future use
      console.log('[POIMarkers] Marker created for POI:', poi?.basic?.name, marker)
      console.log('[POIMarkers] Marker details:', {
        map: marker?.map,
        position: marker?.position,
        content: marker?.content,
        visible: marker?.visible
      })
      
      // Verify marker is on the map
      if (marker && !marker.map) {
        console.error('[POIMarkers] Marker created but not attached to map!')
        if (this.map) {
          marker.map = this.map
          console.log('[POIMarkers] Manually attached marker to map')
        }
      }
      
      this.$emit('marker-created', { poi, marker })
    },
    handleMarkerError(poi, error) {
      console.error('[POIMarkers] Marker creation error for POI:', poi?.basic?.name, error)
    }
  }
}
</script>

<style>
/* POI Marker Styles - Global styles needed because markers are rendered on map canvas */
.poi-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.poi-marker-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-primary, #ffffff);
  border: 2px solid var(--secondary-color, #3b82f6);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.poi-marker-content:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.poi-marker-number {
  font-weight: 700;
  font-size: 14px;
  color: var(--secondary-color, #3b82f6);
  line-height: 1;
  margin-top: 2px;
}

.poi-marker-label {
  display: none; /* Hide label by default, can be shown on hover if needed */
  font-size: 10px;
  color: var(--text-primary, #1f2937);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
</style>

