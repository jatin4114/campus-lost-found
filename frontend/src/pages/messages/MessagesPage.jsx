import { Link } from 'react-router-dom'
import { ListSkeleton } from '../../components/common/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useConversations } from '../../services/conversationsApi'

export function MessagesPage() {
  const { user } = useAuth()
  const { data: conversations, isLoading } = useConversations()

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">Messages</h1>
      {isLoading && <div className="mt-6"><ListSkeleton /></div>}
      {conversations && conversations.length === 0 && (
        <p className="mt-8 text-slate-500">No conversations yet — they open once a claim is accepted.</p>
      )}
      {!isLoading && (
        <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {conversations?.map((conversation) => {
            const other = conversation.participants.find((p) => p.userId !== user?.id)?.user
            return (
              <Link
                key={conversation.id}
                to={`/messages/${conversation.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{other?.name ?? 'Conversation'}</p>
                  <p className="text-sm text-slate-500">{conversation.claim?.item?.title}</p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
