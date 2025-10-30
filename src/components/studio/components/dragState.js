// Shared drag state to track what category is being dragged
export let currentDragLayerId = null

export function setDragLayerId(layerId) {
  currentDragLayerId = layerId
}

export function clearDragLayerId() {
  currentDragLayerId = null
}

