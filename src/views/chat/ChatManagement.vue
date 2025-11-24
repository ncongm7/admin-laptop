<template>
  <div class="chat-management-container">
    <div class="chat-layout">
      <!-- Sidebar: Danh sách conversation -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h5 class="mb-0">
            <i class="bi bi-chat-dots me-2"></i>
            Tin nhắn
          </h5>
          <button class="btn btn-sm btn-outline-primary" @click="refreshConversations">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>

        <!-- Search box -->
        <div class="search-box p-2">
          <input
            type="text"
            class="form-control form-control-sm"
            v-model="searchKeyword"
            placeholder="Tìm kiếm khách hàng..."
            @input="filterConversations"
          />
        </div>

        <!-- Danh sách conversation -->
        <div class="conversation-list">
          <div
            v-for="conv in filteredConversations"
            :key="conv.conversationId"
            class="conversation-item"
            :class="{ active: selectedConversationId === conv.conversationId }"
            @click="selectConversation(conv)"
          >
            <div class="conversation-avatar">
              <div class="avatar-circle">
                {{ getInitials(conv.khachHangTen) }}
              </div>
              <span v-if="conv.unreadCount > 0" class="unread-badge">{{ conv.unreadCount }}</span>
            </div>
            <div class="conversation-info">
              <div class="conversation-header">
                <span class="conversation-name">{{ conv.khachHangTen }}</span>
                <span class="conversation-time">{{ formatTime(conv.lastMessageTime) }}</span>
              </div>
              <div class="conversation-preview">
                <span class="last-message">{{ getLastMessagePreview(conv.lastMessage) }}</span>
                <span v-if="conv.unreadCount > 0" class="unread-indicator"></span>
              </div>
            </div>
          </div>

          <div v-if="conversations.length === 0" class="empty-state">
            <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
            <p class="text-muted mt-2">Chưa có cuộc trò chuyện nào</p>
          </div>
        </div>
      </div>

      <!-- Main: Chat window -->
      <div class="chat-main">
        <div v-if="selectedConversation" class="chat-window">
          <!-- Chat header -->
          <div class="chat-header">
            <div class="chat-user-info">
              <div class="avatar-circle large">
                {{ getInitials(selectedConversation.khachHangTen) }}
              </div>
              <div class="user-details">
                <h6 class="mb-0">{{ selectedConversation.khachHangTen }}</h6>
                <small class="text-muted">{{ selectedConversation.khachHangMa }}</small>
              </div>
            </div>
            <div class="chat-actions">
              <button class="btn btn-sm btn-outline-secondary" title="Thông tin">
                <i class="bi bi-info-circle"></i>
              </button>
            </div>
          </div>

          <!-- Messages area -->
          <div class="messages-container" ref="messagesContainer">
            <div v-if="isLoadingMessages" class="text-center py-4">
              <div class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else class="messages-list">
              <div
                v-for="(message, index) in messages"
                :key="message.id"
                class="message-wrapper"
                :class="{ 'message-customer': message.isFromCustomer, 'message-staff': !message.isFromCustomer }"
              >
                <!-- Date separator -->
                <div v-if="shouldShowDateSeparator(message, index)" class="date-separator">
                  {{ formatDate(message.ngayPhanHoi) }}
                </div>

                <!-- Message bubble -->
                <div class="message-bubble">
                  <!-- Reply preview (nếu có) -->
                  <div v-if="message.replyTo" class="reply-preview" @click="scrollToMessage(message.replyToId)">
                    <div class="reply-line"></div>
                    <div class="reply-content">
                      <strong>{{ message.replyTo.isFromCustomer ? selectedConversation.khachHangTen : 'Bạn' }}</strong>
                      <p class="mb-0">{{ message.replyTo.noiDung }}</p>
                    </div>
                  </div>

                  <!-- Message content -->
                  <div class="message-content">
                    <!-- File/Image -->
                    <div v-if="message.messageType === 'image' && message.fileUrl" class="message-image">
                      <img :src="message.fileUrl" alt="Image" @click="openImageModal(message.fileUrl)" />
                    </div>
                    <div v-else-if="message.messageType === 'file' && message.fileUrl" class="message-file">
                      <a :href="message.fileUrl" target="_blank" class="file-link">
                        <i class="bi bi-file-earmark"></i>
                        <span>Tải file</span>
                      </a>
                    </div>

                    <!-- Text content -->
                    <p class="message-text" v-html="formatMessage(message.noiDung)"></p>

                    <!-- Message metadata -->
                    <div class="message-meta">
                      <span class="message-time">{{ formatMessageTime(message.ngayPhanHoi) }}</span>
                      <span v-if="!message.isFromCustomer && message.isRead" class="read-indicator">
                        <i class="bi bi-check2-all text-primary"></i>
                      </span>
                      <span v-else-if="!message.isFromCustomer" class="read-indicator">
                        <i class="bi bi-check2 text-muted"></i>
                      </span>
                    </div>
                  </div>

                  <!-- Message actions (hover) -->
                  <div class="message-actions">
                    <button class="btn btn-sm btn-link" @click="replyToMessage(message)" title="Reply">
                      <i class="bi bi-reply"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Typing indicator -->
              <div v-if="isTyping" class="typing-indicator">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Input area -->
          <div class="chat-input-area">
            <!-- Reply preview (khi đang reply) -->
            <div v-if="replyingTo" class="reply-preview-bar">
              <div class="reply-info">
                <i class="bi bi-reply"></i>
                <span>Đang trả lời: {{ replyingTo.noiDung.substring(0, 50) }}...</span>
              </div>
              <button class="btn btn-sm btn-link" @click="cancelReply">
                <i class="bi bi-x"></i>
              </button>
            </div>

            <div class="input-group">
              <button class="btn btn-outline-secondary" @click="toggleEmojiPicker" title="Emoji">
                <i class="bi bi-emoji-smile"></i>
              </button>
              <button class="btn btn-outline-secondary" @click="triggerFileUpload" title="Gửi file">
                <i class="bi bi-paperclip"></i>
              </button>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                accept="image/*,.pdf,.doc,.docx"
                style="display: none"
              />
              <textarea
                class="form-control"
                v-model="newMessage"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.enter.shift.exact="newMessage += '\n'"
                @input="handleTyping"
                placeholder="Nhập tin nhắn..."
                rows="1"
                ref="messageInput"
              ></textarea>
              <button
                class="btn btn-primary"
                @click="sendMessage"
                :disabled="!canSendMessage || isSending"
              >
                <span v-if="isSending" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-send"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-chat">
          <i class="bi bi-chat-dots" style="font-size: 4rem; color: #ccc;"></i>
          <p class="text-muted mt-3">Chọn một cuộc trò chuyện để bắt đầu</p>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="selectedImage" class="image-modal" @click="selectedImage = null">
      <div class="image-modal-content" @click.stop>
        <img :src="selectedImage" alt="Preview" />
        <button class="btn btn-sm btn-danger image-modal-close" @click="selectedImage = null">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { chatService } from '@/service/chat/chatService'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/authStore'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const { success: showSuccess, error: showError } = useToast()
const authStore = useAuthStore()

// State
const conversations = ref([])
const filteredConversations = ref([])
const selectedConversation = ref(null)
const selectedConversationId = ref(null)
const messages = ref([])
const newMessage = ref('')
const searchKeyword = ref('')
const isLoadingMessages = ref(false)
const isSending = ref(false)
const replyingTo = ref(null)
const isTyping = ref(false)
const typingTimeout = ref(null)
const selectedImage = ref(null)
const messagesContainer = ref(null)
const messageInput = ref(null)
const fileInput = ref(null)

// WebSocket
let stompClient = null
let reconnectTimer = null

// Computed
const canSendMessage = computed(() => {
  return newMessage.value.trim().length > 0 && !isSending.value
})

// Methods
const loadConversations = async () => {
  try {
    const response = await chatService.getAllConversations()
    conversations.value = response.data || []
    filteredConversations.value = conversations.value
  } catch (error) {
    console.error('Lỗi khi load conversations:', error)
    showError('Không thể tải danh sách cuộc trò chuyện')
  }
}

const selectConversation = async (conversation) => {
  selectedConversation.value = conversation
  selectedConversationId.value = conversation.conversationId
  replyingTo.value = null

  // Load messages
  await loadMessages(conversation.conversationId)

  // Mark as read
  if (conversation.unreadCount > 0) {
    await markAsRead(conversation.conversationId, false)
    conversation.unreadCount = 0
  }

  // Subscribe to WebSocket
  subscribeToConversation(conversation.conversationId)
}

const loadMessages = async (conversationId) => {
  isLoadingMessages.value = true
  try {
    const response = await chatService.getMessages(conversationId)
    messages.value = response.data || []
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Lỗi khi load messages:', error)
    showError('Không thể tải tin nhắn')
  } finally {
    isLoadingMessages.value = false
  }
}

const sendMessage = async () => {
  // Kiểm tra flag để tránh gọi nhiều lần
  if (!canSendMessage.value || !selectedConversation.value || isSending.value) {
    console.log('⚠️ sendMessage đã được gọi hoặc đang xử lý, bỏ qua')
    return
  }

  const messageText = newMessage.value.trim()
  if (!messageText) return

  // Set flag ngay để tránh gọi lại
  isSending.value = true

  try {
    const messageData = {
      khachHangId: selectedConversation.value.khachHangId,
      nhanVienId: getCurrentStaffId(), // Cần lấy từ auth
      noiDung: messageText,
      conversationId: selectedConversation.value.conversationId,
      messageType: 'text',
      isFromCustomer: false,
      replyToId: replyingTo.value?.id || null
    }

    // CHỈ gửi qua WebSocket nếu đã kết nối, KHÔNG gửi cả 2
    if (stompClient && stompClient.connected) {
      // Gửi qua WebSocket (sẽ được xử lý bởi ChatWebSocketController)
      // Message sẽ được thêm từ WebSocket subscription, không cần thêm ở đây
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(messageData)
      })
      
      // Clear input ngay
      newMessage.value = ''
      replyingTo.value = null
      
      // Message sẽ được thêm từ WebSocket subscription
      // Không cần scrollToBottom ở đây vì sẽ được gọi trong subscription
    } else {
      // Fallback: Gửi qua REST API nếu WebSocket chưa kết nối
      const response = await chatService.sendMessage(messageData)
      
      // Kiểm tra duplicate trước khi thêm
      if (response.data) {
        const existingIndex = messages.value.findIndex(m => 
          m.id === response.data.id || 
          (m.noiDung === response.data.noiDung && 
           m.isFromCustomer === response.data.isFromCustomer &&
           m.ngayPhanHoi && response.data.ngayPhanHoi &&
           Math.abs(new Date(m.ngayPhanHoi) - new Date(response.data.ngayPhanHoi)) < 1000)
        )
        
        if (existingIndex === -1) {
          messages.value.push(response.data)
          await nextTick()
          scrollToBottom()
        }
      } else {
        // Reload messages nếu không có data
        await loadMessages(selectedConversation.value.conversationId)
      }
      
      newMessage.value = ''
      replyingTo.value = null
    }
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error)
    showError('Không thể gửi tin nhắn')
  } finally {
    isSending.value = false
  }
}

const markAsRead = async (conversationId, isFromCustomer) => {
  try {
    await chatService.markAsRead(conversationId, isFromCustomer)
  } catch (error) {
    console.error('Lỗi khi đánh dấu đã đọc:', error)
  }
}

const replyToMessage = (message) => {
  replyingTo.value = message
  messageInput.value?.focus()
}

const cancelReply = () => {
  replyingTo.value = null
}

const handleTyping = () => {
  if (!selectedConversation.value) return

  // Gửi typing indicator
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({
        conversationId: selectedConversation.value.conversationId,
        userId: getCurrentStaffId(),
        userName: 'Nhân viên',
        isTyping: true
      })
    })
  }

  // Clear previous timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  // Set timeout để stop typing
  typingTimeout.value = setTimeout(() => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({
          conversationId: selectedConversation.value.conversationId,
          userId: getCurrentStaffId(),
          userName: 'Nhân viên',
          isTyping: false
        })
      })
    }
  }, 1000)
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // TODO: Upload file và lấy URL
  // Tạm thời chỉ hỗ trợ text
  showError('Tính năng gửi file đang được phát triển')
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const scrollToMessage = (messageId) => {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
  if (messageElement) {
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    messageElement.classList.add('highlight')
    setTimeout(() => {
      messageElement.classList.remove('highlight')
    }, 2000)
  }
}

const filterConversations = () => {
  if (!searchKeyword.value.trim()) {
    filteredConversations.value = conversations.value
    return
  }

  const keyword = searchKeyword.value.toLowerCase()
  filteredConversations.value = conversations.value.filter(conv =>
    conv.khachHangTen.toLowerCase().includes(keyword) ||
    conv.khachHangMa?.toLowerCase().includes(keyword) ||
    conv.lastMessage?.noiDung?.toLowerCase().includes(keyword)
  )
}

const refreshConversations = async () => {
  await loadConversations()
  showSuccess('Đã làm mới danh sách')
}

// WebSocket setup
const connectWebSocket = () => {
  const socket = new SockJS('http://localhost:8080/ws')
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('✅ WebSocket connected')
      if (selectedConversationId.value) {
        subscribeToConversation(selectedConversationId.value)
      }
    },
    onStompError: (frame) => {
      console.error('❌ WebSocket error:', frame)
    },
    onDisconnect: () => {
      console.log('🔌 WebSocket disconnected')
    }
  })

  stompClient.activate()
}

const subscribeToConversation = (conversationId) => {
  if (!stompClient || !stompClient.connected || !conversationId) return

  // Unsubscribe trước nếu đã subscribe để tránh duplicate subscription
  const existingSubs = Object.keys(stompClient.subscriptions || {})
  existingSubs.forEach(subId => {
    if (subId.includes(`conversation/${conversationId}`) && !subId.includes('/typing') && !subId.includes('/read')) {
      stompClient.unsubscribe(subId)
      console.log('🔌 Unsubscribed old subscription:', subId)
    }
  })

  // Subscribe to new messages với duplicate check chặt chẽ
  const subscription = stompClient.subscribe(`/topic/conversation/${conversationId}`, (message) => {
    try {
      const newMsg = JSON.parse(message.body)
      
      // KIỂM TRA DUPLICATE CHẶT CHẼ: cả ID và nội dung + thời gian
      const existingIndex = messages.value.findIndex(m => {
        // Kiểm tra theo ID (chính xác nhất)
        if (m.id && newMsg.id && m.id === newMsg.id) {
          return true
        }
        // Kiểm tra theo nội dung + người gửi + thời gian (trong vòng 2 giây)
        if (m.noiDung === newMsg.noiDung && 
            m.isFromCustomer === newMsg.isFromCustomer &&
            m.ngayPhanHoi && newMsg.ngayPhanHoi) {
          const timeDiff = Math.abs(new Date(m.ngayPhanHoi) - new Date(newMsg.ngayPhanHoi))
          if (timeDiff < 2000) { // Cùng thời gian (2 giây)
            return true
          }
        }
        return false
      })
      
      if (existingIndex === -1) {
        // Chưa có, thêm mới
        messages.value.push(newMsg)
        nextTick(() => scrollToBottom())
        console.log('✅ Thêm message mới:', newMsg.id)
        
        // Mark as read if from customer
        if (newMsg.isFromCustomer) {
          markAsRead(conversationId, false)
        }
      } else {
        // Đã có, chỉ cập nhật (KHÔNG thêm mới)
        console.log('⚠️ Duplicate message detected, updating existing:', {
          existingId: messages.value[existingIndex].id,
          newId: newMsg.id,
          content: newMsg.noiDung
        })
        messages.value[existingIndex] = newMsg
        nextTick(() => scrollToBottom())
      }
    } catch (error) {
      console.error('❌ Lỗi khi parse message từ WebSocket:', error)
    }
  })
  
  console.log('✅ Subscribed to conversation:', conversationId, 'Subscription ID:', subscription.id)

  // Subscribe to typing indicator
  stompClient.subscribe(`/topic/conversation/${conversationId}/typing`, (message) => {
    const typing = JSON.parse(message.body)
    if (typing.isTyping && typing.userId !== getCurrentStaffId()) {
      isTyping.value = true
      setTimeout(() => {
        isTyping.value = false
      }, 3000)
    } else {
      isTyping.value = false
    }
  })
}

// Helper functions
const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ`
  return d.toLocaleDateString('vi-VN')
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) {
    return 'Hôm nay'
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua'
  } else {
    return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
}

const formatMessageTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const formatMessage = (text) => {
  if (!text) return ''
  // Convert URLs to links
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
}

const getLastMessagePreview = (lastMessage) => {
  if (!lastMessage) return 'Chưa có tin nhắn'
  if (lastMessage.messageType === 'image') return '📷 Hình ảnh'
  if (lastMessage.messageType === 'file') return '📎 File đính kèm'
  return lastMessage.noiDung || 'Chưa có tin nhắn'
}

const shouldShowDateSeparator = (message, index) => {
  if (index === 0) return true
  const currentDate = new Date(message.ngayPhanHoi).toDateString()
  const prevDate = new Date(messages.value[index - 1].ngayPhanHoi).toDateString()
  return currentDate !== prevDate
}

const getCurrentStaffId = () => {
  // Lấy từ authStore
  return authStore.getUserId || authStore.user?.userId || authStore.user?.user_id || localStorage.getItem('currentNhanVienId') || null
}

const openImageModal = (imageUrl) => {
  selectedImage.value = imageUrl
}

const toggleEmojiPicker = () => {
  // TODO: Implement emoji picker
  showError('Tính năng emoji đang được phát triển')
}

// Lifecycle
onMounted(async () => {
  await loadConversations()
  connectWebSocket()
})

onUnmounted(() => {
  if (stompClient) {
    stompClient.deactivate()
  }
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>

<style scoped>
.chat-management-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.chat-layout {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Sidebar */
.chat-sidebar {
  width: 350px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.search-box {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
  background: #fff;
}

.conversation-item:hover {
  background: #f5f5f5;
}

.conversation-item.active {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.conversation-avatar {
  position: relative;
  margin-right: 12px;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.avatar-circle.large {
  width: 56px;
  height: 56px;
  font-size: 18px;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f44336;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.conversation-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: 8px;
}

.conversation-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.last-message {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #2196f3;
  border-radius: 50%;
  margin-left: 8px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

/* Chat Main */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details h6 {
  font-size: 16px;
  font-weight: 600;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f5f5f5;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
}

.message-wrapper.message-customer {
  align-items: flex-start;
}

.message-wrapper.message-staff {
  align-items: flex-end;
}

.date-separator {
  text-align: center;
  margin: 16px 0;
  color: #999;
  font-size: 12px;
  position: relative;
}

.date-separator::before,
.date-separator::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e0e0e0;
}

.date-separator::before {
  left: 0;
}

.date-separator::after {
  right: 0;
}

.message-bubble {
  max-width: 70%;
  position: relative;
  padding: 8px 12px;
  border-radius: 18px;
  word-wrap: break-word;
}

.message-customer .message-bubble {
  background: #fff;
  border-bottom-left-radius: 4px;
}

.message-staff .message-bubble {
  background: #2196f3;
  color: white;
  border-bottom-right-radius: 4px;
}

.reply-preview {
  background: rgba(0, 0, 0, 0.05);
  border-left: 3px solid #2196f3;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.reply-line {
  width: 2px;
  height: 100%;
  background: #2196f3;
  position: absolute;
  left: 0;
  top: 0;
}

.message-content {
  position: relative;
}

.message-image img {
  max-width: 300px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
}

.message-file {
  padding: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.file-link {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-text {
  margin: 0;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-text :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.7;
}

.read-indicator {
  margin-left: 4px;
}

.message-actions {
  position: absolute;
  top: -8px;
  right: -8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.typing-indicator {
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input-area {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

.reply-preview-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-left: 3px solid #2196f3;
  margin-bottom: 8px;
  border-radius: 4px;
  font-size: 13px;
}

.reply-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-group {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input-group textarea {
  resize: none;
  min-height: 40px;
  max-height: 120px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.image-modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.image-modal-close {
  position: absolute;
  top: -40px;
  right: 0;
}

/* Scrollbar */
.conversation-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.conversation-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.conversation-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.conversation-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Highlight animation */
@keyframes highlight {
  0% {
    background: #fff3cd;
  }
  100% {
    background: transparent;
  }
}

.message-wrapper.highlight {
  animation: highlight 2s ease-out;
}
</style>

