'use client'

import { useState } from 'react'
import { addComment, deleteComment } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { MessageSquare, Trash2, CornerDownRight, Reply as ReplyIcon, Send } from 'lucide-react'

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
    <div className="space-y-8">
      {/* Top-level comments */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <CommentBubble
              comment={comment}
              taskId={taskId}
              projectId={projectId}
              onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            />
            
            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-8 space-y-4 border-l-2 border-border/40 pl-6 pb-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="relative">
                    <div className="absolute -left-[50px] top-6 text-border/60">
                      <CornerDownRight size={16} />
                    </div>
                    <CommentBubble comment={reply} taskId={taskId} projectId={projectId} isReply />
                  </div>
                ))}
              </div>
            )}
            
            {/* Reply form */}
            {replyTo === comment.id && (
              <div className="ml-14 animate-in fade-in slide-in-from-top-2">
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

        {comments.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-border/40 rounded-3xl">
            <MessageSquare className="size-8 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No comments yet. Start the discussion!</p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-border/40">
        <h4 className="text-sm font-bold tracking-tight mb-4">Leave a comment</h4>
        {/* New comment */}
        <AddCommentForm
          taskId={taskId}
          projectId={projectId}
          users={users}
          selectedUser={selectedUser}
          onChangeUser={setSelectedUser}
        />
      </div>
    </div>
  )
}

function CommentBubble({
  comment, taskId, projectId, onReply, isReply = false
}: {
  comment: { id: string; body: string; createdAt: Date; user: User }
  taskId: string
  projectId: string
  onReply?: () => void
  isReply?: boolean
}) {
  return (
    <div className={`group flex gap-4 ${isReply ? '' : 'items-start'}`}>
      <div className="relative shrink-0 pt-1">
        <span
          className="size-10 rounded-full text-white text-sm flex items-center justify-center font-bold shadow-sm ring-2 ring-background"
          style={{ background: comment.user.color }}
        >
          {comment.user.name.substring(0, 2).toUpperCase()}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-bold text-foreground">{comment.user.name}</span>
          <span className="text-[11px] font-medium text-muted-foreground">
            {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
          </span>
        </div>
        
        <div className="bg-muted/30 border border-border/40 rounded-2xl rounded-tl-sm p-4 text-sm text-foreground/90 leading-relaxed shadow-sm">
          {comment.body}
        </div>
        
        <div className="flex items-center gap-4 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onReply && (
            <button onClick={onReply} className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors">
              <ReplyIcon size={12} /> Reply
            </button>
          )}
          <form action={deleteComment.bind(null, comment.id, taskId, projectId)}>
            <button type="submit" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors">
              <Trash2 size={12} /> Delete
            </button>
          </form>
        </div>
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    if (!body.trim() || isSubmitting) return
    setIsSubmitting(true)
    const fd = new FormData()
    fd.append('taskId', taskId)
    fd.append('projectId', projectId)
    fd.append('userId', selectedUser)
    fd.append('body', body)
    if (parentId) fd.append('parentId', parentId)
    await addComment({}, fd)
    setBody('')
    setIsSubmitting(false)
    onDone?.()
  }

  return (
    <div className={`space-y-3 ${compact ? 'bg-muted/10 p-4 rounded-2xl border border-border/30' : ''}`}>
      <div className="relative">
        <div className="absolute left-3 top-3">
          <select
            value={selectedUser}
            onChange={(e) => onChangeUser(e.target.value)}
            className="appearance-none bg-transparent border-none text-[11px] font-bold uppercase tracking-widest text-muted-foreground focus:ring-0 cursor-pointer"
            style={{ width: '120px' }}
          >
            {users.map((u) => <option key={u.id} value={u.id}>AS: {u.name.split(' ')[0]}</option>)}
          </select>
           <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-muted-foreground">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
           </div>
        </div>
        
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={compact ? 'Write a reply...' : 'What are your thoughts?'}
          rows={compact ? 2 : 3}
          className="resize-none pt-10 rounded-xl border-border/60 bg-background/50 focus-visible:ring-primary/30 shadow-sm transition-all hover:bg-background/80"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onDone && (
          <Button size="sm" variant="ghost" className="rounded-xl font-bold rounded-xl" onClick={onDone}>
            Cancel
          </Button>
        )}
        <Button 
          size="sm" 
          onClick={handleSubmit} 
          disabled={!body.trim() || isSubmitting}
          className="rounded-xl font-bold tracking-wide shadow-sm gap-2"
        >
          <Send size={14} />
          {compact ? 'Reply' : 'Post Comment'}
        </Button>
      </div>
    </div>
  )
}
