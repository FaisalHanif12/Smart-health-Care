import { useEffect, useMemo, useRef, useState } from 'react';
import { getAPIBaseURL } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

interface UserLite { _id: string; name?: string; email?: string }
interface Comment { _id: string; user: UserLite; text: string; createdAt: string }
interface PostItem { _id: string; user: UserLite; caption?: string; imageUrl: string; likes: string[]; comments: Comment[]; createdAt: string }

export default function CommunityContent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const API = getAPIBaseURL();
  const ORIGIN = useMemo(() => API.replace(/\/api$/, ''), [API]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/posts`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setPosts(json.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const onUpload = async () => {
    if (!image) return;
    setIsSubmitting(true);
    const form = new FormData();
    form.append('image', image);
    form.append('caption', caption);
    const res = await fetch(`${API}/posts`, { method: 'POST', body: form, credentials: 'include' });
    const json = await res.json();
    setIsSubmitting(false);
    if (json.success) {
      setCaption('');
      setImage(null);
      setPreviewUrl(null);
      setPosts((p) => [json.data, ...p]);
    }
  };

  const toggleLike = async (id: string) => {
    const res = await fetch(`${API}/posts/${id}/like`, { method: 'POST', credentials: 'include' });
    const json = await res.json();
    if (json.success) {
      setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, likes: json.data.likes } : p)));
    }
  };

  const addComment = async (id: string, text: string) => {
    const res = await fetch(`${API}/posts/${id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), credentials: 'include' });
    const json = await res.json();
    if (json.success) {
      setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, comments: [...p.comments, json.data] } : p)));
    }
  };

  return (
    <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Community</h1>
        <p className="text-gray-600 dark:text-gray-300">Share your transformation and cheer on others.</p>
      </div>

      {/* Uploader */}
      <div className="mb-10">
        <div
          className={`relative rounded-2xl border-2 ${dragActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-dashed border-gray-300 dark:border-gray-600'} p-5 sm:p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur shadow-sm`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) { setImage(f); setPreviewUrl(URL.createObjectURL(f)); } }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button onClick={() => inputRef.current?.click()} className="shrink-0 inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-black/80">
              <span>Upload</span>
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; setImage(f); setPreviewUrl(f ? URL.createObjectURL(f) : null); }} />
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption" className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            <button onClick={onUpload} disabled={!image || isSubmitting} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md shadow">
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
          {previewUrl && (
            <div className="mt-4">
              <img src={previewUrl} alt="Preview" className="h-36 w-auto rounded-md object-cover border border-gray-200 dark:border-gray-700" />
            </div>
          )}
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-300">No posts yet. Be the first to share your journey!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => {
            const liked = user && p.likes.some((id) => id === user._id);
            return (
              <article key={p._id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative">
                  {p.imageUrl && (
                    <img src={`${p.imageUrl.startsWith('http') ? p.imageUrl : ORIGIN + p.imageUrl}`} alt={p.caption || 'Post image'} className="w-full h-64 object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{p.user?.name || p.user?.email}</div>
                    <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                  {p.caption && <p className="mt-2 text-gray-700 dark:text-gray-200">{p.caption}</p>}
                  <div className="mt-3 flex items-center gap-4">
                    <button onClick={() => toggleLike(p._id)} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${liked ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      <span>❤</span>
                      <span>{p.likes.length}</span>
                    </button>
                    <span className="text-xs text-gray-400">{p.comments.length} comments</span>
                  </div>
                  <div className="mt-3 space-y-2 max-h-32 overflow-y-auto pr-1">
                    {p.comments.map((c) => (
                      <div key={c._id} className="text-sm text-gray-700 dark:text-gray-200"><span className="font-medium">{c.user?.name || 'User'}:</span> {c.text}</div>
                    ))}
                  </div>
                  <CommentBox onSubmit={(text) => addComment(p._id, text)} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function CommentBox({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="mt-3 flex items-center gap-2">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment" className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
      <button onClick={() => { if (text.trim()) { onSubmit(text.trim()); setText(''); } }} className="text-sm bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded-md">Comment</button>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="h-64 bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}


