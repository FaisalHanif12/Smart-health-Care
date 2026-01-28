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
  const [activeTab, setActiveTab] = useState<'yours' | 'others'>('yours');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const API = getAPIBaseURL();
  const BACKEND_ORIGIN = useMemo(() => {
    try {
      // Robustly extract protocol+host even if API contains paths like /api or query params
      return new URL(API).origin;
    } catch {
      return API.replace(/\/api\/?$/, '');
    }
  }, [API]);
  const myUserId = user?._id;

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/posts`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
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
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/posts`, {
      method: 'POST',
      body: form,
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
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
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/posts/${id}/like`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const json = await res.json();
    if (json.success) {
      setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, likes: json.data.likes } : p)));
    }
  };

  const addComment = async (id: string, text: string) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API}/posts/${id}/comments`, { method: 'POST', headers, body: JSON.stringify({ text }), credentials: 'include' });
    const json = await res.json();
    if (json.success) {
      setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, comments: [...p.comments, json.data] } : p)));
    }
  };

  const deletePost = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API}/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const json = await res.json();
    if (json.success) {
      setPosts((prev) => prev.filter((p) => p._id !== id));
      setShowDeleteModal(null);
    }
  };

  const myPosts = useMemo(() => posts.filter((p) => (p.user && p.user._id) === myUserId), [posts, myUserId]);
  const otherPosts = useMemo(() => posts.filter((p) => (p.user && p.user._id) !== myUserId), [posts, myUserId]);
  const displayPosts = activeTab === 'yours' ? myPosts : otherPosts;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Share your transformation journey and connect with others</p>
      </div>

        {/* Create Post Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create a Post</h2>
            <div 
              className={`border-2 ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-dashed border-gray-300 dark:border-gray-700'} rounded-lg p-4 transition-all`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { 
                e.preventDefault(); 
                setDragActive(false); 
                const f = e.dataTransfer.files?.[0]; 
                if (f) { 
                  setImage(f); 
                  setPreviewUrl(URL.createObjectURL(f)); 
                } 
              }}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <input 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)} 
                    placeholder="What's on your mind?" 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                {previewUrl && (
                  <div className="relative mt-2">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="rounded-lg max-h-80 mx-auto object-contain"
                    />
                    <button 
                      onClick={() => { setPreviewUrl(null); setImage(null); }} 
                      className="absolute top-2 right-2 bg-gray-800/70 text-white rounded-full p-1 hover:bg-gray-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => inputRef.current?.click()} 
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Photo
                    <input 
                      ref={inputRef} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => { 
                        const f = e.target.files?.[0] || null; 
                        setImage(f); 
                        setPreviewUrl(f ? URL.createObjectURL(f) : null); 
                      }} 
                    />
            </button>
                  <button 
                    onClick={onUpload} 
                    disabled={!image || isSubmitting} 
                    className={`px-4 py-2 rounded-lg font-medium ${!image || isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition-colors`}
                  >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('yours')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'yours'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Your Posts {myPosts.length > 0 && `(${myPosts.length})`}
              </button>
              <button
                onClick={() => setActiveTab('others')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'others'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Community {otherPosts.length > 0 && `(${otherPosts.length})`}
              </button>
            </div>
        </div>
      </div>

        {/* Posts */}
      {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {activeTab === 'yours' ? 'No posts yet' : 'No community posts yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'yours' 
                ? 'Share your fitness journey by creating your first post above!' 
                : 'Be the first to share and inspire others in the community!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {displayPosts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                currentUserId={myUserId || ''} 
                ORIGIN={BACKEND_ORIGIN} 
                onLike={toggleLike} 
                onComment={addComment}
                onDelete={activeTab === 'yours' ? () => setShowDeleteModal(post._id) : undefined}
              />
            ))}
          </div>
                  )}
                </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Delete Post</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowDeleteModal(null)} 
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={() => deletePost(showDeleteModal)} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Delete
                    </button>
                  </div>
                </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ 
  post, 
  currentUserId, 
  ORIGIN, 
  onLike, 
  onComment,
  onDelete 
}: { 
  post: PostItem; 
  currentUserId: string; 
  ORIGIN: string; 
  onLike: (id: string) => void; 
  onComment: (id: string, text: string) => void;
  onDelete?: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const liked = !!currentUserId && post.likes.some((id) => id === currentUserId);
  const src = post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : ORIGIN + post.imageUrl) : '';
  const isOwnPost = post.user?._id === currentUserId;
  
  // Format date nicely
  const formattedDate = useMemo(() => {
    const date = new Date(post.createdAt);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  }, [post.createdAt]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-medium">
            {(post.user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {post.user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</div>
          </div>
        </div>
        {isOwnPost && onDelete && (
          <button 
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-gray-800 dark:text-gray-200">{post.caption}</p>
        </div>
      )}
      
      {/* Image */}
      {src && (
        <div className="relative bg-gray-100 dark:bg-gray-900">
          <img 
            src={src} 
            alt={post.caption || 'Post image'} 
            className="w-full object-contain max-h-[500px]" 
          />
        </div>
      )}
      
      {/* Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onLike(post._id)} 
              className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={liked ? 0 : 2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes.length}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)} 
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments.length}</span>
            </button>
          </div>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                      {(comment.user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.user?.email?.split('@')[0] || 'User'}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 text-sm">{comment.text}</p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 ml-2">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-2">No comments yet</div>
              )}
            </div>
            
            {/* Add Comment */}
            <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                  {(currentUserId ? currentUserId.charAt(0) : 'G').toUpperCase()}
                </span>
              </div>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    onComment(post._id, commentText.trim());
                    setCommentText('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (commentText.trim()) {
                    onComment(post._id, commentText.trim());
                    setCommentText('');
                  }
                }}
                disabled={!commentText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-full p-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
          </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-4">
        <div className="flex space-x-4">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}