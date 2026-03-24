'use client'

import { useState } from 'react'
import { addComment, deleteComment } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { MessageSquare, Trash2, CornerDownRight } from 'lucide-react'

type User = { id: string; name: string; color: string }
type Reply = { id: string; body: string; createdAt: Date; user: User }
type Comment = { id: string; body: string; createdAt: Date; user: User; replies: Reply[] }

interface Props {
  comments: Comment[]
  users: User[]
  taskId: string
  projectId: string
}

export function CommentThread({ comments, users, taskId, projectId }: Props) {
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState(users[0]?.id ?? '')

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare size={16} /> Comments ({comments.reduce((n, c) => n + 1 + c.replies.length, 0)})
      </h3>

      {/* Top-level comments */}
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-2">
          <CommentBubble
            comment={comment}
            taskId={taskId}
            projectId={projectId}
            onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
          />
          {/* Replies */}
          {comment.replies.map((reply) => (
            <div key={reply.id} className="ml-8 flex items-start gap-2">
              <CornerDownRight size={14} className="mt-2 text-muted-foreground shrink-0" />
              <CommentBubble comment={reply} taskId={taskId} projectId={projectId} />
            </div>
          ))}
          {/* Reply form */}
          {replyTo === comment.id && (
            <div className="ml-8">
              <AddCommentForm
                taskId={taskId}
                projectId={projectId}
                users={users}
                parentId={comment.id}
                selectedUser={selectedUser}
                onChangeUser={setSelectedUser}
                onDone={() => setReplyTo(null)}
                compact
              />
            </div>
          )}
        </div>
      ))}

      {/* New comment */}
      <AddCommentForm
        taskId={taskId}
        projectId={projectId}
        users={users}
        selectedUser={selectedUser}
        onChangeUser={setSelectedUser}
      />
    </div>
  )
}

function CommentBubble({
  comment, taskId, projectId, onReply,
}: {
  comment: { id: string; body: string; createdAt: Date; user: User }
  taskId: string
  projectId: string
  onReply?: () => void
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="size-5 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0"
          style={{ background: comment.user.color }}
        >
          {comment.user.name[0]}
        </span>
        <span className="text-sm font-medium">{comment.user.name}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
        </span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
      <div className="flex gap-2 mt-2">
        {onReply && (
          <button onClick={onReply} className="text-xs text-muted-foreground hover:text-foreground">
            Reply
          </button>
        )}
        <form action={deleteComment.bind(null, comment.id, taskId, projectId)}>
          <button type="submit" className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
            <Trash2 size={11} /> Delete
          </button>
        </form>
      </div>
    </div>
  )
}

function AddCommentForm({
  taskId, projectId, users, parentId, selectedUser, onChangeUser, onDone, compact,
}: {
  taskId: string
  projectId: string
  users: User[]
  parentId?: string
  selectedUser: string
  onChangeUser: (id: string) => void
  onDone?: () => void
  compact?: boolean
}) {
  const [body, setBody] = useState('')

  async function handleSubmit() {
    if (!body.trim()) return
    const fd = new FormData()
    fd.append('taskId', taskId)
    fd.append('projectId', projectId)
    fd.append('userId', selectedUser)
    fd.append('body', body)
    if (parentId) fd.append('parentId', parentId)
    await addComment(fd)
    setBody('')
    onDone?.()
  }

  return (
    <div className="space-y-2">
      {!compact && (
        <select
          value={selectedUser}
          onChange={(e) => onChangeUser(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      )}
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={compact ? 'Write a reply...' : 'Add a comment...'}
        rows={compact ? 2 : 3}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!body.trim()}>
          {compact ? 'Reply' : 'Comment'}
        </Button>
        {onDone && <Button size="sm" variant="ghost" onClick={onDone}>Cancel</Button>}
      </div>
    </div>
  )
}
