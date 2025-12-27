import { useState } from 'react';
import { UserIcon, LogOut, Loader } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from '../services/firebase.js';
const AuthTab = ({ user, isDark }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase not configured.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className={`rounded-xl shadow-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <UserIcon className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-gray-500 mb-6">{user.email}</p>
        <button 
          onClick={() => signOut(auth)}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition flex items-center justify-center mx-auto"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto rounded-xl shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">{isSignUp ? 'Create Account' : 'Farmer Login'}</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
        >
          {loading ? <Loader className="animate-spin mx-auto"/> : (isSignUp ? 'Sign Up' : 'Login')}
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-green-600 font-bold ml-1 hover:underline"
        >
          {isSignUp ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};
export default AuthTab;

const auth = getAuth(app);