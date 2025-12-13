/**
 * Simple Event Bus for cross-component communication
 * Used to notify when variant price is updated
 */
import { ref } from 'vue'

class EventBus {
  constructor() {
    this.events = {}
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)

    // Return unsubscribe function
    return () => {
      this.off(event, callback)
    }
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.events[event]) return

    const index = this.events[event].indexOf(callback)
    if (index > -1) {
      this.events[event].splice(index, 1)
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    if (!this.events[event]) return

    this.events[event].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(event, callback) {
    const wrapper = (data) => {
      callback(data)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }
}

// Export singleton instance
export const eventBus = new EventBus()

// Export common event names
export const EVENTS = {
  VARIANT_PRICE_UPDATED: 'variant:price-updated',
  VARIANT_UPDATED: 'variant:updated',
  PRODUCT_UPDATED: 'product:updated',
}

