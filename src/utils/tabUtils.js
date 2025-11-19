/**
 * Utility functions for tab navigation
 * Hỗ trợ tạo và quản lý tabs một cách dễ dàng
 */

/**
 * Tạo tabs từ config đơn giản
 * @param {Array} config - Array of { value, label, icon?, badge?, disabled? }
 * @returns {Array} Formatted tabs array
 */
export function createTabs(config) {
    return config.map(tab => ({
        value: tab.value,
        label: tab.label,
        icon: tab.icon || null,
        badge: tab.badge || null,
        disabled: tab.disabled || false
    }))
}

/**
 * Tạo tabs với badge count
 * @param {Array} config - Array of { value, label, icon?, count?, disabled? }
 * @returns {Array} Formatted tabs with badge
 */
export function createTabsWithCount(config) {
    return config.map(tab => ({
        value: tab.value,
        label: tab.label,
        icon: tab.icon || null,
        badge: tab.count > 0 ? tab.count : null,
        disabled: tab.disabled || false
    }))
}

/**
 * Tạo tabs từ object mapping
 * @param {Object} mapping - Object với key là value, value là label
 * @param {Object} options - { icons?, badges?, disabled? }
 * @returns {Array} Formatted tabs array
 */
export function createTabsFromMapping(mapping, options = {}) {
    const { icons = {}, badges = {}, disabled = {} } = options

    return Object.entries(mapping).map(([value, label]) => ({
        value,
        label,
        icon: icons[value] || null,
        badge: badges[value] || null,
        disabled: disabled[value] || false
    }))
}

/**
 * Tạo tabs cho quản lý tài khoản
 */
export function createAccountManagementTabs(counts = {}) {
    return createTabsWithCount([
        {
            value: 'staff',
            label: 'Nhân viên',
            icon: 'bi-person-badge',
            count: counts.staff || 0
        },
        {
            value: 'customer',
            label: 'Khách hàng',
            icon: 'bi-people',
            count: counts.customer || 0
        },
        {
            value: 'locked',
            label: 'Tài khoản bị khóa',
            icon: 'bi-lock',
            count: counts.locked || 0
        }
    ])
}

/**
 * Tạo tabs cho quản lý hóa đơn
 */
export function createInvoiceManagementTabs(counts = {}) {
    return createTabs([
        {
            value: '',
            label: 'Tất cả',
            icon: 'bi-list-ul',
            badge: counts.all || null
        },
        {
            value: 'processing',
            label: 'Chờ xác nhận',
            icon: 'bi-clock-history',
            badge: counts.processing || null
        },
        {
            value: 'confirmed',
            label: 'Đã xác nhận',
            icon: 'bi-check-circle',
            badge: counts.confirmed || null
        },
        {
            value: 'delivering',
            label: 'Đang giao',
            icon: 'bi-truck',
            badge: counts.delivering || null
        },
        {
            value: 'completed',
            label: 'Hoàn thành',
            icon: 'bi-check2-all',
            badge: counts.completed || null
        },
        {
            value: 'cancelled',
            label: 'Đã hủy',
            icon: 'bi-x-circle',
            badge: counts.cancelled || null
        }
    ])
}

/**
 * Tạo tabs cho quản lý sản phẩm
 */
export function createProductManagementTabs() {
    return createTabs([
        {
            value: 'all',
            label: 'Tất cả',
            icon: 'bi-grid'
        },
        {
            value: 'active',
            label: 'Đang bán',
            icon: 'bi-check-circle'
        },
        {
            value: 'inactive',
            label: 'Ngừng bán',
            icon: 'bi-x-circle'
        },
        {
            value: 'low-stock',
            label: 'Sắp hết hàng',
            icon: 'bi-exclamation-triangle'
        }
    ])
}

/**
 * Format tab value để hiển thị
 */
export function formatTabLabel(value, mapping) {
    return mapping[value] || value
}

/**
 * Get active tab index
 */
export function getActiveTabIndex(tabs, activeValue) {
    return tabs.findIndex(tab => tab.value === activeValue)
}

/**
 * Get next/previous tab
 */
export function getNextTab(tabs, currentValue) {
    const currentIndex = getActiveTabIndex(tabs, currentValue)
    if (currentIndex < tabs.length - 1) {
        return tabs[currentIndex + 1]
    }
    return null
}

export function getPreviousTab(tabs, currentValue) {
    const currentIndex = getActiveTabIndex(tabs, currentValue)
    if (currentIndex > 0) {
        return tabs[currentIndex - 1]
    }
    return null
}

export default {
    createTabs,
    createTabsWithCount,
    createTabsFromMapping,
    createAccountManagementTabs,
    createInvoiceManagementTabs,
    createProductManagementTabs,
    formatTabLabel,
    getActiveTabIndex,
    getNextTab,
    getPreviousTab
}

