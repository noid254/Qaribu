
import React, { useState, useEffect, useMemo } from 'react';
import * as api from './services/api';
import { 
  ServiceProvider, CatalogueItem, Document, QaRibuRequest, SpecialBanner, 
  InboxMessage, Gig, Premise, UnitDetails, SetupData, CurrentPage, OrderData, BusinessAssets, UnitKey 
} from './types';

import AuthModal from './components/AuthModal';
import SideMenu from './components/SideMenu';
import NikoSoko from './components/NikoSoko';
import ServiceMarketplace from './components/ServiceMarketplace';
import MyPlaces from './components/MyPlaces';
import GatePass from './components/GatePass';
import JourneyPage from './components/JourneyPage';
import InvoiceHub from './components/InvoiceHub';
import InvoiceGenerator from './components/InvoiceGenerator';
import QuoteGenerator from './components/QuoteGenerator';
import ReceiptGenerator from './components/ReceiptGenerator';
import BrandKitView from './components/BusinessAssets';
import MyDocumentsView from './components/MyDocumentsView';
import ScanDocumentView from './components/ScanDocumentView';
import Tukosoko from './components/Tukosoko';
import MyContactsView from './components/MyContactsView';
import CatalogueView from './components/CatalogueView';
import SettingsView from './components/SettingsView';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import GigsPage from './components/GigsPage';
import CreatePostView from './components/CreatePostView';
import CreateProductPostView from './components/CreateProductPostView';
import AddServiceCardView from './components/AddServiceCardView';
import MessageCenterView from './components/MessageCenterView';
import AssetRegistryView from './components/AssetRegistryView';
import RegisterAssetView from './components/RegisterAssetView';
import OwnershipCheckView from './components/OwnershipCheckView';
import DocumentDetailView from './components/DocumentDetailView';
import MyToolkit from './components/MyToolkit';
import WorkshopSetup from './components/WorkshopSetup';
import QRScannerView from './components/QRScannerView';
import HostSetup from './components/HostSetup';
import ManageOrderView from './components/ManageOrderView';
import PremisePublicView from './components/PremisePublicView';
import ProfileView from './components/ProfileView';
import ReviewModal from './components/ReviewModal';
import DoorProfile from './components/DoorProfile';

function App() {
  const [currentUser, setCurrentUser] = useState<ServiceProvider | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Rating & Review State
  const [pendingReviews, setPendingReviews] = useState<ServiceProvider[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Data State
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [qaribuRequests, setQaRibuRequests] = useState<QaRibuRequest[]>([]);
  const [specialBanners, setSpecialBanners] = useState<SpecialBanner[]>([]);
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [premises, setPremises] = useState<Premise[]>([]);

  // View State
  const [viewingProvider, setViewingProvider] = useState<ServiceProvider | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedPremise, setSelectedPremise] = useState<Premise | null>(null);
  const [manageOrderData, setManageOrderData] = useState<OrderData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanResult, setScanResult] = useState<{ allowed: boolean; message: string; request?: QaRibuRequest, user?: ServiceProvider, accessDetails?: { purpose: string, duration: string, role: string } } | null>(null);
  
  // Door Profile State
  const [doorProfileData, setDoorProfileData] = useState<{ unit: UnitKey; tenant?: ServiceProvider; viewSource: 'scan' | 'online' } | null>(null);
  const [isScanningSession, setIsScanningSession] = useState(false);

  // Setup State
  const [scannedSetupData, setScannedSetupData] = useState<SetupData | null>(null);
  const [selectedTools, setSelectedTools] = useState<CurrentPage[]>(['qaribu', 'invoices', 'myplaces', 'services', 'tukosoko', 'journey']);
  const [businessAssets, setBusinessAssets] = useState<BusinessAssets | null>(null);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        let token = api.getToken();
        
        // Load persistent business assets
        const savedAssets = localStorage.getItem('nikosoko_business_assets');
        if (savedAssets) {
            try {
                setBusinessAssets(JSON.parse(savedAssets));
            } catch (e) {
                console.error("Failed to parse business assets", e);
            }
        }

        // Auto-login logic for Super Admin as default if no session
        if (!token) {
            try {
                // Attempt to auto-login as super admin
                const res = await api.verifyOtp('254723119356', '3232');
                if (res.token && res.user) {
                    api.setToken(res.token);
                    token = res.token;
                    setCurrentUser(res.user);
                    setIsAuthenticated(true);
                    setIsSuperAdmin(res.isSuperAdmin);
                }
            } catch (e) {
                console.warn("Auto-login failed:", e);
            }
        } else {
             // Check Auth and update state if token exists
            const user = await api.getMyProfile().catch(() => null);
            if (user) {
              setCurrentUser(user);
              setIsAuthenticated(true);
              if (user.phone === '254723119356') setIsSuperAdmin(true);
            } else {
                api.clearToken(); // Invalid token
            }
        }

        const [
          providersData, 
          catalogueData, 
          docsData, 
          requestsData, 
          bannersData, 
          messagesData, 
          gigsData,
          catsData,
          premisesData
        ] = await Promise.all([
          api.getProviders(),
          api.getCatalogueItems(),
          api.getDocuments(),
          api.getQaRibuRequests(),
          api.getSpecialBanners(),
          api.getInboxMessages(),
          api.getGigs(),
          api.getCategories(),
          api.getPremises()
        ]);

        setProviders(providersData);
        setCatalogueItems(catalogueData);
        setDocuments(docsData);
        setQaRibuRequests(requestsData);
        setSpecialBanners(bannersData);
        setInboxMessages(messagesData);
        setGigs(gigsData);
        setCategories(catsData);
        setPremises(premisesData);

        // Check URL for manage order
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page');
        const data = params.get('data');
        if (page === 'manage_order' && data) {
          try {
            const decoded = JSON.parse(atob(data));
            setManageOrderData(decoded);
            setCurrentPage('manage_order');
          } catch (e) {
            console.error("Failed to parse order data", e);
          }
        }

      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogin = (data: any, phone: string) => {
    if (data.success && data.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setIsSuperAdmin(data.isSuperAdmin);
        api.setToken(data.token);
        setIsAuthModalOpen(false);
    } else if (data.success && !data.user) {
        // New user
        setIsAuthenticated(true); // Partially authenticated for setup
        api.setToken(data.token);
        setCurrentUser({ phone } as any); // Temporary user object
        setCurrentPage('addService'); // Redirect to create profile
        setIsAuthModalOpen(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    api.clearToken();
    setCurrentPage('home');
  };

  const handleSelectProvider = (provider: ServiceProvider) => {
    setViewingProvider(provider);
    setCurrentPage('profile');
  };

  // --- Interaction & Rating Logic ---
  
  const handleInitiateContact = (provider: ServiceProvider): boolean => {
      // 1. Check if user has reached the postponement limit
      if (pendingReviews.length >= 5) {
          setShowReviewModal(true);
          return false; // Block interaction
      }

      // 2. If allow interaction, add provider to pending reviews list if not already there
      const isPending = pendingReviews.some(p => p.id === provider.id);
      if (!isPending) {
          setPendingReviews(prev => [...prev, provider]);
          
          // Optional: Random chance to show soft prompt immediately for engagement, 
          // or just wait for them to accumulate. 
          // Let's show soft prompt occasionally (e.g., if we have > 2 pending)
          if (pendingReviews.length >= 2) {
              setShowReviewModal(true);
          }
      }
      
      return true; // Allow interaction
  };

  const handleSubmitReview = (providerId: string, rating: number, comment: string) => {
      // Mock API call to save review
      console.log(`Review submitted for ${providerId}: ${rating} stars, "${comment}"`);
      
      // Update local provider stats mock (optional visual feedback)
      const providerIdx = providers.findIndex(p => p.id === providerId);
      if (providerIdx > -1) {
          // just a visual mock update for the session
          const p = providers[providerIdx];
          // p.rating = ((p.rating * 10) + rating) / 11; // Simple moving average mock
      }

      // Remove from pending list
      const updatedPending = pendingReviews.filter(p => p.id !== providerId);
      setPendingReviews(updatedPending);

      // If no more reviews, close modal automatically
      if (updatedPending.length === 0) {
          setShowReviewModal(false);
      }
  };

  const handleScanSuccess = async (data: string) => {
    if (data.startsWith('MASTER:')) {
        const parts = data.split(':');
        const roleType = parts[1];
        if (roleType === 'TENANT') {
            // MASTER:TENANT:premiseId:unitId
            setScannedSetupData({ role: 'TenantAdmin', premiseId: parts[2], unitId: parts[3] });
            setCurrentPage('hostSetup');
        } else if (roleType === 'GATEMAN') {
            // MASTER:GATEMAN:premiseId
            setScannedSetupData({ role: 'Gateman', premiseId: parts[2] });
            setCurrentPage('hostSetup');
        } else if (roleType === 'COHOST') {
            // MASTER:COHOST:premiseId:unitId:adminId
            setScannedSetupData({ role: 'Staff', premiseId: parts[2], unitId: parts[3], adminId: parts[4] });
            setCurrentPage('hostSetup');
        }
    } else if (data.startsWith('PREMISE:')) {
        const premiseId = data.split(':')[1];
        const premise = premises.find(p => p.id === premiseId);
        
        // Check if we have a valid invite for this premise
        if (currentUser && premise) {
            const activePass = qaribuRequests.find(r => 
                r.premiseId === premise.id && 
                r.visitorPhone === currentUser.phone && 
                (r.status === 'Approved' || r.status === 'CheckedIn')
            );

            if (activePass) {
                // Valid Invite Found: Notify Gateman (Simulated) and Show Access Pass
                alert(`Welcome back to ${premise.name}! The security team has been notified of your arrival.`);
                // In a real app, send API call here: api.notifyArrival(premise.id, currentUser.id);
                setCurrentPage('qaribu'); // Redirect to Wallet
                return;
            }
        }

        if (premise) {
            setSelectedPremise(premise);
            setIsScanningSession(true); // Enable "Check-in Mode" for premise view
            setCurrentPage('premiseLanding'); // Redirect to Directory/Explore
        }
    } else if (currentUser?.role === 'Gateman' && currentUser.premiseId && (data.startsWith('QARIBU:') || data.startsWith('PROFILE:') || /^\d+$/.test(data))) {
        // Gateman Scanning for Entry (Simulated or Real)
        try {
            const result = await api.verifyEntry(data, currentUser.premiseId);
            setScanResult(result);
            // Ensure we are on the Qaribu page to see the result modal
            setCurrentPage('qaribu');
        } catch (e) {
            alert("Verification Error: " + (e as Error).message);
        }
    } else if (data.startsWith('PROFILE:')) {
        const userId = data.split(':')[1];
        const user = providers.find(p => p.id === userId);
        if (user) handleSelectProvider(user);
    } else {
        alert(`Scanned Code: ${data}`);
    }
  };

  const handleCompleteHostSetup = async (details: UnitDetails) => {
      if (!currentUser || !scannedSetupData) return;
      try {
          const updatedUser = await api.linkUserToRole(currentUser.id, scannedSetupData, details);
          setCurrentUser(updatedUser);
          // FIX: Update global providers list so the user's new role is reflected everywhere
          setProviders(prev => prev.map(p => p.id === updatedUser.id ? updatedUser : p));
          
          if (scannedSetupData.role === 'TenantAdmin') {
              alert("Unit setup complete! You are now a Host.");
          } else if (scannedSetupData.role === 'Gateman') {
              alert("Access Granted. You are now a Gateman.");
          } else if (scannedSetupData.role === 'Staff') {
              alert("Access Granted. You are now a Co-host.");
          }

          setCurrentPage('qaribu');
          setScannedSetupData(null);
      } catch (err) {
          alert("Failed to assign role.");
      }
  };

  const handleUpdatePremise = async (updatedPremise: Premise) => {
      const savedPremise = await api.updatePremise(updatedPremise);
      setPremises(prev => prev.map(p => p.id === savedPremise.id ? savedPremise : p));
      setSelectedPremise(savedPremise); // Update the current view
  };

  const handleBusinessSetupComplete = (assets: BusinessAssets) => {
      setBusinessAssets(assets);
      localStorage.setItem('nikosoko_business_assets', JSON.stringify(assets));
      // No navigation needed, React will re-render InvoiceHub because businessAssets is now truthy
  };

  // Helper to open door profile
  const openDoorProfile = (unit: UnitKey, tenant?: ServiceProvider) => {
      // Use scanning session state to determine context
      setDoorProfileData({ unit, tenant, viewSource: isScanningSession ? 'scan' : 'online' });
      setCurrentPage('doorProfile');
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    switch (currentPage) {
      case 'home':
        return (
          <NikoSoko
            providers={providers}
            onSelectProvider={handleSelectProvider}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onBack={() => setIsSideMenuOpen(true)}
            onMessagesClick={() => setCurrentPage('messages')}
            hasNewMessages={inboxMessages.length > 0}
            specialBanners={specialBanners}
            onNavigate={setCurrentPage}
          />
        );
      case 'services':
        return (
          <ServiceMarketplace
            providers={providers}
            specialBanners={specialBanners}
            onSelectProvider={handleSelectProvider}
            onBack={() => setCurrentPage('home')}
            onMessagesClick={() => setCurrentPage('messages')}
            hasNewMessages={inboxMessages.length > 0}
            onNavigate={setCurrentPage}
          />
        );
      case 'tukosoko':
        return (
          <Tukosoko
            items={catalogueItems}
            providers={providers}
            specialBanners={specialBanners}
            onSelectProvider={handleSelectProvider}
            onBack={() => setCurrentPage('home')}
            onMessagesClick={() => setCurrentPage('messages')}
            hasNewMessages={inboxMessages.length > 0}
            onNavigate={setCurrentPage}
          />
        );
      case 'myplaces':
        return (
          <MyPlaces
            providers={providers}
            onSelectProvider={handleSelectProvider}
            onNavigate={setCurrentPage}
          />
        );
      case 'qaribu':
        // Identify all premises managed by the current user
        const managedPremises = premises.filter(p => p.buildingManagerId === currentUser?.id);
        // If user is a tenant, find their premise
        const tenantPremise = premises.find(p => p.id === currentUser?.premiseId);
        // Combine for GatePass prop (mostly for tenant context if not a manager)
        // If manager has 1 premise, pass it as default. If > 1, pass array.
        const associatedPremise = managedPremises.length === 1 ? managedPremises[0] : tenantPremise;

        return (
          <GatePass
            allProviders={providers}
            allTenants={providers.filter(p => p.accountType === 'organization' || p.premiseId)}
            premise={associatedPremise} // Legacy/Single prop
            managedPremises={managedPremises} // Multi-premise prop
            currentUser={currentUser}
            isAuthenticated={isAuthenticated}
            qaribuRequests={qaribuRequests}
            onCreateRequest={async (data) => { const req = await api.createQaRibuRequest(data); setQaRibuRequests(prev => [req, ...prev]); }}
            onUpdateRequestStatus={async (id, status) => { await api.updateQaRibuRequestStatus(id, status); setQaRibuRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r)); }}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onGoToSignup={() => setCurrentPage('login')}
            onSelectProvider={handleSelectProvider}
            onScanClick={() => setCurrentPage('qrScan')}
            onRegisterPremise={async (data) => { const p = await api.registerPremise(data.name || 'New Premise', currentUser?.id || 'sa1', data); setPremises(prev => [...prev, p]); }}
            onBack={() => setCurrentPage('home')}
            onUpdateHostDetails={async (details) => {
               if(!currentUser) return;
               const updated = await api.updateProvider({ ...currentUser, unitDetails: details });
               setCurrentUser(updated);
            }}
            onUpdateProfile={async (updates) => {
                if(!currentUser) return;
                const updated = await api.updateProvider({ ...currentUser, ...updates });
                setCurrentUser(updated);
                // Also update the provider list to reflect changes immediately across the app
                setProviders(prev => prev.map(p => p.id === updated.id ? updated : p));
            }}
            scanResult={scanResult}
            onClearScanResult={() => setScanResult(null)}
            onUpdatePremise={handleUpdatePremise}
          />
        );
      case 'journey':
        return (
          <JourneyPage
            providers={providers}
            currentUser={currentUser}
            onSelectProvider={handleSelectProvider}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'invoices':
        if (!businessAssets) {
            return (
                <WorkshopSetup 
                    onSetupComplete={handleBusinessSetupComplete}
                    onBack={() => setCurrentPage('home')}
                />
            );
        }
        return (
          <InvoiceHub
            onNavigate={setCurrentPage}
            onBack={() => setCurrentPage('home')}
            onEditBusiness={() => setBusinessAssets(null)}
          />
        );
      case 'invoiceGenerator':
        if (!businessAssets) {
             return <WorkshopSetup onSetupComplete={(assets) => { handleBusinessSetupComplete(assets); }} onBack={() => setCurrentPage('invoices')} />;
        }
        return (
          <InvoiceGenerator
            assets={businessAssets}
            onSave={async (doc) => { 
                const newDoc = await api.addDocument(doc); 
                setDocuments(prev => [newDoc, ...prev]); 
                // Do not navigate immediately, let the component handle the "Share" step
            }}
            onBack={() => setCurrentPage('invoices')}
            onComplete={() => setCurrentPage('myDocuments')} // New prop for final navigation
          />
        );
      case 'quoteGenerator':
        if (!businessAssets) {
             return <WorkshopSetup onSetupComplete={(assets) => { handleBusinessSetupComplete(assets); }} onBack={() => setCurrentPage('invoices')} />;
        }
        return (
          <QuoteGenerator
            assets={businessAssets}
            onSave={async (doc) => { const newDoc = await api.addDocument(doc); setDocuments(prev => [newDoc, ...prev]); setCurrentPage('myDocuments'); }}
            onBack={() => setCurrentPage('invoices')}
          />
        );
      case 'receiptGenerator':
        if (!businessAssets) {
             return <WorkshopSetup onSetupComplete={(assets) => { handleBusinessSetupComplete(assets); }} onBack={() => setCurrentPage('invoices')} />;
        }
        return (
          <ReceiptGenerator
            assets={businessAssets}
            onSave={async (doc) => { const newDoc = await api.addDocument(doc); setDocuments(prev => [newDoc, ...prev]); setCurrentPage('myDocuments'); }}
            onBack={() => setCurrentPage('invoices')}
          />
        );
      case 'myDocuments':
        return (
          <MyDocumentsView
            documents={documents}
            onScan={() => setCurrentPage('scanDocument')}
            onSelectDocument={(doc) => { setSelectedDocument(doc); setCurrentPage('documentDetail'); }}
            currentUser={currentUser}
            onBack={() => setCurrentPage('invoices')}
          />
        );
      case 'documentDetail':
        return selectedDocument ? (
          <DocumentDetailView
            document={selectedDocument}
            onBack={() => setCurrentPage('myDocuments')}
            onUpdate={(updatedDoc) => {
                setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
                setSelectedDocument(updatedDoc);
            }}
            currentUser={currentUser || { id: 'guest', name: 'Guest', phone: '' } as any}
          />
        ) : null;
      case 'scanDocument':
        return (
          <ScanDocumentView
            onBack={() => setCurrentPage('myDocuments')}
            onSave={async (doc) => { const newDoc = await api.addDocument(doc); setDocuments(prev => [newDoc, ...prev]); setCurrentPage('assetRegistry'); }}
          />
        );
      case 'profile':
        return viewingProvider ? (
          <ProfileView
            profileData={viewingProvider}
            isOwner={currentUser?.id === viewingProvider.id}
            isAuthenticated={isAuthenticated}
            isSuperAdmin={isSuperAdmin}
            currentUserPhone={currentUser?.phone}
            onBack={() => setCurrentPage('home')}
            onLogout={handleLogout}
            onUpdate={async (updated) => { 
                const res = await api.updateProvider(updated); 
                setProviders(prev => prev.map(p => p.id === res.id ? res : p));
                if (currentUser?.id === res.id) setCurrentUser(res);
                setViewingProvider(res);
            }}
            onDelete={async (id) => { await api.deleteProvider(id); setCurrentPage('home'); }}
            onContactClick={() => setIsAuthModalOpen(true)}
            onInitiateContact={handleInitiateContact}
            savedContacts={[]}
            onToggleSaveContact={() => {}}
            catalogueItems={catalogueItems.filter(i => i.providerId === viewingProvider.id)}
            onBook={() => {}}
            onJoin={() => {}}
            isFlaggedByUser={false}
            onFlag={() => {}}
            allDocuments={documents}
            onViewDocument={(doc) => { setSelectedDocument(doc); setCurrentPage('documentDetail'); }}
          />
        ) : null;
      case 'mycontacts':
        return (
          <MyContactsView
            contacts={providers.filter(p => currentUser?.id !== p.id)} // Mock contacts
            onSelectContact={handleSelectProvider}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'mycatalogue':
        return (
          <CatalogueView
            items={catalogueItems.filter(i => i.providerId === currentUser?.id)}
            onUpdateItems={items => setCatalogueItems(items)} // In real app, would update API
            currentUser={currentUser}
            onUpdateUser={updated => setCurrentUser(updated)}
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onInitiateContact={handleInitiateContact}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'settings':
        return <SettingsView onBack={() => setCurrentPage('home')} />;
      case 'admin':
        return (
          <SuperAdminDashboard
            onBack={() => setCurrentPage('home')}
            providers={providers}
            onUpdateProvider={async (p) => { await api.updateProvider(p); setProviders(prev => prev.map(pr => pr.id === p.id ? p : pr)); }}
            onDeleteProvider={async (id) => { await api.deleteProvider(id); setProviders(prev => prev.filter(p => p.id !== id)); }}
            onViewProvider={handleSelectProvider}
            categories={categories}
            onAddCategory={async (c) => { /* api call */ setCategories(prev => [...prev, c]) }}
            onDeleteCategory={() => {}}
            onBroadcast={() => {}}
            specialBanners={specialBanners}
            onAddBanner={() => {}}
            onDeleteBanner={() => {}}
            onCreateOrganization={async (orgData) => {
                 await api.createProvider({
                     name: orgData.name,
                     service: orgData.service,
                     location: orgData.location,
                     about: orgData.about,
                     referralCode: orgData.referralCode,
                     accountType: 'organization',
                     avatarUrl: 'https://i.pravatar.cc/150?u=' + orgData.name, 
                     coverImageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800',
                     leaders: orgData.leaders,
                     isVerified: true,
                     // defaults
                     phone: '', 
                     rating: 5.0,
                     distanceKm: 0,
                     hourlyRate: 0,
                     rateType: 'per task',
                     currency: 'Ksh',
                     isOnline: true,
                     flagCount: 0,
                     views: 0,
                     cta: ['call'],
                     works: [],
                     category: 'Professional',
                 });
                 const newProviders = await api.getProviders();
                 setProviders(newProviders);
            }}
            onApproveRequest={() => {}}
            onRejectRequest={() => {}}
          />
        );
      case 'gigs':
        return (
          <GigsPage
            gigs={gigs}
            providers={providers}
            onSelectProvider={handleSelectProvider}
            onApply={() => {}}
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setIsAuthModalOpen(true)}
          />
        );
      case 'createPost':
        return <CreatePostView onNavigate={setCurrentPage} onBack={() => setCurrentPage('home')} />;
      case 'addService':
        return (
          <AddServiceCardView
            onBack={() => setCurrentPage('home')}
            onSave={async (data, name, avatar, referral, cta, linkedAsset) => {
                const newProvider = await api.createProvider({ 
                    ...data, 
                    name, 
                    avatarUrl: avatar || '', 
                    cta, 
                    linkedAssetId: linkedAsset,
                    usedReferralCode: referral 
                });
                setCurrentUser(newProvider);
                setIsAuthenticated(true);
                setCurrentPage('profile');
                setViewingProvider(newProvider);
            }}
            categories={categories}
            currentUser={currentUser}
            myAssets={documents.filter(d => d.isAsset && d.ownerPhone === currentUser?.phone)}
            onNavigate={setCurrentPage}
          />
        );
      case 'createProductPost':
        return (
          <CreateProductPostView
            onBack={() => setCurrentPage('home')}
            onSave={(item) => { /* API call to add item */ setCurrentPage('mycatalogue'); }}
          />
        );
      case 'messages':
        return <MessageCenterView onBack={() => setCurrentPage('home')} />;
      case 'assetRegistry':
        return (
          <AssetRegistryView
            documents={documents}
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            onSelectDocument={(doc) => { setSelectedDocument(doc); setCurrentPage('documentDetail'); }}
          />
        );
      case 'registerAsset':
        return (
          <RegisterAssetView
            onBack={() => setCurrentPage('assetRegistry')}
            onSave={async (doc) => { const newDoc = await api.addDocument(doc); setDocuments(prev => [newDoc, ...prev]); setCurrentPage('assetRegistry'); }}
          />
        );
      case 'ownershipCheck':
        return <OwnershipCheckView allDocuments={documents} />;
      case 'brandKit':
        return (
          <BrandKitView
            assets={{ name: currentUser?.name || '', address: currentUser?.location || '', logo: currentUser?.avatarUrl || null }}
            currentUser={currentUser}
            onSave={() => {}}
            onOrder={() => {}}
            onAddToCatalogue={() => {}}
          />
        );
      case 'mytoolkit':
        return (
          <MyToolkit
            allTools={[
                { label: 'Qaribu', icon: <span>🔑</span>, page: 'qaribu' },
                { label: 'Invoices', icon: <span>📄</span>, page: 'invoices' },
                { label: 'My Places', icon: <span>📍</span>, page: 'myplaces' },
                { label: 'Services', icon: <span>🛠️</span>, page: 'services' },
                { label: 'Market', icon: <span>🛒</span>, page: 'tukosoko' },
                { label: 'Journey', icon: <span>🚀</span>, page: 'journey' },
                { label: 'Admin', icon: <span>🛡️</span>, page: 'admin' },
                { label: 'Garage', icon: <span>🚗</span>, page: 'assetRegistry' },
            ]}
            selectedTools={selectedTools}
            onSave={setSelectedTools}
            onNavigate={setCurrentPage}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'qrScan':
        return (
          <QRScannerView
            onBack={() => setCurrentPage('home')}
            onScanSuccess={handleScanSuccess}
          />
        );
      case 'hostSetup':
        return scannedSetupData && currentUser ? (
          <HostSetup
            setupData={scannedSetupData}
            currentUser={currentUser}
            onSave={handleCompleteHostSetup}
            onBack={() => setCurrentPage('home')}
          />
        ) : null;
      case 'workshopSetup':
        return (
          <WorkshopSetup
            onSetupComplete={(assets) => { /* Save */ setCurrentPage('home'); }}
            onBack={() => setCurrentPage('home')}
          />
        );
      case 'manage_order':
        return manageOrderData ? (
          <ManageOrderView
            orderData={manageOrderData}
            nearbyRiders={providers.filter(p => p.category === 'TRANSPORT')}
            onBack={() => setCurrentPage('home')}
          />
        ) : null;
      case 'premiseLanding':
        return selectedPremise ? (
          <PremisePublicView
            premise={selectedPremise}
            tenants={providers.filter(p => p.premiseId === selectedPremise.id)}
            onBack={() => { 
                setCurrentPage('home'); 
                setIsScanningSession(false); // Reset scanning mode
            }}
            onSelectProvider={handleSelectProvider}
            onRequestAccess={async (data) => {
                await api.createQaRibuRequest(data as Omit<QaRibuRequest, 'id' | 'status'>);
                alert("Request Sent! The host will be notified.");
            }}
            isManager={currentUser?.id === selectedPremise.buildingManagerId}
            onUpdatePremise={handleUpdatePremise}
            onViewDoor={openDoorProfile}
          />
        ) : null;
      case 'doorProfile':
        return doorProfileData && selectedPremise ? (
            <DoorProfile 
                unit={doorProfileData.unit}
                premise={selectedPremise}
                tenant={doorProfileData.tenant}
                viewSource={doorProfileData.viewSource}
                onBack={() => setCurrentPage('premiseLanding')}
                onCheckIn={async (unit, tenant) => {
                    await api.createQaRibuRequest({
                        premiseId: selectedPremise.id,
                        premiseName: selectedPremise.name,
                        tenantId: tenant?.id,
                        hostId: tenant?.id || 'admin',
                        hostName: tenant?.name || `Unit ${unit.unitNumber}`,
                        visitorName: currentUser?.name || 'Guest',
                        visitorPhone: currentUser?.phone || '',
                        requestType: tenant ? 'Mediated' : 'Direct',
                        premiseType: selectedPremise.type || 'Commercial'
                    });
                    alert("Check-in Request Sent!");
                }}
                onContactHost={(type) => {
                    if (doorProfileData.tenant?.phone) {
                        if (type === 'call') window.open(`tel:${doorProfileData.tenant.phone}`);
                        else window.open(`https://wa.me/${doorProfileData.tenant.whatsapp || doorProfileData.tenant.phone}`);
                    } else {
                        window.open(`tel:${selectedPremise.contactPhone}`);
                    }
                }}
                onBook={() => {
                    alert("Booking flow coming soon! Contact host for now.");
                    if (selectedPremise.contactPhone) window.open(`tel:${selectedPremise.contactPhone}`);
                }}
                onViewCatalogue={() => {
                     if (doorProfileData.tenant) {
                        setViewingProvider(doorProfileData.tenant);
                        setCurrentPage('profile');
                    } else {
                         alert("No catalogue available for this unit.");
                    }
                }}
                currentUser={currentUser}
            />
        ) : null;
      case 'login':
        setTimeout(() => setIsAuthModalOpen(true), 0);
        setCurrentPage('home');
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        isSuperAdmin={isSuperAdmin}
        onLogout={handleLogout}
      />
      
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)} 
          onLogin={handleLogin} 
        />
      )}

      {showReviewModal && (
          <ReviewModal 
              pendingProviders={pendingReviews}
              isForced={pendingReviews.length >= 5}
              onRate={handleSubmitReview}
              onClose={() => setShowReviewModal(false)}
          />
      )}

      {renderContent()}
    </>
  );
}

export default App;
