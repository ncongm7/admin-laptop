<template>
    <div v-if="quickReplies && quickReplies.length > 0" class="quick-replies-container">
        <div class="quick-replies-label">💡 Gợi ý:</div>
        <div class="quick-replies-buttons">
            <button v-for="reply in quickReplies" :key="reply.id" class="quick-reply-btn"
                @click="handleQuickReply(reply)">
                <i v-if="reply.icon" :class="reply.icon"></i>
                {{ reply.replyText }}
            </button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    quickReplies: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['select'])

const handleQuickReply = (reply) => {
    emit('select', reply)
}
</script>

<style scoped>
.quick-replies-container {
    padding: 12px 16px;
    background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fc 100%);
    border-top: 1px solid #e0e6ed;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.quick-replies-label {
    font-size: 12px;
    color: #667eea;
    margin-bottom: 10px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
}

.quick-replies-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.quick-reply-btn {
    padding: 10px 18px;
    background: white;
    border: 1.5px solid #d0d7de;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 500;
    color: #444;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.quick-reply-btn i {
    font-size: 14px;
    opacity: 0.8;
}

.quick-reply-btn:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.quick-reply-btn:hover i {
    opacity: 1;
}

.quick-reply-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

/* Responsive */
@media (max-width: 576px) {
    .quick-replies-container {
        padding: 10px 12px;
    }

    .quick-reply-btn {
        padding: 8px 14px;
        font-size: 12px;
    }
}
</style>
