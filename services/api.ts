
import { API_BASE_URL } from '../config';
import type { ServiceProvider, CatalogueItem, Document, QaRibuRequest, SpecialBanner, InboxMessage, Event, Premise, Gig, Ticket, UnitDetails, SetupData } from '../types';
import { mockProviders, mockCatalogueItems, mockDocuments, mockQaRibuRequests, mockSpecialBanners, mockInboxMessages, mockEvents, mockGigs, mockTickets, mockCategories, mockPremises } from './mockData';


// --- Auth Token Helpers ---
export const getToken = (): string | null => localStorage.getItem('authToken');
export const setToken = (token: string): void => localStorage.setItem('authToken', token);
export const clearToken = (): void => localStorage.removeItem('authToken');

// --- API Fetch Helper ---
const handleResponse = async (response: Response) => {
    if (response.status === 204) {
        return null; // No content for DELETE requests
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
};

const apiFetch = (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers }).then(handleResponse);
};

// --- Auth API ---
export const sendOtp = (phone: string): Promise<{ success: boolean }> => 
    new Promise(res => setTimeout(() => res({ success: true }), 500));


export interface VerifyOtpResponse {
    success: boolean;
    user: ServiceProvider | null;
    isSuperAdmin: boolean;
    token: string;
}

export const verifyOtp = (phone: string, otp: string): Promise<VerifyOtpResponse> => 
    new Promise((resolve, reject) => {
        setTimeout(() => {
            const isSuperAdminLogin = phone === '254723119356' && otp === '3232';

            // Allow superadmin login with specific OTP, or any non-empty OTP for other users for testing.
            if (isSuperAdminLogin || (phone !== '254723119356' && otp.length > 0)) {
                const existingUser = mockProviders.find(p => p.phone === phone);
                resolve({
                    success: true,
                    user: existingUser || null,
                    isSuperAdmin: isSuperAdminLogin, // isSuperAdmin is true only on superadmin login
                    token: 'mock-token-for-' + phone
                });
            } else {
                reject(new Error('Invalid OTP. Please try again.'));
            }
        }, 500);
    });

export const getMyProfile = (): Promise<ServiceProvider> => 
    new Promise((resolve, reject) => {
        setTimeout(() => {
            const token = getToken();
            if (token && token.startsWith('mock-token-for-')) {
                const phone = token.replace('mock-token-for-', '');
                const user = mockProviders.find(p => p.phone === phone);
                if (user) {
                    resolve(user);
                } else {
                    reject(new Error("User not found for token"));
                }
            } else {
                 reject(new Error("No valid token"));
            }
        }, 300);
    });

// --- Data Fetching (GET) ---
export const getProviders = (): Promise<ServiceProvider[]> => Promise.resolve(mockProviders);
export const getEvents = (): Promise<Event[]> => Promise.resolve(mockEvents);
export const getGigs = (): Promise<Gig[]> => Promise.resolve(mockGigs);
export const getCatalogueItems = (): Promise<CatalogueItem[]> => Promise.resolve(mockCatalogueItems);
export const getDocuments = (): Promise<Document[]> => Promise.resolve(mockDocuments);
export const getQaRibuRequests = (): Promise<QaRibuRequest[]> => Promise.resolve(mockQaRibuRequests);
export const getSpecialBanners = (): Promise<SpecialBanner[]> => Promise.resolve(mockSpecialBanners);
export const getInboxMessages = (): Promise<InboxMessage[]> => Promise.resolve(mockInboxMessages);
export const getCategories = (): Promise<string[]> => Promise.resolve(mockCategories);
export const getTickets = (): Promise<Ticket[]> => Promise.resolve(mockTickets);
export const getPremises = (): Promise<Premise[]> => Promise.resolve(mockPremises);


// --- Data Creation (POST) ---
export const createProvider = (providerData: Omit<ServiceProvider, 'id'>): Promise<ServiceProvider> =>
    new Promise(resolve => {
        setTimeout(() => {
            const newProvider: ServiceProvider = {
                ...providerData,
                id: `sp_${Date.now()}`,
            };
            mockProviders.push(newProvider);
            resolve(newProvider);
        }, 500);
    });

export const addEvent = (eventData: Omit<Event, 'id'>): Promise<Event> =>
    new Promise(resolve => {
        const newEvent: Event = { ...eventData, id: `ev_${Date.now()}` };
        mockEvents.push(newEvent);
        resolve(newEvent);
    });


export const createGig = (gigData: Omit<Gig, 'id' | 'providerId'>): Promise<Gig> =>
    new Promise(resolve => {
        const newGig: Gig = { ...gigData, id: `gig_${Date.now()}`, providerId: 'sa1' }; // Mock provider ID
        mockGigs.push(newGig);
        resolve(newGig);
    });
    
export const addDocument = (docData: Omit<Document, 'id'>): Promise<Document> =>
    new Promise(resolve => {
        const newDoc: Document = { ...docData, id: `doc_${Date.now()}` };
        mockDocuments.push(newDoc);
        resolve(newDoc);
    });

export const createQaRibuRequest = (requestData: Omit<QaRibuRequest, 'id' | 'status'>): Promise<QaRibuRequest> =>
    new Promise(resolve => {
        const newRequest: QaRibuRequest = {
            ...requestData,
            id: `QRR_${Date.now()}`,
            status: 'Pending',
        };
        mockQaRibuRequests.push(newRequest);
        resolve(newRequest);
    });
    
export const registerPremise = (name: string, superhostId: string, details?: Partial<Premise>): Promise<Premise> =>
    new Promise(resolve => {
        const newPremise: Premise = {
            id: `p_${Date.now()}`,
            name,
            buildingManagerId: superhostId,
            tenants: [],
            tagline: 'Pending Verification',
            logoUrl: '',
            bannerImageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800',
            about: details?.about || 'New Premise',
            amenities: details?.amenities || [],
            contactEmail: '',
            contactPhone: '',
            vacancies: [],
            county: details?.county,
            town: details?.town,
            lrNumber: details?.lrNumber,
            type: details?.type,
            totalUnits: details?.totalUnits,
            verificationStatus: 'Pending',
        }
        mockPremises.push(newPremise);
        resolve(newPremise);
    });

// --- Data Modification (PUT) ---
export const updateProvider = (updatedProvider: ServiceProvider): Promise<ServiceProvider> =>
    new Promise(resolve => {
        const index = mockProviders.findIndex(p => p.id === updatedProvider.id);
        if (index > -1) mockProviders[index] = updatedProvider;
        resolve(updatedProvider);
    });

export const updatePremise = (updatedPremise: Premise): Promise<Premise> =>
    new Promise(resolve => {
        const index = mockPremises.findIndex(p => p.id === updatedPremise.id);
        if (index > -1) {
            mockPremises[index] = updatedPremise;
        }
        resolve(updatedPremise);
    });

// New API function to handle all role assignments
export const linkUserToRole = (userId: string, setupData: SetupData, details?: UnitDetails): Promise<ServiceProvider> => 
    new Promise((resolve, reject) => {
        const userIndex = mockProviders.findIndex(p => p.id === userId);
        if (userIndex > -1) {
            const user = mockProviders[userIndex];
            user.role = setupData.role;
            user.premiseId = setupData.premiseId;

            if (setupData.role === 'TenantAdmin' || setupData.role === 'Staff') {
                user.unit = setupData.unitId;
            }

            if (details) {
                user.unitDetails = details;
            }

            // Linking logic for Co-hosts
            if (setupData.role === 'Staff' && setupData.adminId) {
                user.tenantId = setupData.adminId;
                // Also update the admin to include this user in coHosts
                const adminIndex = mockProviders.findIndex(p => p.id === setupData.adminId);
                if (adminIndex > -1) {
                    const admin = mockProviders[adminIndex];
                    if (!admin.coHosts) admin.coHosts = [];
                    if (!admin.coHosts.includes(userId)) admin.coHosts.push(userId);
                }
            }
            
            // Update Premise Tenant List
            const premise = mockPremises.find(p => p.id === setupData.premiseId);
            if (premise && setupData.role === 'TenantAdmin' && !premise.tenants.includes(userId)) {
                premise.tenants.push(userId);
            }

            resolve(user);
        } else {
            reject(new Error("User not found"));
        }
    });

export const revokeTenantAccess = (userId: string, premiseId: string, vacancyDetails: any): Promise<void> =>
    new Promise(resolve => {
        // 1. Remove tenant from premise list and add vacancy
        const premise = mockPremises.find(p => p.id === premiseId);
        if (premise) {
            premise.tenants = premise.tenants.filter(id => id !== userId);
            if (vacancyDetails) {
                premise.vacancies.push({
                    id: `vac_${Date.now()}`,
                    unitNumber: vacancyDetails.unitNumber,
                    type: vacancyDetails.type, // 'Residential' or 'Commercial'
                    floor: vacancyDetails.floor || 'N/A',
                    size: vacancyDetails.subtype, // e.g. '2 Bedroom'
                    configuration: vacancyDetails.configuration,
                    status: 'Vacant',
                    price: vacancyDetails.price
                });
            }
        }

        // 2. Reset user profile
        const user = mockProviders.find(p => p.id === userId);
        if (user) {
            user.role = undefined;
            user.premiseId = undefined;
            user.unit = undefined;
            user.floor = undefined;
            user.unitDetails = undefined;
            user.coHosts = [];
        }
        
        resolve();
    });

// Keeping backward compatibility but redirecting
export const linkUserToUnit = (userId: string, premiseId: string, unitId: string, details?: UnitDetails): Promise<ServiceProvider> => 
    linkUserToRole(userId, { role: 'TenantAdmin', premiseId, unitId }, details);


export const updateDocument = (updatedDoc: Document): Promise<Document> =>
    new Promise(resolve => {
        const index = mockDocuments.findIndex(d => d.id === updatedDoc.id);
        if (index > -1) mockDocuments[index] = updatedDoc;
        resolve(updatedDoc);
    });

export const updateQaRibuRequestStatus = (requestId: string, status: QaRibuRequest['status']): Promise<QaRibuRequest> =>
    new Promise(resolve => {
        let updated: QaRibuRequest | undefined;
        const index = mockQaRibuRequests.findIndex(i => i.id === requestId);
        if (index > -1) {
            mockQaRibuRequests[index].status = status;
            updated = mockQaRibuRequests[index];
        }
        resolve(updated!);
    });


export const initiateAssetTransfer = (documentId: string, newOwnerPhone: string): Promise<Document> =>
    new Promise(resolve => {
        const doc = mockDocuments.find(d => d.id === documentId);
        if(doc) doc.pendingOwnerPhone = newOwnerPhone;
        resolve(doc!);
    });
    
export const finalizeAssetTransfer = (documentId: string, decision: 'accept' | 'deny'): Promise<Document> =>
     new Promise(resolve => {
        const doc = mockDocuments.find(d => d.id === documentId);
        if(doc && doc.pendingOwnerPhone) {
            if (decision === 'accept') {
                doc.ownerPhone = doc.pendingOwnerPhone;
            }
            doc.pendingOwnerPhone = undefined;
        }
        resolve(doc!);
    });

// --- Data Deletion (DELETE) ---
export const deleteProvider = (providerId: string): Promise<void> =>
    new Promise(resolve => {
        const index = mockProviders.findIndex(p => p.id === providerId);
        if (index > -1) mockProviders.splice(index, 1);
        resolve();
    });

// --- Search ---
export const searchAssetBySerialOrReg = (identifier: string): Promise<Document | null> =>
    new Promise(resolve => {
        const asset = mockDocuments.find(doc => doc.isAsset && (doc.registrationNumber === identifier || doc.items?.some(i => i.serial === identifier)));
        resolve(asset || null);
    });

// --- Gateman Verification Logic ---

const getDurationForPurpose = (purpose: string): string => {
    const p = purpose.toLowerCase();
    if (p.includes('delivery')) return '15 mins';
    if (p.includes('drop') || p.includes('pickup')) return '10 mins';
    if (p.includes('interview')) return '2 hours';
    if (p.includes('meeting')) return '2 hours';
    if (p.includes('maintenance') || p.includes('repair')) return '4 hours';
    return 'Standard Visit (4 hrs)';
};

export const verifyEntry = (scanData: string, premiseId: string): Promise<{ allowed: boolean; message: string; request?: QaRibuRequest, user?: ServiceProvider, accessDetails?: { purpose: string, duration: string, role: string } }> => 
    new Promise(resolve => {
        let rawInput = scanData.trim();
        
        if (rawInput.startsWith('PROFILE:') || /^\d{9,12}$/.test(rawInput)) {
            let userId = rawInput.startsWith('PROFILE:') ? rawInput.split(':')[1] : '';
            let user: ServiceProvider | undefined;

            if (userId) {
                user = mockProviders.find(p => p.id === userId);
            } else {
                const phoneQuery = rawInput.slice(-9); 
                user = mockProviders.find(p => p.phone.endsWith(phoneQuery));
            }
            
            if (!user) {
                resolve({ allowed: false, message: 'User not found in system.' });
                return;
            }

            const premise = mockPremises.find(p => p.id === premiseId);
            const isTenant = premise?.tenants.includes(user.id);
            const activePass = mockQaRibuRequests.find(r => 
                r.visitorPhone === user!.phone && 
                r.premiseId === premiseId && 
                (r.status === 'Approved' || r.status === 'CheckedIn')
            );

            if (isTenant) {
                resolve({ 
                    allowed: true, 
                    message: `Access Granted: Tenant`, 
                    user,
                    accessDetails: {
                        role: 'Resident/Owner',
                        purpose: 'Home',
                        duration: 'Unlimited'
                    }
                });
            } else if (activePass) {
                resolve({ 
                    allowed: true, 
                    message: `Access Granted: Guest`, 
                    request: activePass, 
                    user,
                    accessDetails: {
                        role: 'Visitor',
                        purpose: activePass.visitorPurpose || 'Visit',
                        duration: getDurationForPurpose(activePass.visitorPurpose || '')
                    }
                });
            } else {
                resolve({ allowed: false, message: `Access Denied: No active pass found for ${user.name}`, user }); 
            }
            return;
        }

        if (rawInput.startsWith('QARIBU:') || /^\d{6}$/.test(rawInput)) {
            let request: QaRibuRequest | undefined;
            let code = '';

            if (rawInput.startsWith('QARIBU:')) {
                const parts = rawInput.split(':');
                if (parts.length < 3) {
                     resolve({ allowed: false, message: 'Invalid Code Format.' });
                     return;
                }
                const requestId = parts[1];
                code = parts[2];
                request = mockQaRibuRequests.find(r => r.id === requestId);
            } else {
                code = rawInput;
                request = mockQaRibuRequests.find(r => r.accessCode === code && r.premiseId === premiseId);
            }

            if (!request) {
                resolve({ allowed: false, message: 'Invalid or Expired Pass.' });
                return;
            }
            if (request.premiseId !== premiseId) {
                resolve({ allowed: false, message: 'Pass is for a different premise.' });
                return;
            }
            
            if (request.accessCode && request.accessCode !== code) {
                resolve({ allowed: false, message: 'Invalid Access Code.' });
                return;
            }

            if (request.status === 'Approved' || request.status === 'CheckedIn') {
                resolve({ 
                    allowed: true, 
                    message: `Access Granted: ${request.visitorName}`, 
                    request,
                    accessDetails: {
                        role: 'Visitor',
                        purpose: request.visitorPurpose || 'Visit',
                        duration: getDurationForPurpose(request.visitorPurpose || '')
                    }
                });
            } else {
                resolve({ allowed: false, message: `Access Denied. Status: ${request.status}`, request });
            }
            return;
        }

        resolve({ allowed: false, message: 'Unknown Code Format.' });
    });

export const sendShiftReport = (premiseId: string, stats: any): Promise<void> => 
    new Promise(resolve => {
        console.log(`[MOCK API] Sending shift report email for premise ${premiseId}. Data:`, stats);
        // Mock email sending delay
        setTimeout(resolve, 1500);
    });
