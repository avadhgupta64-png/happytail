import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, Shield, User } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface FeedbackEntry {
  id: number;
  userId: string;
  userName: string;
  message: string;
  adminComment: string | null;
  createdAt: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function AdminCommentBox({ entry }: { entry: FeedbackEntry }) {
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/feedback/${entry.id}/comment`, { adminComment: comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      setEditing(false);
      setComment("");
      toast({ title: "Comment added" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  if (!editing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-primary mt-2"
        onClick={() => {
          setComment(entry.adminComment || "");
          setEditing(true);
        }}
        data-testid={`button-admin-comment-${entry.id}`}
      >
        <Shield className="w-3.5 h-3.5 mr-1" />
        {entry.adminComment ? "Edit response" : "Respond as admin"}
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a response..."
        className="text-sm"
        rows={2}
        data-testid={`input-admin-comment-${entry.id}`}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!comment.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
          data-testid={`button-submit-comment-${entry.id}`}
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function FeedbackCard({ entry, isAdmin }: { entry: FeedbackEntry; isAdmin: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-feedback-user-${entry.id}`}>
                {entry.userName}
              </p>
              <span className="text-xs text-muted-foreground shrink-0">{formatDate(entry.createdAt)}</span>
            </div>
            <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap" data-testid={`text-feedback-message-${entry.id}`}>
              {entry.message}
            </p>

            {entry.adminComment && (
              <div className="mt-3 rounded-xl bg-primary/5 border border-primary/10 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Admin</Badge>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap" data-testid={`text-admin-comment-${entry.id}`}>
                  {entry.adminComment}
                </p>
              </div>
            )}

            {isAdmin && <AdminCommentBox entry={entry} />}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Feedback() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: feedbackList, isLoading } = useQuery<FeedbackEntry[]>({
    queryKey: ["/api/feedback"],
  });

  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/feedback", { message: message.trim() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      setMessage("");
      toast({ title: "Thanks for your feedback!" });
    },
    onError: () => {
      toast({ title: "Failed to submit feedback", variant: "destructive" });
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Feedback"
        description="Share your thoughts, report issues, or suggest improvements. Everyone can see feedback and our team's responses."
      />

      <Card className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">
            Posting as {user?.firstName || user?.email?.split("@")[0] || "you"}
          </p>
        </div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind? Bugs, ideas, praise — it all helps."
          rows={3}
          data-testid="input-feedback-message"
        />
        <div className="flex justify-end mt-3">
          <Button
            disabled={!message.trim() || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            data-testid="button-submit-feedback"
          >
            <Send className="w-4 h-4 mr-1.5" />
            {submitMutation.isPending ? "Sending..." : "Send Feedback"}
          </Button>
        </div>
      </Card>

      {isLoading && <p className="text-sm text-muted-foreground text-center py-8">Loading feedback...</p>}

      {!isLoading && feedbackList?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No feedback yet. Be the first to share!</p>
      )}

      <div className="space-y-3">
        {feedbackList?.map((entry) => (
          <FeedbackCard key={entry.id} entry={entry} isAdmin={!!adminCheck?.isAdmin} />
        ))}
      </div>
    </div>
  );
}
