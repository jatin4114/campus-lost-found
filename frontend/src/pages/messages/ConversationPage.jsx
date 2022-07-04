import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiClient } from '../../lib/apiClient'
import { getSocket } from '../../lib/socket'
import { useConversation, useMessages } from '../../services/conversationsApi'

export function ConversationPage() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const { data: conversation } = useConversation(conversationId)
  const { data: initialMessages, isLoading } = useMessages(conversationId)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [typingUser, setTypingUser] = useState(null)
  const bottomRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    if (!conversationId) return undefined
    const socket = getSocket()
    if (!socket.connected) socket.connect()

    socket.emit('conversation:join', conversationId)

    function onMessage({ conversationId: incomingId, message }) {
      if (incomingId !== conversationId) return
      setMessages((prev) => [...prev, message])
    }

    function onTyping({ conversationId: incomingId, userId, isTyping }) {
      if (incomingId !== conversationId || userId === user?.id) return
      setTypingUser(isTyping ? userId : null)
    }

    socket.on('message:new', onMessage)
    socket.on('typing', onTyping)

    apiClient.post(`/conversations/${conversationId}/read`).catch(() => {})

    return () => {
      socket.off('message:new', onMessage)
      socket.off('typing', onTyping)
    }
  }, [conversationId, user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleTyping(value) {
    setDraft(value)
    const socket = getSocket()
    socket.emit('typing', { conversationId, isTyping: true })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId, isTyping: false })
    }, 1500)
  }

  function handleSend(e) {
    e.preventDefault()
    if (!draft.trim()) return
    const socket = getSocket()
    socket.emit('message:send', { conversationId, body: draft.trim() })
    setDraft('')
  }

  const other = conversation?.participants.find((p) => p.userId !== user?.id)?.user

  return (
    <div className="mx-auto flex h-[70vh] max-w-xl flex-col rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <p className="font-medium text-slate-900">{other?.name ?? 'Conversation'}</p>
        <p className="text-sm text-slate-500">{conversation?.claim?.item?.title}</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {isLoading && <p className="text-slate-500">Loading…</p>}
        {messages.map((message) => {
          const mine = message.senderId === user?.id
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  mine ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p>{message.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? 'text-slate-300' : 'text-slate-400'}`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        {typingUser && <p className="text-xs italic text-slate-400">{other?.name ?? 'They'} are typing…</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          value={draft}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Send
        </button>
      </form>
    </div>
  )
}
