import ShareMealLogo from './ShareMealLogo';
import { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/next"
import { MapPin, PhoneCall, Send, LogOut, Compass, Search, ArrowRight, Heart, Star, Filter, Plus, Flame, Sparkles, Camera, Building, User, UserCircle, Settings, Shield, Award, CheckCircle2, Menu, X} from 'lucide-react';

//Environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name"; 
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || "sharemeal_proofs"; 

// live location function
function LiveLocationBadge({ isDonor = true }) {
  const [locationName, setLocationName] = useState("Acquiring GPS...");
  const [hasError, setHasError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Using Google Map API
  // useEffect(() => {
  //   if ("geolocation" in navigator) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (position) => {
  //         try {
  //           const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  //           const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${GOOGLE_API_KEY}`);
  //           const data = await res.json();
  //           console.log("GOOGLE API RESPONSE:", data); 
  //           if (data.results && data.results.length > 0) {
  //             const addressComponents = data.results[0].address_components;
  //             const localArea = addressComponents.find(c => c.types.includes("sublocality") || c.types.includes("locality"));
  //             setLocationName(localArea ? localArea.long_name : "Local Area");
  //           } else {
  //             setLocationName("Location Unknown");
  //           }
  //         } catch (error) { 
  //           console.error("Fetch failed:", error);
  //           setLocationName("Chennai Central"); 
  //         }
  //       },
  //       (err) => { console.error("GPS Error", err); setHasError(true); setLocationName("Location Denied"); }
  //     );
  //   } else { setLocationName("GPS Unsupported"); }
  // }, []);


  // Using OpenStreetMap
// useEffect(() => {
//     if ("geolocation" in navigator) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           try {
//             const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
//             const data = await res.json();
//             if (data.display_name) {
//               const addressParts = data.display_name.split(',');
//               const pinpointLocation = addressParts.slice(0, 2).join(', ').trim();
//               setLocationName(pinpointLocation);
//             } else {
//               // Fallback if the full text fails
//               const fallback = data.address.suburb || data.address.neighbourhood || data.address.city || "Local Area";
//               setLocationName(fallback);
//             }
//           } catch (error) { 
//             console.error("OSM Fetch failed:", error);
//             setLocationName("Chennai Central"); // Default fallback
//           }
//         },
//         () => { setHasError(true); setLocationName("Location Denied"); }
//       );
//     } else { setLocationName("GPS Unsupported"); }
//   }, []);
  
// using geoapify
useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
            const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&apiKey=${API_KEY}`);
            const data = await res.json();
            
            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties;
              const specificLocation = props.suburb || props.neighbourhood || props.city || "Local Area";
              setLocationName(specificLocation);
            } else {
              setLocationName("Location Unknown");
            }
          } catch (error) {
            setLocationName("Chennai Central");
          }
        },
        () => { setHasError(true); setLocationName("Location Denied"); }
      );
    } else { setLocationName("GPS Unsupported"); }
  }, []);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') setIsEditing(false);
  };

  const pulseColor = isDonor ? "bg-emerald-400" : "bg-purple-400";

  if (isEditing) {
    return (
      <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)}onKeyDown={handleKeyDown}onBlur={() => setIsEditing(false)}
        autoFocus
        className="text-xs font-semibold text-gray-700 rounded-xl bg-[#F3F5F4] px-4 py-2 border border-emerald-500/40 outline-none w-36 shadow-sm transition-all focus:bg-white focus:ring-1 focus:ring-emerald-500"
        placeholder="Type location..."
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="group relative flex items-center gap-2.5 rounded-xl bg-[#F3F5F4] px-4 py-2 border border-gray-100 cursor-pointer shadow-sm hover:border-gray-300 transition-all"
      title="Click to type manually"
    >
      <div className="relative flex h-2 w-2 items-center justify-center">
        {!hasError && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${pulseColor}`}></span>}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${hasError ? 'bg-gray-400' : pulseColor}`}></span>
      </div>
      <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">{locationName}</span>
    </div>
  );
}

// to show success message for donating food
function SuccessModal({ isOpen, onClose }) {
  const [showCheck, setShowCheck] = useState(false);
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowCheck(true), 300);
      return () => clearTimeout(timer);
    } else { setShowCheck(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-[fadeIn_0.4s_ease-out]" onClick={onClose}></div>
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-3xl bg-slate-900 border border-emerald-500/30 p-8 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] animate-[scaleIn_0.5s_ease-out]">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-emerald-700/20 blur-3xl"></div>
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {showCheck && <CheckCircle2 size={40} className="text-emerald-400 animate-[scaleIn_0.3s_ease-out]" />}
          </div>
          <h3 className="mb-2 text-2xl font-bold text-white tracking-tight">Success!</h3>
          <p className="mb-8 text-sm text-slate-400 leading-relaxed">Thank you for making a difference in the community today.</p>
          <button onClick={onClose} className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3 text-sm font-bold text-slate-900 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
            Return to Feed
          </button>
        </div>
      </div>
    </div>
  );
}

// for T&C
function LegalModal({ isOpen, type, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 max-h-[80vh] flex flex-col animate-[scaleIn_0.3s_ease-out]">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">
          {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
        </h3>
        <div className="overflow-y-auto flex-1 pr-2 text-sm text-gray-600 font-medium leading-relaxed space-y-4">
          <p><strong>1. Acceptance of Framework:</strong> By accessing the ShareMeal platform, you agree to comply with all local FSSAI food safety regulations regarding the distribution of excess catering assets.</p>
          <p><strong>2. Liability & Good Samaritan Protocol:</strong> Donors acting in good faith to distribute safe, edible surplus food are protected under the Good Samaritan framework. ShareMeal acts solely as a logistics mapping node.</p>
          <p><strong>3. Data Privacy:</strong> Geolocation and metadata collected during handover are strictly encrypted and used solely for verification and routing optimization. No data is sold to third-party entities.</p>
        </div>
        <button onClick={onClose} className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors cursor-pointer">
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
}

// Total App
export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('sharemeal_user')) || null);
  const [token, setToken] = useState(localStorage.getItem('sharemeal_token') || null);
  const [authMode, setAuthMode] = useState('login'); 
  //const [authStep, setAuthStep] = useState(1);
  const [authForm, setAuthForm] = useState({ name: '', mobile: '', password: '', role: 'volunteer', otp: '' });
  const [authError, setAuthError] = useState('');
  //const [demoOtp, setDemoOtp] = useState(''); 
  const [activeScreen, setActiveScreen] = useState('feed'); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [feedFilter, setFeedFilter] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: '', mobile: user?.mobile || '' });
  const [formData, setFormData] = useState({ 
    hallName: '', foodDetails: '', totalServings: '', location: '', contact: '', isVeg: true, isPacked: false, hasLiquid: false
  });
  const isDonor = user?.role === 'donor';
  const theme = {
    primary: isDonor ? 'bg-[#0B3529]' : 'bg-[#2E0854]',
    primaryText: isDonor ? 'text-[#0B3529]' : 'text-[#2E0854]',
    accentText: isDonor ? 'text-[#D4AF37]' : 'text-[#FF6B35]',
    accentBorder: isDonor ? 'border-[#D4AF37]' : 'border-[#FF6B35]',
    primaryGlow: isDonor ? 'shadow-[#0B3529]/15' : 'shadow-[#2E0854]/15',
    accentGlow: isDonor ? 'shadow-[#D4AF37]/25' : 'shadow-[#FF6B35]/25',
    heroGradient: isDonor ? 'from-[#F2F6F4] via-[#FBFDFA] to-[#FAFAFA]' : 'from-[#F6F2F8] via-[#FAF8FD] to-[#FAFAFA]',
    cardGradient: isDonor ? 'from-[#125441] to-[#0B3529]' : 'from-[#4A157D] to-[#2E0854]',
    altCardGradient: isDonor ? 'from-[#8A6D1C] to-[#5C470E]' : 'from-[#E0533C] to-[#9C2915]',
    pillActive: isDonor ? 'bg-[#0B3529] text-[#D4AF37] border-[#0B3529]' : 'bg-[#2E0854] text-[#FF6B35] border-[#2E0854]',
    inputFocus: isDonor ? 'focus:border-[#0B3529]' : 'focus:border-[#2E0854]',
    lightBg: isDonor ? 'bg-[#F3F5F4]' : 'bg-[#F5F2F7]',
    footerBg: isDonor ? 'bg-[#07221A]' : 'bg-[#140326]',
    footerBorder: isDonor ? 'border-emerald-900/40' : 'border-purple-950/60',
    footerText: isDonor ? 'text-emerald-100/70' : 'text-purple-200/70'
  };
  const categories = [
    { id: 'all', label: 'All Available Food', emoji: '🍽️' },
    { id: 'veg', label: 'Pure Veg', emoji: '🌱' },
    { id: 'nonveg', label: 'Non-Veg / Biryani', emoji: '🍗' },
    { id: 'high', label: 'High Yield (50+)', emoji: '🍲' },
  ];
  const fetchListings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/listings`);
      const data = await res.json();
      if (Array.isArray(data)) setListings(data);
    } catch (err) { console.error("Stream Fetch Blocked:", err); }
  };
  useEffect(() => {
    fetchListings();
    if(user) setProfileForm({ name: user.name, mobile: user.mobile });
    const interval = setInterval(fetchListings, 4000); 
    return () => clearInterval(interval);
  }, [user]);
  
  // OTP (Not in use)
  // const handleAuth = async (e) => {
  //   e.preventDefault();
  //   setAuthError('');
  //   if (authStep === 1) {
  //     setIsSubmitting(true);
  //     try {
  //       const res = await fetch(`${BACKEND_URL}/auth/request-otp`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ mobile: authForm.mobile })
  //       });
  //       const data = await res.json();
  //       if (data.error) { 
  //         setAuthError(data.error); 
  //       } else { 
  //         setDemoOtp(data.demoOtp || ''); 
  //         setAuthStep(2); // Move to OTP entry screen
  //       }
  //     } catch (err) { setAuthError('Failed to request OTP. Check connection.'); }
  //     finally { setIsSubmitting(false); }
  //     return;
  //   }
  //   try {
  //     setIsSubmitting(true);
  //     const res = await fetch(`${BACKEND_URL}/auth/${authMode}`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(authForm)
  //     });
  //     const data = await res.json();
  //     if (data.error) { setAuthError(data.error); return; }
  //     localStorage.setItem('sharemeal_token', data.token);
  //     localStorage.setItem('sharemeal_user', JSON.stringify(data.user));
  //     setToken(data.token);
  //     setUser(data.user);
  //     setActiveScreen('feed');
  //     setAuthStep(1); 
  //     setDemoOtp(''); 
  //   } catch (err) { setAuthError('Connection error. Please try again.'); }
  //   finally { setIsSubmitting(false); }
  // };

const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (data.error) { setAuthError(data.error); return; }
      localStorage.setItem('sharemeal_token', data.token);
      localStorage.setItem('sharemeal_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setActiveScreen('feed');
    } catch (err) { 
      setAuthError('Connection error. Please try again.'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const updatedUser = await res.json();
      if(updatedUser.error) return;
      const mergedUser = { ...user, ...updatedUser };
      setUser(mergedUser);
      localStorage.setItem('sharemeal_user', JSON.stringify(mergedUser));
      setIsEditingProfile(false);
    } catch (err) { console.error("Profile cluster exception:", err); }
  };
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/listings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, donorId: user?._id }), 
      });
      if(res.ok) {
        setFormData({ hallName: '', foodDetails: '', totalServings: '', location: '', contact: '', isVeg: true, isPacked: false, hasLiquid: false });
        fetchListings();
        setModalOpen(true);
      }
    } catch (err) { console.error("Broadcast interruption:", err); } finally { setIsSubmitting(false); }
  };
  const handleClaimRequest = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/listings/${id}/claim`, {
        method: 'PATCH', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ volunteerId: user?._id, volunteerName: user.name }) 
      });
      if(res.ok) fetchListings();
    } catch (err) { console.error("Dispatch mapping error:", err); }
  };
  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_BOUNDS = 800; 
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_BOUNDS) {
              height *= MAX_BOUNDS / width;
              width = MAX_BOUNDS;
            }
          } else {
            if (height > MAX_BOUNDS) {
              width *= MAX_BOUNDS / height;
              height = MAX_BOUNDS;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          }, 'image/jpeg', 0.7); 
        };
      };
    });
  };
  const handlePhotoUploadAndComplete = async (e, listingId) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingId(listingId);
    try {
      const compressedFile = await compressImageFile(file);
      const data = new FormData();
      data.append('file', compressedFile);
      data.append('upload_preset', UPLOAD_PRESET);
      data.append('cloud_name', CLOUD_NAME);
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: data });
      const cloudinaryData = await cloudinaryRes.json();
      const res = await fetch(`${BACKEND_URL}/listings/${listingId}/complete`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ photoUrl: cloudinaryData.secure_url })
      });
      if(res.ok) fetchListings(); 
    } catch (error) { console.error("Cloudinary compressed pipeline handshake failure:", error); } finally { setUploadingId(null); }
  };
  const toggleRole = (targetRole, targetScreen = null) => {
    if (!user || user.role === targetRole) {
      if (targetScreen) setActiveScreen(targetScreen);
      return;
    }
    setIsTransitioning(true);
    setTimeout(() => {
      const updatedUser = { ...user, role: targetRole };
      setUser(updatedUser);
      localStorage.setItem('sharemeal_user', JSON.stringify(updatedUser));
      if (targetScreen) { setActiveScreen(targetScreen); } 
      else if (targetRole === 'volunteer' && activeScreen === 'create') { setActiveScreen('feed'); }
      setTimeout(() => setIsTransitioning(false), 200);
    }, 250); 
  };
  const filteredListings = listings.filter(l => {
    const matchesSearch = l.foodDetails?.toLowerCase().includes(searchQuery.toLowerCase()) || l.hallName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (feedFilter === 'veg') return l.isVeg;
    if (feedFilter === 'nonveg') return !l.isVeg;
    if (feedFilter === 'high') return (l.servingsAvailable || l.totalServings) >= 50;
    return true;
  });
  const toggleFavorite = (id) => {
    if (favorites.includes(id)) setFavorites(favorites.filter(favId => favId !== id));
    else setFavorites([...favorites, id]);
  };
  const userListings = listings.filter(l => isDonor ? l.donorId === user?._id : l.volunteerId === user?._id);
  const archivedRunsCount = userListings.filter(l => l.status === 'completed').length;
  const totalSavedPlatesCount = userListings.filter(l => l.status === 'completed').reduce((sum, item) => sum + (item.totalServings || 0), 0);

  // Code for OTP verifiation
  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-[#F3F5F4] flex flex-col items-center justify-center p-4 tracking-tight">
  //       <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">       
  //         {authStep === 2 && (
  //           <button onClick={() => setAuthStep(1)} className="absolute top-6 left-6 text-gray-400 hover:text-gray-700 text-sm font-bold flex items-center gap-1 cursor-pointer">
  //             ← Back
  //           </button>
  //         )}
  //         <ShareMealLogo isDonor={true} className="h-12 w-12 mx-auto mb-3 mt-4" />
  //         <h1 className="text-2xl font-bold text-[#0B3529] tracking-tight text-center">Welcome to ShareMeal</h1>
  //         <p className="text-sm text-emerald-800/70 mt-1 font-medium text-center mb-6">Connecting surplus food with those in need</p>
  //         {authError && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm font-semibold rounded-xl text-center border border-rose-100">{authError}</div>}
  //         <form onSubmit={handleAuth} className="space-y-4">
  //           {authStep === 1 ? (
  //             <>
  //               {authMode === 'register' && <input type="text" required className="w-full text-sm px-4 py-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200 focus:border-[#0B3529] font-medium text-[#0B3529] outline-none" placeholder="Your Name / Organization" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />}
  //               <input type="tel" required className="w-full text-sm px-4 py-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200 focus:border-[#0B3529] font-medium text-[#0B3529] outline-none" placeholder="Mobile Number" value={authForm.mobile} onChange={e => setAuthForm({...authForm, mobile: e.target.value})} />
  //               <input type="password" required className="w-full text-sm px-4 py-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200 focus:border-[#0B3529] font-medium text-[#0B3529] outline-none" placeholder="Password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
  //               {authMode === 'register' && (
  //                 <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F3F5F4] rounded-xl border border-gray-200/50">
  //                   <button type="button" onClick={() => setAuthForm({...authForm, role: 'volunteer'})} className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${authForm.role === 'volunteer' ? 'bg-white text-[#0B3529] shadow-sm' : 'text-gray-500'}`}>NGO / Rescue</button>
  //                   <button type="button" onClick={() => setAuthForm({...authForm, role: 'donor'})} className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${authForm.role === 'donor' ? 'bg-white text-[#0B3529] shadow-sm' : 'text-gray-500'}`}>Food Donor</button>
  //                 </div>
  //               )}
  //             </>
  //           ) : (
  //             <div className="animate-[fadeIn_0.3s_ease-out]">
  //               <div className="p-3 bg-emerald-50/50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100 mb-4 text-center">
  //                 Secure OTP sent to <br/><span className="text-sm font-black">{authForm.mobile}</span>
  //               </div>

// Sandbox
  //               {demoOtp && (
  //                 <div className="mb-4 bg-[#f0fdf4] border border-dashed border-[#22c55e] rounded-xl p-4 text-center shadow-sm">
  //                   <p className="m-0 text-[11px] text-[#166534] font-black uppercase tracking-wider flex justify-center items-center gap-1.5">
  //                     🛠️ Sandbox Simulation Active
  //                   </p>
  //                   <p className="mt-1 text-xs font-medium text-[#15803d]">
  //                     Intercepted DB Security Token:
  //                   </p>
  //                   <div className="mt-2 text-3xl font-black text-[#166534] tracking-[0.2em] pl-[0.2em]">
  //                     {demoOtp}
  //                   </div>
  //                 </div>
  //               )}
  //               <input type="text" maxLength="6" required className="w-full text-center tracking-[0.5em] text-2xl px-4 py-4 rounded-xl bg-[#F8FAF9] border border-gray-200 focus:border-[#0B3529] font-bold text-[#0B3529] outline-none" placeholder="••••••" value={authForm.otp} onChange={e => setAuthForm({...authForm, otp: e.target.value})} />
  //             </div>
  //           )}
  //           <button type="submit" disabled={isSubmitting} className={`w-full py-3.5 bg-[#0B3529] text-[#D4AF37] font-bold text-sm rounded-xl hover:opacity-95 shadow-md transition-all cursor-pointer ${isSubmitting ? 'opacity-70' : 'hover:opacity-95'}`}>
  //             {authStep === 1 ? 'Request Secure OTP' : (authMode === 'login' ? 'Verify & Log In' : 'Verify & Create Account')}
  //           </button>
  //         </form>   
  //         {authStep === 1 && (
  //           <div className="mt-6 text-center">
  //             <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-sm font-semibold text-[#125441] hover:text-[#0B3529] cursor-pointer">
  //               {authMode === 'login' ? "Need an account? Sign up" : "Already have an account? Log in"}
  //             </button>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F5F4] flex flex-col items-center justify-center p-4 tracking-tight">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
          
          <ShareMealLogo isDonor={true} className="h-12 w-12 mx-auto mb-3 mt-4" />
          <h1 className="text-2xl font-bold text-[#0B3529] tracking-tight text-center">Welcome to ShareMeal</h1>
          <p className="text-sm text-emerald-800/70 mt-1 font-medium text-center mb-6">Connecting surplus food with those in need</p>

          {authError && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm font-semibold rounded-xl text-center border border-rose-100">{authError}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <input type="text" required className="w-full text-sm px-4 py-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200 focus:border-[#0B3529] font-medium text-[#0B3529] outline-none" placeholder="Your Name / Organization" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
            )}
            
            <input type="tel" required className="w-full text-sm px-4 py-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200 focus:border-[#0B3529] font-medium text-[#0B3529] outline-none" placeholder="Mobile Number" value={authForm.mobile} onChange={e => setAuthForm({...authForm, mobile: e.target.value})} />
            
            <input type="password" required className="w-full text-sm px-4 py-3.5 rounded-xl bg-[#F8FAF9] border border-gray-200 focus:border-[#0B3529] font-medium text-[#0B3529] outline-none" placeholder="Password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />

            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F3F5F4] rounded-xl border border-gray-200/50">
                <button type="button" onClick={() => setAuthForm({...authForm, role: 'volunteer'})} className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${authForm.role === 'volunteer' ? 'bg-white text-[#0B3529] shadow-sm' : 'text-gray-500'}`}>NGO / Rescue</button>
                <button type="button" onClick={() => setAuthForm({...authForm, role: 'donor'})} className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${authForm.role === 'donor' ? 'bg-white text-[#0B3529] shadow-sm' : 'text-gray-500'}`}>Food Donor</button>
              </div>
            )}
            
            <button type="submit" disabled={isSubmitting} className={`w-full py-3.5 bg-[#0B3529] text-[#D4AF37] font-bold text-sm rounded-xl hover:opacity-95 shadow-md transition-all cursor-pointer ${isSubmitting ? 'opacity-70' : 'hover:opacity-95'}`}>
              {authMode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-sm font-semibold text-[#125441] hover:text-[#0B3529] cursor-pointer">
              {authMode === 'login' ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex flex-col min-h-screen bg-[#FAFAFA] ${theme.primaryText} font-sans antialiased tracking-tight transition-all duration-300 ease-out ${isTransitioning ? 'opacity-30 scale-[0.99] filter blur-sm' : 'opacity-100 scale-100'}`}>
          <nav className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between relative">
          
          {/*Logo & Location for Mobile (fixed)*/}
          <div className="flex items-center gap-3 sm:gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveScreen('feed'); setIsMobileMenuOpen(false); }}>
              <ShareMealLogo isDonor={isDonor} className="h-8 w-8" />
              <span className="hidden sm:block text-xl font-extrabold tracking-tight">ShareMeal</span>
            </div>
            <div className="block"><LiveLocationBadge isDonor={isDonor} /></div>
          </div>
          {/* donate button centered in mobile
          {user?.role === 'donor' && (
            <button 
              onClick={() => { setActiveScreen('create'); setIsMobileMenuOpen(false); }} 
              className={`sm:hidden text-xs font-bold flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-3 py-2 rounded-xl shadow-sm absolute left-1/2 transform -translate-x-1/2 cursor-pointer transition-all ${activeScreen === 'create' ? 'ring-2 ring-emerald-400' : ''}`}
            >
              <Plus size={14} /> <span className="hidden sm:block text-sm">Donate Food</span>
            </button>
          )}*/}

          {/* Hamburger option for movile*/}
          <div className="sm:hidden flex items-center gap-3">
            {user?.role === 'donor' && (
              <button onClick={() => { setActiveScreen('create'); setIsMobileMenuOpen(false); }} className={`flex items-center justify-center h-9 w-9 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl shadow-sm cursor-pointer transition-all ${activeScreen === 'create' ? 'ring-2 ring-emerald-400' : ''}`} title="Donate Food"><Plus size={20} /></button>)}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer p-1 transition-transform active:scale-90">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/*PC elements that are hidden in mobile*/}
          <div className="hidden sm:flex items-center gap-6">
            <button onClick={() => setActiveScreen('feed')} className={`text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all ${activeScreen === 'feed' ? `${theme.primaryText} border-b-2 ${theme.accentBorder} pb-1` : 'text-gray-400 hover:text-gray-600'}`}><Compass size={16} /> <span>Find Food</span></button>
            {user?.role === 'donor' && <button onClick={() => setActiveScreen('create')} className={`text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all ${activeScreen === 'create' ? `${theme.primaryText} border-b-2 ${theme.accentBorder} pb-1` : 'text-gray-400 hover:text-gray-600'}`}><Plus size={18} /> <span className="hidden sm:block">Donate Food</span></button>}
            <div className="h-5 w-[1px] bg-gray-200" />
            <div className="relative bg-[#EBEDEA] p-1 rounded-xl flex items-center border border-gray-200/50 w-44 h-10 shadow-inner">
              <div className={`absolute top-1 bottom-1 left-1 rounded-lg transition-all duration-300 shadow-sm ${isDonor ? 'w-[82px] translate-x-0 bg-[#0B3529]' : 'w-[82px] translate-x-[80px] bg-[#2E0854]'}`} />
              <button onClick={() => toggleRole('donor')} className={`z-10 flex-1 flex items-center justify-center gap-1 h-full text-xs font-bold cursor-pointer transition-colors ${isDonor ? 'text-[#D4AF37]' : 'text-gray-500'}`}><Building size={12} /> Donor</button>
              <button onClick={() => toggleRole('volunteer')} className={`z-10 flex-1 flex items-center justify-center gap-1 h-full text-xs font-bold cursor-pointer transition-colors ${!isDonor ? 'text-[#FF6B35]' : 'text-gray-500'}`}><User size={12} /> Rescue</button>
            </div>
            <button onClick={() => setActiveScreen('account')} className={`cursor-pointer transform hover:scale-105 active:scale-95 transition-all ${activeScreen === 'account' ? theme.primaryText : 'text-gray-400'}`}><UserCircle size={22} /></button>
            <button onClick={() => { localStorage.clear(); setUser(null); setToken(null); }} className="text-gray-400 hover:text-rose-600 cursor-pointer"><LogOut size={16} /></button>
          </div>
          {/*  Menu button for moile 
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer p-1 transition-transform active:scale-90"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>*/}
        </div>

            {/* Dropdown for moble*/}
            {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-xl p-5 flex flex-col gap-4 z-40 animate-[fadeIn_0.2s_ease-out]">
            <button 
              onClick={() => { setActiveScreen('feed'); setIsMobileMenuOpen(false); }} 
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeScreen === 'feed' ? `${theme.lightBg} ${theme.primaryText}` : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Compass size={18} /> <span>Find Food</span>
            </button>
            <div className="relative bg-[#EBEDEA] p-1 rounded-xl flex items-center border border-gray-200/50 w-full h-12 shadow-inner mt-1">
              <div 
                className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 shadow-sm"
                style={{
                  width: 'calc(50% - 6px)',
                  left: isDonor ? '4px' : 'calc(50% + 2px)',
                  backgroundColor: isDonor ? '#0B3529' : '#2E0854'
                }}/>
              <button 
                onClick={() => { toggleRole('donor'); }} 
                className={`z-10 flex-1 flex items-center justify-center gap-1.5 h-full text-xs font-extrabold cursor-pointer transition-colors ${isDonor ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
                <Building size={14} /> Donor
              </button>
              <button 
                onClick={() => { toggleRole('volunteer'); }} 
                className={`z-10 flex-1 flex items-center justify-center gap-1.5 h-full text-xs font-extrabold cursor-pointer transition-colors ${!isDonor ? 'text-[#FF6B35]' : 'text-gray-500'}`}>
                <User size={14} /> Rescue
              </button>
            </div>
            <div className="h-[1px] bg-gray-100 my-1" />
            <div className="flex items-center justify-between gap-3">
              <button 
                onClick={() => { setActiveScreen('account'); setIsMobileMenuOpen(false); }} 
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-gray-200 transition-all ${activeScreen === 'account' ? `${theme.lightBg} ${theme.primaryText} border-transparent` : 'text-gray-600 bg-white hover:bg-gray-50'}`}>
                <UserCircle size={18} /> <span>Account Center</span>
              </button>
              <button 
                onClick={() => { localStorage.clear(); setUser(null); setToken(null); setIsMobileMenuOpen(false); }} 
                className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-xl cursor-pointer flex items-center justify-center transition-colors"
                title="Log Out">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </nav>
      {activeScreen === 'feed' && (
        <header className={`relative w-full py-16 px-6 border-b border-gray-100 overflow-hidden bg-gradient-to-b ${theme.heroGradient} shrink-0`}>
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <span className="inline-flex items-center gap-1.5 bg-white border border-gray-100 text-gray-500 font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm">
              <Sparkles size={12} className={theme.accentText} /> Active Profile: {user.role.toUpperCase()}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {isDonor ? 'Got extra food? Share it here.' : 'Find food ready for rescue.'}<br/>
              <span className={`${theme.accentText} italic font-serif font-normal`}>Make a difference today.</span>
            </h2>
            <div className="w-full max-w-lg mx-auto bg-white p-1.5 rounded-xl shadow-md border border-gray-100 flex items-center gap-2 mt-6">
              <Search className="text-gray-400 ml-3 shrink-0" size={16} />
              <input type="text" placeholder="Search for food or locations..." className="w-full py-3 px-2 text-sm bg-transparent border-none focus:outline-none font-medium text-gray-700" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button className={`${theme.primary} ${theme.accentText} px-6 py-2.5 rounded-lg text-sm font-bold shrink-0 cursor-pointer`}>Search</button>
            </div>
          </div>
        </header>
      )}
      {/*Filter*/}
      {activeScreen === 'feed' && (
        <section className="max-w-6xl mx-auto w-full px-6 pt-8 shrink-0">
          <div className="flex gap-3 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setFeedFilter(cat.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${feedFilter === cat.id ? theme.pillActive : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                <span>{cat.emoji}</span><span>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {/*Layout*/}
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 pt-6 pb-20">
                {activeScreen === 'feed' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Available Donations</h3>
              </div>
              <div className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 bg-white cursor-pointer">
                <Filter size={12} className={theme.accentText} /> Filter
              </div>
            </div>
            {filteredListings.length === 0 ? (
              <div className="py-20 text-center max-w-sm mx-auto bg-white rounded-2xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-500">No active donations found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((item) => {
                  const isFavorited = favorites.includes(item._id);
                  const currentServings = item.servingsAvailable !== undefined ? item.servingsAvailable : item.totalServings;
                  const servingPercentage = Math.min(100, (currentServings / item.totalServings) * 100);
                  return (
                    <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group relative">
                      <div className={`h-32 w-full relative p-5 flex flex-col justify-between bg-gradient-to-br ${item.isVeg ? theme.cardGradient : theme.altCardGradient}`}>
                        <div className="flex justify-between items-center z-10">
                          <span className="bg-white text-gray-800 text-xs font-bold px-2.5 py-1 rounded-md">
                            {item.isVeg ? '🌱 VEG' : '🍗 NON-VEG'}
                          </span>
                          <button onClick={() => toggleFavorite(item._id)} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors cursor-pointer z-20">
                            <Heart size={14} className={isFavorited ? 'fill-rose-600 text-rose-600' : ''} />
                          </button>
                        </div>
                        <div className="z-10 text-xs font-bold text-white/90 flex justify-between">
                          <span>Verified Donor</span>
                          <span className="bg-black/30 px-2 py-0.5 rounded-md capitalize">{item.status}</span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 truncate">{item.hallName}</h4>
                          <p className="text-xs text-gray-500 font-semibold mt-1 flex items-center gap-1 truncate"><MapPin size={12} className={theme.accentText} /> {item.location}</p>
                          <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm font-medium text-gray-600">"{item.foodDetails}"</div>
                          <div className="mt-5 space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-gray-500">
                              <span>Available Portions</span>
                              <span className="font-bold text-gray-800">{item.status === 'completed' ? 'Delivered' : `${currentServings} / ${item.totalServings} Plates`}</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${item.isVeg ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${item.status !== 'available' ? 100 : servingPercentage}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-50 flex flex-col gap-2">
                          {item.status === 'completed' ? (
                            <div className="w-full py-3 bg-emerald-50 text-emerald-700 text-center rounded-xl text-sm font-bold border border-emerald-100">🎉 Delivery Successful</div>
                          ) : item.status === 'claimed' ? (
                            <div className="flex flex-col gap-2 w-full">
                              <div className="w-full py-2 bg-gray-50 text-gray-600 text-center rounded-xl text-xs font-semibold border border-dashed border-gray-200">Picked up by: {item.volunteerName}</div>
                              <div className="flex items-center gap-2">
                                <a href={`tel:${item.contact}`} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer"><PhoneCall size={16} /></a>
                                {!isDonor ? (
                                  <>
                                    <input type="file" accept="image/*" capture="environment" className="hidden" id={`camera-${item._id}`} onChange={(e) => handlePhotoUploadAndComplete(e, item._id)} />
                                    <button onClick={() => document.getElementById(`camera-${item._id}`).click()} disabled={uploadingId === item._id} className={`flex-1 py-3 ${uploadingId === item._id ? 'bg-gray-400 text-white' : `${theme.primary} ${theme.accentText}`} font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer`}>
                                      <Camera size={14} /> {uploadingId === item._id ? 'Processing...' : 'Upload Delivery Photo'}
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex-1 py-3 bg-amber-50 text-amber-700 text-center rounded-xl text-xs font-bold border border-amber-100 animate-pulse">
                                    Distribution in progress...
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <a href={`tel:${item.contact}`} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer"><PhoneCall size={16} /></a>
                              {user.role === 'volunteer' && (
                                <button onClick={() => handleClaimRequest(item._id)} className={`flex-1 py-3 ${theme.primary} ${theme.accentText} font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer`}>
                                  Claim & Pick Up <ArrowRight size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeScreen === 'create' && user.role === 'donor' && (
          <div className="max-w-lg mx-auto bg-white border border-gray-100 shadow-md rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Post a Food Donation</h3>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Venue / Hall Name</label>
                  <input type="text" required value={formData.hallName} onChange={e => setFormData({...formData, hallName: e.target.value})} className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Contact Number</label>
                  <input type="tel" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">What kind of food is it?</label>
                <input type="text" required placeholder="e.g. Veg Biryani and Naan" value={formData.foodDetails} onChange={e => setFormData({...formData, foodDetails: e.target.value})} className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Total Servings (Plates)</label>
                  <input type="number" required value={formData.totalServings} onChange={e => setFormData({...formData, totalServings: e.target.value})} className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Location / Area</label>
                  <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer"><input type="checkbox" checked={formData.isVeg} onChange={e => setFormData({...formData, isVeg: e.target.checked})} className="accent-emerald-600 rounded h-4 w-4" /><span>🌱 Veg</span></label>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer"><input type="checkbox" checked={formData.isPacked} onChange={e => setFormData({...formData, isPacked: e.target.checked})} className="accent-emerald-600 rounded h-4 w-4" /><span>📦 Packed</span></label>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer"><input type="checkbox" checked={formData.hasLiquid} onChange={e => setFormData({...formData, hasLiquid: e.target.checked})} className="accent-emerald-600 rounded h-4 w-4" /><span>🍲 Gravy</span></label>
              </div>
              <button type="submit" disabled={isSubmitting} className={`w-full py-4 ${isSubmitting ? 'bg-gray-400 text-white' : `${theme.primary} ${theme.accentText}`} font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer`}>
                {isSubmitting ? 'Posting Donation...' : <><Send size={16} className="inline mr-2" /> Post Food Donation</>}
              </button>
            </form>
          </div>
        )}
        {activeScreen === 'account' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
              {!isEditingProfile ? (
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className={`h-20 w-20 rounded-2xl ${theme.primary} flex items-center justify-center shadow-md shrink-0`}><UserCircle size={40} className={theme.accentText} /></div>
                  <div className="flex-1 space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{user.name}</h2>
                    <p className="text-gray-500 font-semibold text-sm flex items-center justify-center sm:justify-start gap-1.5"><Shield size={14} className={theme.accentText} /> Verified Account</p>
                    <div className="pt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 border border-gray-100">{user.mobile}</span>
                      <button onClick={() => setIsEditingProfile(true)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-600 rounded-lg cursor-pointer transition-colors">Edit Profile</button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-800">Update Your Details</h3>
                  <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 outline-none" />
                  <input type="tel" required value={profileForm.mobile} onChange={e => setProfileForm({...profileForm, mobile: e.target.value})} className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 outline-none" />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className={`flex-1 py-3 ${theme.primary} ${theme.accentText} text-sm font-bold rounded-xl cursor-pointer shadow-sm`}>Save Changes</button>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-3 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 cursor-pointer transition-colors">Cancel</button>
                  </div>
                </form>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4 shadow-sm">
                <span className="text-3xl">📦</span>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Completed Rescues</h4>
                  <p className="text-2xl font-black text-gray-900">{archivedRunsCount}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4 shadow-sm">
                <Award className="text-orange-400" size={32} />
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Saved Portions</h4>
                  <p className="text-2xl font-black text-gray-900">{totalSavedPlatesCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100">Legal & Compliance</div>
              <div className="divide-y divide-gray-100">
                <div onClick={() => setLegalModalType('terms')} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer group transition-colors">
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">Terms of Service</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <div onClick={() => setLegalModalType('privacy')} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer group transition-colors">
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">Privacy Policy</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {/*Footer*/}
      <footer className={`w-full mt-auto py-10 border-t ${theme.footerBg} ${theme.footerBorder} shrink-0`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-white/50 text-center md:text-left gap-3">
          <span>&copy; 2026 ShareMeal Platform</span>
          <span>Serving the community</span>
        </div>
      </footer>

      {/* T&C*/}
      <SuccessModal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setActiveScreen('feed'); }} />
      <LegalModal isOpen={!!legalModalType} type={legalModalType} onClose={() => setLegalModalType(null)} />
    </div>
  );
}
