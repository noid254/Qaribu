
import React, { useState, useRef } from 'react';
import type { ServiceProvider, CatalogueItem, Member, Skill, Document } from '../types';
import CatalogueItemDetailModal from './CatalogueItemDetailModal';
import RestaurantMenuModal from './RestaurantMenuModal';

interface ProfileViewProps {
  profileData: ServiceProvider;
  isOwner: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  currentUserPhone: string | undefined;
  onBack: () => void;
  onLogout: () => void;
  onUpdate: (updatedProfile: ServiceProvider) => void;
  onDelete: (providerId: string) => void;
  onContactClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
  savedContacts: string[];
  onToggleSaveContact: (providerId: string) => void;
  catalogueItems: CatalogueItem[];
  onBook: (provider: ServiceProvider) => void;
  onJoin: (provider: ServiceProvider) => void;
  isFlaggedByUser: boolean;
  onFlag: (reason: string) => void;
  allDocuments: Document[];
  onViewDocument: (doc: Document) => void;
}

// --- Icons for the new design ---

const StarIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
);

const LocationIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
);

const RateIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 004 0V7.151c.22.071.412.164.567.267l1.11-1.11a.5.5 0 00-1.11-1.11l-1.11 1.11a2.5 2.5 0 00-3.476 0l-1.11-1.11a.5.5 0 00-1.11 1.11l1.11 1.11zM11 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"></path><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.646 4.646a.5.5 0 000 .708L7.354 8.06a.5.5 0 01.01.698l-2.708 2.708a.5.5 0 00.708.708L8.06 9.122a.5.5 0 01.698-.01l2.708 2.708a.5.5 0 00.708-.708L9.468 8.766a.5.5 0 01-.01-.698l2.708-2.708a.5.5 0 00-.708-.708L8.766 7.354a.5.5 0 01-.698.01L5.354 4.646a.5.5 0 00-.708 0z" clipRule="evenodd"></path></svg>
);

const VerifiedIcon: React.FC<{ className?: string, onClick?: () => void }> = ({ className = "w-5 h-5", onClick }) => (
    <svg onClick={onClick} className={`${className} ${onClick ? 'cursor-pointer' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
);

const SettingsIcon: React.FC<{onClick?: () => void}> = ({onClick}) => (
    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 cursor-pointer"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.09a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const CallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;
const BookmarkIcon = ({ filled }: { filled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);
const FlagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;
const CatalogueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7s0 4 8 4 8-4 8-4" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;


const CatalogueItemCard: React.FC<{item: CatalogueItem, onClick?: () => void}> = ({ item, onClick }) => (
    <div onClick={onClick} className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 ${onClick ? 'cursor-pointer' : ''}`}>
        <img src={item.imageUrls[0] || 'https://picsum.photos/seed/placeholder/400/300'} alt={item.title} className="w-full h-24 object-cover" />
        <div className="p-2">
            <h3 className="font-bold text-gray-800 text-sm truncate">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
            <p className="text-sm font-semibold text-brand-navy mt-2">{item.price}</p>
        </div>
    </div>
);

const MembersScroller: React.FC<{ members: Member[], selectedMemberId: string, onSelectMember: (member: Member) => void }> = ({ members, selectedMemberId, onSelectMember }) => {
    return (
        <div className="px-4 py-3 bg-gray-100 border-t border-b border-gray-200">
            <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                {members.map(member => (
                    <button 
                        key={member.id} 
                        onClick={() => onSelectMember(member)} 
                        className={`flex-shrink-0 flex flex-col items-center gap-1 text-center w-20 p-1 rounded-lg transition-all duration-200 ${selectedMemberId === member.id ? 'bg-brand-gold/10' : 'bg-transparent'}`}
                    >
                        <div className={`w-16 h-16 rounded-full border-2 p-0.5 transition-all ${selectedMemberId === member.id ? 'border-brand-gold' : 'border-gray-300'}`}>
                            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover rounded-full" />
                        </div>
                        <p className={`text-xs font-semibold truncate w-full ${selectedMemberId === member.id ? 'text-brand-navy' : 'text-gray-600'}`}>{member.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const FlagModal: React.FC<{onClose: () => void, onFlag: (reason: string) => void}> = ({onClose, onFlag}) => {
    const reasons = ["Inappropriate Content", "Spam or Misleading", "Scam or Fraud", "Not a real service"];
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Flag Profile</h2>
                <div className="space-y-2">
                    {reasons.map(reason => (
                        <button key={reason} onClick={() => onFlag(reason)} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg">{reason}</button>
                    ))}
                </div>
                <button onClick={onClose} className="mt-4 w-full text-center text-gray-600">Cancel</button>
            </div>
        </div>
    );
};

const UnverifyModal: React.FC<{onClose: () => void, onUnverify: (reason: string) => void}> = ({onClose, onUnverify}) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-2">Un-verify User</h2>
                <p className="text-sm text-gray-600 mb-4">Please provide a reason. This will be sent to the user.</p>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} className="w-full p-2 border rounded-md" placeholder="e.g. Profile information is misleading..."/>
                <div className="flex gap-2 mt-4">
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={() => onUnverify(reason)} disabled={!reason} className="flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-red-300">Confirm</button>
                </div>
            </div>
        </div>
    );
};

const SkillCard: React.FC<{ skill: Skill; onClick: () => void }> = ({ skill, onClick }) => (
    <div onClick={onClick} className="flex-shrink-0 flex items-center gap-4 text-left p-3 rounded-lg hover:bg-gray-100 transition-colors bg-white border border-gray-200 shadow-sm w-full cursor-pointer">
        <div className="relative w-16 h-16">
            <img src={skill.iconUrl} alt={skill.name} className="w-full h-full object-cover rounded-full" />
            {skill.isVerified && (
                <div className="absolute -bottom-0 -right-0 bg-white rounded-full p-0.5">
                     <VerifiedIcon className="w-5 h-5 text-blue-500" />
                </div>
            )}
        </div>
        <div className="flex-1">
            <p className="font-bold text-gray-800">{skill.name}</p>
            <p className="text-xs text-gray-500 mt-1">{skill.verifier.type === 'institution' ? 'Verified By:' : 'Mentored By:'}</p>
            <p className="text-sm font-semibold text-gray-700">{skill.verifier.name}</p>
        </div>
    </div>
);

const SkillDetailModal: React.FC<{ skill: Skill; onClose: () => void }> = ({ skill, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <img src={skill.iconUrl} alt={skill.name} className="w-20 h-20 rounded-full border-4 border-gray-200 object-cover" />
                    <h2 className="text-2xl font-bold mt-3">{skill.name}</h2>
                    {skill.isVerified && <p className="text-blue-600 font-semibold text-sm">Verified Skill</p>}
                </div>
                <div className="mt-6 text-sm bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold text-gray-500 uppercase text-xs">{skill.verifier.type === 'institution' ? 'Verified By' : 'Mentored By'}</p>
                    <p className="font-bold text-gray-800 text-base mt-1">{skill.verifier.name}</p>
                    <p className="text-gray-600 mt-2">{skill.verifier.details}</p>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-brand-navy text-white font-bold py-3 rounded-lg">Close</button>
            </div>
        </div>
    );
};

const rateSuffix: Record<ServiceProvider['rateType'], string> = {
    'per hour': 'hr',
    'per day': 'day',
    'per task': 'task',
    'per month': 'mo',
    'per piece work': 'item',
    'per km': 'km',
    'per sqm': 'm²',
    'per cbm': 'm³',
    'per appearance': 'show'
};

const ProfileView: React.FC<ProfileViewProps> = ({ profileData, isOwner, isAuthenticated, isSuperAdmin, currentUserPhone, onBack, onLogout, onUpdate, onDelete, onContactClick, onInitiateContact, savedContacts, onToggleSaveContact, catalogueItems, onBook, onJoin, isFlaggedByUser, onFlag, allDocuments, onViewDocument }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [showUnverifyModal, setShowUnverifyModal] = useState(false);
    const [selectedCatalogueItem, setSelectedCatalogueItem] = useState<CatalogueItem | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [galleryTab, setGalleryTab] = useState<'works' | 'catalogue' | 'qr'>(profileData.works.length > 0 ? 'works' : 'qr');
    const [mainContentTab, setMainContentTab] = useState<'about' | 'skills'>('about');
    const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);
    
    const isGroupProfile = profileData.profileType === 'group' && profileData.members && profileData.members.length > 0;
    const [selectedMember, setSelectedMember] = useState<Member | null>(isGroupProfile ? profileData.members![0] : null);
    
    // For smooth transitions
    const [detailsKey, setDetailsKey] = useState(profileData.id);
    const [isFading, setIsFading] = useState(false);

    // State for editable fields
    const [editedService, setEditedService] = useState(profileData.service);
    const [editedAbout, setEditedAbout] = useState(profileData.about);
    const [editedLocation, setEditedLocation] = useState(profileData.location);
    const [editedCoverImage, setEditedCoverImage] = useState<string | null>(null);
    const [editedAvatar, setEditedAvatar] = useState<string | null>(null);
    const [editedRate, setEditedRate] = useState(profileData.hourlyRate.toString());
    const [editedRateType, setEditedRateType] = useState(profileData.rateType);
    const [editedCtas, setEditedCtas] = useState(profileData.cta || []);

    const coverImageInputRef = useRef<HTMLInputElement>(null);
    const avatarImageInputRef = useRef<HTMLInputElement>(null);

    const linkedAsset = profileData.linkedAssetId ? allDocuments.find(d => d.id === profileData.linkedAssetId) : null;
    
    const displayData = (isGroupProfile && selectedMember) ? {
        rating: selectedMember.rating,
        distanceKm: selectedMember.distanceKm,
        hourlyRate: selectedMember.hourlyRate,
        rateType: selectedMember.rateType,
        currency: profileData.currency,
        phone: selectedMember.phone,
        whatsapp: selectedMember.whatsapp,
        name: selectedMember.name,
    } : {
        rating: profileData.rating,
        distanceKm: profileData.distanceKm,
        hourlyRate: profileData.hourlyRate,
        rateType: profileData.rateType,
        currency: profileData.currency,
        phone: profileData.phone,
        whatsapp: profileData.whatsapp,
        name: profileData.name,
    };

    const isLeader = profileData.accountType === 'organization' 
        && profileData.leaders 
        && currentUserPhone 
        && Object.values(profileData.leaders).includes(currentUserPhone);

    const canEdit = isOwner || isSuperAdmin || isLeader;
    const isSaved = savedContacts.includes(profileData.id);
    const hasCatalogue = catalogueItems && catalogueItems.length > 0;
    const hasWorks = profileData.works.length > 0;
    const hasSkills = profileData.skills && profileData.skills.length > 0;

    const handleSave = () => {
      const updatedProfile = {
        ...profileData,
        service: editedService,
        about: editedAbout,
        location: editedLocation,
        coverImageUrl: editedCoverImage || profileData.coverImageUrl,
        avatarUrl: editedAvatar || profileData.avatarUrl,
        hourlyRate: parseInt(editedRate, 10) || 0,
        rateType: editedRateType,
        cta: editedCtas,
      };
      onUpdate(updatedProfile);
      setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedService(profileData.service);
        setEditedAbout(profileData.about);
        setEditedLocation(profileData.location);
        setEditedCoverImage(null);
        setEditedAvatar(null);
        setEditedRate(profileData.hourlyRate.toString());
        setEditedRateType(profileData.rateType);
        setEditedCtas(profileData.cta || []);
        setIsEditing(false);
    }
    
    const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedCoverImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCall = () => {
        if (!isAuthenticated) {
            onContactClick();
        } else {
            if (onInitiateContact(profileData)) {
                window.location.href = `tel:${displayData.phone}`;
            }
        }
    }

    const handleWhatsApp = () => {
        if (!isAuthenticated) {
            onContactClick();
        } else if (displayData.whatsapp) {
            if (onInitiateContact(profileData)) {
                window.open(`https://wa.me/${displayData.whatsapp}`, '_blank');
            }
        }
    }
    
    const handleBook = () => {
        if (!isAuthenticated) {
            onContactClick();
        } else {
            if (onInitiateContact(profileData)) {
                onBook(profileData);
            }
        }
    }
    
    const handleViewCatalogue = () => {
        if (hasCatalogue) {
            setGalleryTab('catalogue');
        }
    }

    const handleJoin = () => {
        if (!isAuthenticated) {
            onContactClick();
        } else {
            if (onInitiateContact(profileData)) {
                onJoin(profileData);
            }
        }
    };

    const handleViewMenu = () => {
        setShowRestaurantMenu(true);
    };
    
    const handleMemberSelect = (member: Member) => {
        setIsFading(true);
        setTimeout(() => {
            setSelectedMember(member);
            setDetailsKey(member.id);
            setIsFading(false);
        }, 150);
    };

    const handleVerify = () => {
        onUpdate({ ...profileData, isVerified: true });
    };

    const handleUnverify = (reason: string) => {
        if (reason.trim()) {
            onUpdate({ ...profileData, isVerified: false });
            setShowUnverifyModal(false);
            alert(`User has been un-verified. Reason: ${reason}`);
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the profile for ${profileData.name}?`)) {
            onDelete(profileData.id);
        }
    };

    const handleFlagButtonClick = () => {
        if (isFlaggedByUser) {
            alert(`You have already reported this profile. It has been flagged by ${profileData.flagCount} user(s) in total.`);
        } else {
            setShowFlagModal(true);
        }
    };

    const handleFlagSubmit = (reason: string) => {
        onFlag(reason);
        setShowFlagModal(false);
    };

    const profileUrl = `https://nikosoko-app/profile/${profileData.id}`;
    
    const ctaConfig: Record<ServiceProvider['cta'][number], { label: string; icon: React.ReactNode; action: () => void, primary?: boolean }> = {
        call: { label: 'Call', icon: <CallIcon />, action: handleCall },
        whatsapp: { label: 'WhatsApp', icon: <WhatsAppIcon />, action: handleWhatsApp, primary: true },
        book: { label: 'Book', icon: <CalendarIcon />, action: handleBook, primary: true },
        catalogue: { label: profileData.accountType === 'organization' ? 'Courses' : 'Catalogue', icon: <CatalogueIcon />, action: handleViewCatalogue },
        join: { label: 'Join Us', icon: <UserPlusIcon />, action: handleJoin, primary: true },
        menu: { label: 'Menu', icon: <MenuIcon />, action: handleViewMenu, primary: true },
    };
    
    const allCtaOptions: {value: ServiceProvider['cta'][number], label: string}[] = [
        {value: 'call', label: 'Call'}, {value: 'whatsapp', label: 'WhatsApp'}, {value: 'book', label: 'Book'}, {value: 'catalogue', label: 'Catalogue'}, {value: 'join', label: 'Join Us'}, {value: 'menu', label: 'Menu'},
    ];

    const handleCtaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const ctaValue = value as ServiceProvider['cta'][number];
        
        setEditedCtas(prev => {
            if (checked) {
                if (prev.length < 2 && !prev.includes(ctaValue)) {
                    return [...prev, ctaValue];
                }
                return prev; // Limit to 2
            } else {
                return prev.filter(c => c !== ctaValue);
            }
        });
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-gray-50 h-screen flex flex-col overflow-hidden font-sans">
            <input type="file" ref={coverImageInputRef} onChange={handleCoverImageChange} accept="image/*" className="hidden" />
            <input type="file" ref={avatarImageInputRef} onChange={handleAvatarImageChange} accept="image/*" className="hidden" />
            
            {showFlagModal && <FlagModal onClose={() => setShowFlagModal(false)} onFlag={handleFlagSubmit} />}
            {showUnverifyModal && <UnverifyModal onClose={() => setShowUnverifyModal(false)} onUnverify={handleUnverify} />}
            {showRestaurantMenu && (
                <RestaurantMenuModal 
                    provider={profileData} 
                    onClose={() => setShowRestaurantMenu(false)} 
                    isOwner={isOwner}
                    onUpdateProvider={onUpdate}
                />
            )}

            {selectedCatalogueItem && (
                <CatalogueItemDetailModal
                    item={selectedCatalogueItem}
                    onClose={() => setSelectedCatalogueItem(null)}
                    provider={profileData}
                    isAuthenticated={isAuthenticated}
                    onAuthClick={onContactClick}
                    onInitiateContact={onInitiateContact}
                />
            )}
             {selectedSkill && <SkillDetailModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
            
            <div>
                {/* Cover and Header */}
                <div className="relative">
                    <div className="h-40 bg-gray-300 relative">
                        <img src={editedCoverImage || profileData.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                        {isEditing && (
                            <button onClick={() => coverImageInputRef.current?.click()} className="absolute inset-0 bg-black bg-opacity-40 hover:bg-opacity-60 transition-all flex items-center justify-center text-white text-sm font-semibold">
                                Change Banner
                            </button>
                        )}
                    </div>
                    <button onClick={onBack} className="absolute top-3 left-3 bg-black bg-opacity-50 text-white rounded-full p-1.5 z-10 hover:bg-opacity-75 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="absolute top-3 right-3 flex items-center space-x-2">
                        {!isOwner && (
                            <button onClick={handleFlagButtonClick} className="bg-white bg-opacity-80 rounded-full p-2 flex items-center gap-1 text-xs" title="Flag this profile">
                            <FlagIcon />
                            {profileData.flagCount > 0 && <span className="font-bold">{profileData.flagCount}</span>}
                            </button>
                        )}
                        {canEdit && !isEditing && (
                            <div className="relative">
                                <button onClick={() => setShowMenu(p => !p)} className="bg-white bg-opacity-80 rounded-full p-1.5">
                                    <SettingsIcon />
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                                        <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Edit Profile</button>
                                        {isOwner && <button onClick={() => { onLogout(); setShowMenu(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Logout</button>}
                                        {isSuperAdmin && <button onClick={() => { handleDelete(); setShowMenu(false); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">Delete Profile</button>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Profile Pic or Group Avatars */}
                    {!isGroupProfile && profileData.accountType !== 'organization' && (
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white bg-gray-200 shadow-lg group">
                            <img className="rounded-full object-cover w-full h-full" src={editedAvatar || profileData.avatarUrl} alt={profileData.name} />
                            {isEditing && (
                                <button onClick={() => avatarImageInputRef.current?.click()} className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 rounded-full flex items-center justify-center text-white text-xs font-semibold transition-all">
                                    Change
                                </button>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Profile Info */}
                <div className={`${(isGroupProfile || profileData.accountType === 'organization') ? 'pt-6' : 'pt-14'} text-center px-4`}>
                    <div className="flex items-center justify-center space-x-2">
                        <h1 className="text-2xl font-bold text-brand-navy">{isOwner ? `$KILL ID: ${profileData.name.split(' ')[0].toUpperCase()}-${profileData.id.slice(0,4)}` : profileData.name}</h1>
                        {profileData.isVerified ? (
                            <VerifiedIcon 
                                className="w-6 h-6 text-blue-500" 
                                onClick={isSuperAdmin ? () => setShowUnverifyModal(true) : undefined}
                            />
                        ) : (
                            isSuperAdmin && !isEditing && <button onClick={handleVerify} className="text-xs bg-yellow-400 text-yellow-900 font-bold px-2 py-1 rounded-md hover:bg-yellow-500">Verify</button>
                        )}
                    </div>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editedService} 
                            onChange={(e) => setEditedService(e.target.value)} 
                            className="text-md text-gray-600 bg-gray-100 border border-gray-300 rounded-md text-center mt-1 px-2 py-1"
                        />
                    ) : (
                        <p className="text-md text-gray-600">{profileData.service}</p>
                    )}
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editedLocation} 
                            onChange={(e) => setEditedLocation(e.target.value)} 
                            placeholder="e.g. Westlands, Nairobi"
                            className="text-sm text-gray-500 bg-gray-100 border border-gray-300 rounded-md text-center mt-1 px-2 py-1"
                        />
                    ) : (
                        <p className="text-sm text-gray-500 mt-1">{profileData.location}</p>
                    )}
                </div>

                {isGroupProfile && profileData.members && (
                    <MembersScroller
                        members={profileData.members}
                        selectedMemberId={selectedMember?.id || '0'}
                        onSelectMember={handleMemberSelect}
                    />
                )}

                {/* Stats */}
                <div key={detailsKey} className={`mt-4 flex justify-around items-center text-gray-600 border-t border-b border-gray-200 py-3 transition-opacity duration-150 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-brand-navy">{displayData.rating.toFixed(1) || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-gray-500">Rating</p>
                    </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                            <LocationIcon className="w-4 h-4 text-red-500" />
                            <span className="font-bold text-brand-navy">{displayData.distanceKm}km</span>
                        </div>
                        <p className="text-xs text-gray-500">Distance</p>
                    </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                            <RateIcon className="w-4 h-4 text-green-500" />
                            {isEditing && canEdit ? (
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-brand-navy">{profileData.currency}</span>
                                    <input 
                                        type="number"
                                        value={editedRate}
                                        onChange={e => setEditedRate(e.target.value)}
                                        className="w-16 text-center bg-gray-100 border border-gray-300 rounded-md px-1 py-0.5"
                                    />
                                    <span>/</span>
                                    <select 
                                        value={editedRateType} 
                                        onChange={e => setEditedRateType(e.target.value as ServiceProvider['rateType'])}
                                        className="text-xs bg-gray-100 border border-gray-300 rounded-md py-0.5"
                                    >
                                        {Object.entries(rateSuffix).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                            <span className="font-bold text-brand-navy">{displayData.currency}{displayData.hourlyRate}/{rateSuffix[displayData.rateType]}</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">Rate</p>
                    </div>
                </div>
                {isEditing && (
                    <div className="px-4 py-4 border-b">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action Buttons (Select up to 2)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {allCtaOptions.map(option => (
                                 <label key={option.value} className="flex items-center p-2 border rounded-md bg-white">
                                    <input 
                                        type="checkbox" 
                                        value={option.value} 
                                        checked={editedCtas.includes(option.value)}
                                        onChange={handleCtaChange}
                                        disabled={!editedCtas.includes(option.value) && editedCtas.length >= 2}
                                        className="text-brand-navy focus:ring-brand-gold"
                                    />
                                    <span className="ml-2 text-sm text-gray-800">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                {/* CTA Buttons */}
                {!isEditing && (
                    <div className="px-4 pt-4">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => onToggleSaveContact(profileData.id)} className={`p-3 rounded-xl transition flex-shrink-0 active-scale ${isSaved ? 'bg-brand-gold/20 text-brand-gold' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                                <BookmarkIcon filled={isSaved} />
                            </button>
                            {(profileData.cta || []).map((ctaKey) => {
                                const cta = ctaConfig[ctaKey];
                                if (!cta) return null;
                                const isPrimary = cta.primary || (profileData.cta || []).length === 1;
                                const buttonClass = isPrimary 
                                    ? "bg-brand-gold text-brand-navy hover:opacity-90" 
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300";
                                return (
                                    <button key={ctaKey} onClick={cta.action} className={`flex-1 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 active-scale ${buttonClass}`}>
                                        {cta.icon} <span>{cta.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                {isEditing && (
                    <div className="px-4 pt-4 flex items-center space-x-3">
                        <button onClick={handleCancelEdit} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl active-scale">Cancel</button>
                        <button onClick={handleSave} className="flex-1 bg-brand-navy text-white font-bold py-3 px-4 rounded-xl active-scale">Save Changes</button>
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="p-4 space-y-4">
                    {/* About/Skills Section */}
                    <div>
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button
                                    onClick={() => setMainContentTab('about')}
                                    className={`${mainContentTab === 'about' ? 'border-brand-gold text-brand-navy' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                                >
                                    About {isGroupProfile ? profileData.name : ''}
                                </button>
                                {hasSkills && (
                                     <button
                                        onClick={() => setMainContentTab('skills')}
                                        className={`${mainContentTab === 'skills' ? 'border-brand-gold text-brand-navy' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        $kills
                                    </button>
                                )}
                            </nav>
                        </div>
                        <div className="mt-4 animate-fade-in">
                             {mainContentTab === 'about' && (
                                isEditing ? (
                                    <textarea 
                                        value={editedAbout}
                                        onChange={(e) => setEditedAbout(e.target.value)}
                                        rows={5}
                                        className="w-full text-sm text-gray-700 leading-relaxed bg-gray-100 border border-gray-300 rounded-md p-2"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-700 leading-relaxed">{profileData.about}</p>
                                )
                            )}
                            {mainContentTab === 'skills' && hasSkills && (
                                <div className="space-y-3">
                                    {profileData.skills?.map(skill => (
                                        <SkillCard key={skill.id} skill={skill} onClick={() => setSelectedSkill(skill)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Linked Asset Section */}
                    {linkedAsset && (
                        <div>
                            <h2 className="text-md font-semibold text-gray-800 mt-4">Primary Asset</h2>
                            <div className="mt-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800">{linkedAsset.items?.[0]?.description || linkedAsset.model}</p>
                                        <p className="text-xs font-mono text-gray-500 mt-1">{linkedAsset.registrationNumber || linkedAsset.items?.[0]?.serial}</p>
                                        {linkedAsset.verificationStatus === 'Verified' ? (
                                            <p className="text-xs font-semibold text-blue-600 mt-1">Verified Asset</p>
                                        ) : (
                                            <p className="text-xs font-semibold text-yellow-600 mt-1">Verification Pending</p>
                                        )}
                                    </div>
                                    <button onClick={() => onViewDocument(linkedAsset)} className="text-sm font-semibold text-blue-600">Details &rarr;</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabbed section for Gallery and QR Code */}
                    <div>
                        <div className="border-b border-gray-200 mt-4">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                {hasWorks && (
                                    <button
                                        onClick={() => setGalleryTab('works')}
                                        className={`${galleryTab === 'works' ? 'border-brand-gold text-brand-navy' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        Gallery
                                    </button>
                                )}
                                {hasCatalogue && (
                                    <button
                                        onClick={() => setGalleryTab('catalogue')}
                                        className={`${galleryTab === 'catalogue' ? 'border-brand-gold text-brand-navy' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                                    >
                                        {profileData.accountType === 'organization' ? 'Courses' : 'Catalogue'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setGalleryTab('qr')}
                                    className={`${galleryTab === 'qr' ? 'border-brand-gold text-brand-navy' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                                >
                                    QR Code
                                </button>
                            </nav>
                        </div>
                        <div key={galleryTab} className="mt-4 animate-fade-in">
                            {galleryTab === 'works' && hasWorks && (
                                <div className="grid grid-cols-3 gap-2">
                                    {profileData.works.map((workUrl, index) => (
                                        <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                            <img src={workUrl} alt={`Work sample ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {galleryTab === 'catalogue' && hasCatalogue && (
                                <div className="grid grid-cols-2 gap-3">
                                    {catalogueItems.map((item) => (
                                        <CatalogueItemCard key={item.id} item={item} onClick={() => setSelectedCatalogueItem(item)} />
                                    ))}
                                </div>
                            )}
                            {galleryTab === 'qr' && (
                                <div className="bg-white p-4 rounded-lg flex flex-col items-center justify-center">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileUrl)}`} 
                                    alt="Contact QR Code"
                                    className="w-36 h-36"
                                />
                                <p className="text-sm text-gray-600 mt-3 text-center">Scan this code to quickly view {profileData.name}'s profile.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
