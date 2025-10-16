import { useEffect, useState } from 'react';
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
  const API = getAPIBaseURL();

  const fetchPosts = async () => {
    const res = await fetch(`${API}/posts`, { credentials: 'include' });
    const json = await res.json();
    if (json.success) setPosts(json.data);
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
    <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Community</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Share your transformation and cheer on others.</p>

      {/* Uploader */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-700 dark:text-gray-200" />
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption" className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
          <button onClick={onUpload} disabled={!image || isSubmitting} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md">{isSubmitting ? 'Posting...' : 'Post'}</button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((p) => {
          const liked = user && p.likes.some((id) => id === user._id);
          return (
            <article key={p._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.caption || 'Post image'} className="w-full max-h-[480px] object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300">{p.user?.name || p.user?.email}</div>
                  <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                {p.caption && <p className="mt-2 text-gray-800 dark:text-gray-100">{p.caption}</p>}
                <div className="mt-3 flex items-center gap-4">
                  <button onClick={() => toggleLike(p._id)} className={`flex items-center gap-1 text-sm ${liked ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
                    <span>❤</span>
                    <span>{p.likes.length}</span>
                  </button>
                </div>
                <div className="mt-4 space-y-2">
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


