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
  data() {
    return {
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
      // Use LatLng object if available for precision, otherwise plain object
      if (window.google?.maps?.LatLng) {
        return new window.google.maps.LatLng(Number(lat), Number(lng))
      }
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
      // Normalize pinAccuracy: lowercase and trim
      const rawPinAccuracy = poi?.basic?.pinAccuracy || 'exact'
      const pinAccuracy = String(rawPinAccuracy).toLowerCase().trim()
      
      console.log('[POIMarkers] getPOIContent - pinAccuracy:', {
        raw: rawPinAccuracy,
        normalized: pinAccuracy,
        poiName,
        poiBasic: poi?.basic
      })
      
      // Get marker style based on pin accuracy
      const markerStyle = this.getMarkerStyle(pinAccuracy, poiNumber)
      
      // For estimated and approximate, skip PinElement and create simple circles with numbers
      if (pinAccuracy === 'estimated' || pinAccuracy === 'estimate') {
        // Create a simple circular dot with number and accuracy range indicator
        const dot = document.createElement('div')
        dot.className = 'poi-marker-estimated' // Add class for CSS targeting
        dot.style.cssText = markerStyle.cssText
        dot.textContent = String(poiNumber) // Add number inside the dot
        dot.title = `${poiName} (${pinAccuracy})`
        console.log('[POIMarkers] Created simple dot marker with number for estimated POI:', poiName)
        return dot
      }
      
      if (pinAccuracy === 'approximate') {
        // Create a simple circular dot with number and accuracy range indicator (orange)
        const dot = document.createElement('div')
        dot.className = 'poi-marker-approximate' // Add class for CSS targeting
        dot.style.cssText = markerStyle.cssText
        dot.textContent = String(poiNumber) // Add number inside the dot
        dot.title = `${poiName} (${pinAccuracy})`
        console.log('[POIMarkers] Created simple dot marker with number for approximate POI:', poiName)
        return dot
      }
      
      // Try PinElement first (recommended for AdvancedMarkerElement) - only for exact now
      if (window.google?.maps?.marker?.PinElement) {
        try {
          const PinElement = window.google.maps.marker.PinElement
          const pinElement = new PinElement({
            background: markerStyle.background,
            borderColor: markerStyle.borderColor,
            glyphColor: markerStyle.glyphColor,
            glyphText: String(poiNumber),
            scale: 1
          })
          console.log('[POIMarkers] Using PinElement for POI:', poiName, 'pinAccuracy:', pinAccuracy, pinElement)
          return pinElement.element
        } catch (error) {
          console.warn('[POIMarkers] PinElement creation failed, falling back to custom div:', error)
        }
      }
      
      // Fallback to custom div with pin accuracy styling
      const content = document.createElement('div')
      content.style.cssText = markerStyle.cssText
      content.textContent = String(poiNumber)
      content.title = `${poiName} (${pinAccuracy})`
      
      console.log('[POIMarkers] Created marker content for POI:', poiName, 'pinAccuracy:', pinAccuracy, {
        element: content,
        textContent: content.textContent,
        style: content.style.cssText,
        isConnected: content.isConnected,
        tagName: content.tagName
      })
      
      return content
    },
    getMarkerStyle(pinAccuracy, poiNumber) {
      const baseSize = 30
      const baseFontSize = 14
      
      console.log('[POIMarkers] getMarkerStyle called with pinAccuracy:', pinAccuracy, 'type:', typeof pinAccuracy)
      
      switch (pinAccuracy) {
        case 'exact':
          // Exact: Solid blue circle with solid border
          return {
            background: '#EA4335', // Google Maps Red
            borderColor: '#B31412', // Darker Google Maps Red
            glyphColor: '#ffffff',
            cssText: `
              display: flex;
              align-items: center;
              justify-content: center;
              width: ${baseSize}px;
              height: ${baseSize}px;
              border-radius: 50%;
              background: #3b82f6;
              color: #fff;
              font-size: ${baseFontSize}px;
              font-weight: 700;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              border: 3px solid white;
            `
          }
        
        case 'approximate':
          // Approximate: Orange/yellow circle with solid border (like estimated but orange)
          return {
            background: '#f59e0b', // Amber/Orange
            borderColor: '#d97706', // Darker orange
            glyphColor: '#ffffff',
            cssText: `
              display: flex;
              align-items: center;
              justify-content: center;
              width: ${baseSize}px;
              height: ${baseSize}px;
              border-radius: 50%;
              background: #f59e0b;
              color: #fff;
              font-size: ${baseFontSize}px;
              font-weight: 700;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              border: 3px solid white;
            `
          }
        
        case 'estimated':
        case 'estimate': // Handle both 'estimated' and 'estimate' (without 'd')
          // Estimated: Simple gray circle with number (no pin shape, same size as others)
          return {
            background: '#6b7280', // Gray
            borderColor: '#4b5563', // Darker gray
            glyphColor: '#ffffff',
            cssText: `
              display: flex;
              align-items: center;
              justify-content: center;
              width: ${baseSize}px;
              height: ${baseSize}px;
              border-radius: 50%;
              background: #6b7280;
              color: #fff;
              font-size: ${baseFontSize}px;
              font-weight: 700;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              border: 3px solid white;
            `
          }
        
        default:
          // Default to exact style
          return this.getMarkerStyle('exact', poiNumber)
      }
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
  font-weight: 400;
  font-size: 8px;
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

/* Estimated marker with accuracy range indicator */
.poi-marker-estimated {
  position: relative;
  z-index: 10; /* Ensure marker is above the range circles */
}

/* Outer accuracy range circle (larger, more transparent) */
.poi-marker-estimated::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px; /* 2x the marker size for outer range */
  height: 100px;
  border-radius: 50%;
  border: 1px solid rgba(107, 114, 128, 0.4); /* Gray with transparency */
  background: rgba(107, 114, 128, 0.1); /* Very light gray fill */
  pointer-events: none; /* Don't interfere with marker clicks */
  z-index: -1;
}


/* Approximate marker with accuracy range indicator */
.poi-marker-approximate {
  position: relative;
  z-index: 10; /* Ensure marker is above the range circles */
}

/* Outer accuracy range circle (smaller than estimated, indicating better accuracy) - Orange */
.poi-marker-approximate::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 65px; /* Smaller than estimated (80px) - 1.625x marker size */
  height: 65px;
  border-radius: 50%;
  border: 2px solid rgba(245, 158, 11, 0.4); /* Orange with transparency */
  background: rgba(245, 158, 11, 0.1); /* Very light orange fill */
  pointer-events: none; /* Don't interfere with marker clicks */
  z-index: -1;
}

</style>

