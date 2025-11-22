import { getPOIPrimaryIcon, getPlaceTypeIcon } from './activityIconMapper.js'
import { getPOIColorScheme } from './markerColors.js'

/**
 * Creates a marker element with icon and text label for Google Maps Advanced Markers
 * @param {Object} poi - POI object
 * @param {Object} options - Additional options
 * @returns {HTMLElement} Marker element
 */
export function createMarkerElement(poi, options = {}) {
  const {
    size = 40,
    showIcon = true,
    showLabel = true
  } = options
  
  // Get color scheme for this POI
  const colorScheme = getPOIColorScheme(poi)
  
  // Get icon class
  const iconClass = showIcon ? getPOIPrimaryIcon(poi) : null
  
  // Get POI name
  const poiName = poi.basic?.name || 'POI'
  
  // Create single unified box container (pill-shaped with icon + text)
  const markerContainer = document.createElement('div')
  markerContainer.className = 'poi-marker-container'
  
  // Calculate padding based on whether we show label
  const horizontalPadding = showLabel && poiName ? '12px' : '8px'
  const borderRadius = 8 // Rounded top corners (not fully pill-shaped anymore)
  const pointerSize = 8 // Size of the triangle pointer
  const pointerOffset = 0 // Offset from center (0 = centered)
  
  // Create wrapper for the entire marker (box + pointer)
  const markerWrapper = document.createElement('div')
  markerWrapper.className = 'poi-marker-wrapper'
  markerWrapper.style.cssText = `
    position: relative;
    display: inline-block;
  `
  
  // Style the main box (speech bubble body)
  markerContainer.style.cssText = `
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    z-index: 1;
    width: auto;
    height: ${size}px;
    min-width: ${size}px;
    background-color: ${colorScheme.background};
    border: 2px solid ${colorScheme.border};
    border-radius: ${borderRadius}px ${borderRadius}px ${borderRadius}px ${borderRadius}px;
    padding: 0 ${horizontalPadding};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `
  
  // Create the triangle pointer at the bottom center
  const pointer = document.createElement('div')
  pointer.className = 'poi-marker-pointer'
  pointer.style.cssText = `
    position: absolute;
    bottom: -${pointerSize}px;
    left: 50%;
    transform: translateX(${-50 + pointerOffset}%);
    width: 0;
    height: 0;
    border-left: ${pointerSize}px solid transparent;
    border-right: ${pointerSize}px solid transparent;
    border-top: ${pointerSize}px solid ${colorScheme.background};
    z-index: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  `
  
  // Add border to the pointer (create an outer triangle for the border)
  const pointerBorder = document.createElement('div')
  pointerBorder.className = 'poi-marker-pointer-border'
  pointerBorder.style.cssText = `
    position: absolute;
    bottom: -${pointerSize + 2}px;
    left: 50%;
    transform: translateX(${-50 + pointerOffset}%);
    width: 0;
    height: 0;
    border-left: ${pointerSize + 2}px solid transparent;
    border-right: ${pointerSize + 2}px solid transparent;
    border-top: ${pointerSize + 2}px solid ${colorScheme.border};
    z-index: 0;
  `
  
  markerWrapper.appendChild(markerContainer)
  markerWrapper.appendChild(pointerBorder)
  markerWrapper.appendChild(pointer)
  
  // Add icon if available
  if (iconClass && showIcon) {
    const icon = document.createElement('i')
    icon.className = iconClass
    icon.style.cssText = `
      color: ${colorScheme.icon};
      font-size: ${size * 0.4}px;
      line-height: 1;
      flex-shrink: 0;
    `
    markerContainer.appendChild(icon)
  } else {
    // Fallback: show first letter of POI name
    const text = document.createElement('span')
    text.textContent = (poiName[0] || '?').toUpperCase()
    text.style.cssText = `
      color: ${colorScheme.icon};
      font-size: ${size * 0.4}px;
      font-weight: 700;
      line-height: 1;
      flex-shrink: 0;
    `
    markerContainer.appendChild(text)
  }
  
  // Add text label beside the icon (inside the same box)
  if (showLabel && poiName) {
    const labelEl = document.createElement('span')
    labelEl.className = 'poi-marker-label'
    labelEl.textContent = poiName
    labelEl.style.cssText = `
      color: ${colorScheme.icon};
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
      user-select: none;
      line-height: 1;
      max-width: 180px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    `
    markerContainer.appendChild(labelEl)
  }
  
  // Add hover effects on the wrapper
  markerWrapper.addEventListener('mouseenter', () => {
    markerWrapper.style.transform = 'scale(1.1)'
    markerContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)'
    markerWrapper.style.zIndex = '1000'
  })
  
  markerWrapper.addEventListener('mouseleave', () => {
    markerWrapper.style.transform = 'scale(1)'
    markerContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
    markerWrapper.style.zIndex = 'auto'
  })
  
  // Store POI data for click handlers
  markerWrapper.dataset.poiId = poi.id
  
  return markerWrapper
}

/**
 * Creates a Google Maps Advanced Marker for a POI
 * @param {Object} map - Google Maps instance
 * @param {Object} poi - POI object
 * @param {Object} options - Marker options
 * @returns {Object} Advanced Marker instance
 */
export function createAdvancedMarker(map, poi, options = {}) {
  if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
    console.warn('[createMarker] Advanced Markers not available, falling back to standard markers')
    return createStandardMarker(map, poi, options)
  }
  
  const {
    onClick,
    onHover,
    size = 40
  } = options
  
  // Validate POI coordinates
  if (!poi.basic?.latitude || !poi.basic?.longitude) {
    console.warn('[createMarker] POI missing coordinates:', poi)
    return null
  }
  
  // Create marker element with label enabled
  const markerElement = createMarkerElement(poi, { 
    size,
    showLabel: true,
    showIcon: true
  })
  
  // Create position
  const position = {
    lat: Number(poi.basic.latitude),
    lng: Number(poi.basic.longitude)
  }
  
  // Calculate anchor point for the marker (bottom center where pointer tip is)
  // The pointer extends 8px below the box, so anchor at bottom center
  const pointerSize = 8
  const totalHeight = size + pointerSize
  
  // We need to wait for the element to be rendered to get its width
  // For now, use offset to position the marker correctly
  // The anchor should be at bottom center of the wrapper element
  
  // Create Advanced Marker with anchor at bottom center (pointer tip)
  const marker = new window.google.maps.marker.AdvancedMarkerElement({
    map,
    position,
    content: markerElement,
    title: poi.basic?.name || 'POI',
    gmpClickable: true
  })
  
  // Set anchor point to bottom center (where pointer tip is)
  // Advanced Marker anchor is relative: (0,0) = top-left, measured in pixels
  // The pointer extends 8px below the box, so anchor should be at bottom center
  // We'll calculate after the element is rendered
  setTimeout(() => {
    if (markerElement && markerElement.offsetWidth && markerElement.offsetHeight) {
      // Anchor at bottom center where the pointer tip is
      const anchorX = markerElement.offsetWidth / 2
      const anchorY = markerElement.offsetHeight
      
      // Set anchor point if the property exists
      if (marker.anchorPoint !== undefined) {
        marker.anchorPoint = { x: anchorX, y: anchorY }
      }
    }
  }, 0)
  
  // Add click event
  if (onClick) {
    marker.addListener('click', () => {
      onClick(poi, marker)
    })
  }
  
  // Add hover events
  if (onHover) {
    markerElement.addEventListener('mouseenter', () => {
      onHover(poi, marker, true)
    })
    markerElement.addEventListener('mouseleave', () => {
      onHover(poi, marker, false)
    })
  }
  
  // Store POI reference
  marker.poi = poi
  
  return marker
}

/**
 * Fallback: Creates a standard Google Maps Marker
 * @param {Object} map - Google Maps instance
 * @param {Object} poi - POI object
 * @param {Object} options - Marker options
 * @returns {Object} Standard Marker instance
 */
function createStandardMarker(map, poi, options = {}) {
  const {
    onClick,
    onHover
  } = options
  
  const colorScheme = getPOIColorScheme(poi)
  
  // Create custom icon using SVG with a simple circle and initial letter
  // For standard markers, we use a simple design since FontAwesome won't work in SVG
  const poiInitial = (poi.basic?.name?.[0] || '?').toUpperCase()
  
  const iconSvg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${colorScheme.background}" stroke="${colorScheme.border}" stroke-width="3"/>
      <text x="20" y="28" font-size="16" fill="${colorScheme.icon}" text-anchor="middle" font-weight="bold" font-family="Arial, sans-serif">${poiInitial}</text>
    </svg>
  `
  
  const icon = {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(iconSvg),
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20)
  }
  
  const marker = new window.google.maps.Marker({
    map,
    position: {
      lat: Number(poi.basic.latitude),
      lng: Number(poi.basic.longitude)
    },
    icon,
    title: poi.basic?.name || 'POI',
    optimized: false
  })
  
  if (onClick) {
    marker.addListener('click', () => {
      onClick(poi, marker)
    })
  }
  
  marker.poi = poi
  
  return marker
}

