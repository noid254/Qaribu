
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

// --- Auth API (the real backend: phone OTP, then a signed session token) ---
const ERROR_TEXT: Record<string, string> = {
    sign_in_unavailable: 'Sign-in is not available right now.',
    invalid_phone: 'Enter a valid phone number.',
    too_many_requests: 'Too many tries. Wait a few minutes and try again.',
    too_many_invites: 'You have sent a lot of invites. Wait a while and try again.',
    invalid_code: 'That code is not right, or it has expired.',
    sign_in_required: 'Please sign in again.',
    premise_not_found: 'That premise was not found.',
    not_allowed: 'Your role does not allow that.',
    gate_pass_off: 'Gate pass is switched off for this premise.',
    pass_not_found: 'No pass found for that code.',
    not_checked_in: 'That visitor is not checked in.',
    too_many_attempts: 'Too many wrong codes. Wait a few minutes, then try again.',
    brand_kit_required: 'Set up your brand kit first: your business name, address and phone.',
    too_many_receipts: 'You have issued a lot of receipts. Wait a while and try again.',
};

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

// Calls the backend and turns its error codes into plain messages. A 401 clears a stale session token.
const call = async (path: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // cache: 'no-store' because these answers are about one signed-in person and change as visitors arrive.
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 && token) clearToken();
        throw new ApiError(response.status, data.message || ERROR_TEXT[data.error] || `Something went wrong (${response.status}).`);
    }
    return data;
};

// phone is digits with the country code, for example 254722123456.
export const sendOtp = async (phone: string): Promise<{ success: boolean }> => {
    await call('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone: `+${phone}` }) });
    return { success: true };
};

export interface VerifyOtpResponse {
    success: boolean;
    user: ServiceProvider | null;
    isSuperAdmin: boolean;
    token: string;
}

// Real accounts are not the prototype's mock providers, so user is a minimal profile built from the
// account, and nobody is a super admin on this app (that comes from server configuration, section 7).
export const verifyOtp = async (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    const data = await call('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone: `+${phone}`, code: otp }) });
    return { success: true, user: profileFromAccount(data.account), isSuperAdmin: false, token: data.token };
};

interface Account { id: string; phone: string; name: string; }

const profileFromAccount = (account: Account): ServiceProvider => ({
    id: account.id,
    name: account.name || 'Member',
    phone: account.phone.replace('+', ''),
    service: '',
    avatarUrl: '',
    coverImageUrl: '',
    rating: 0,
    distanceKm: 0,
    hourlyRate: 0,
    rateType: 'per hour',
    currency: 'KES',
    isVerified: false,
    about: '',
    works: [],
    category: '',
    location: '',
    isOnline: false,
    accountType: 'individual',
    flagCount: 0,
    views: 0,
    cta: [],
} as ServiceProvider);

export interface HostPremise { id: string; slug: string; name: string; role: string; log_times: boolean; }

// One premise the account belongs to, and what its role (or roles) lets them do there. The server checks the
// role again on every call; these flags only decide which screens to offer.
export interface Membership {
    slug: string;
    name: string;
    roles: string[];
    gate_pass_enabled: boolean;
    log_times: boolean;
    can_invite: boolean;
    can_manage: boolean;
    can_manage_vacancies: boolean;
    can_run_gate: boolean;
    assignable_roles: string[];
}

// The person profile: the Nikosoko lens on this same account. A name is all it needs.
export interface PersonProfile { id: string; name: string; visibility: string; }

export const getMe = (): Promise<{ account: Account; profile: PersonProfile | null; premises: HostPremise[]; memberships: Membership[] }> =>
    call('/me');

// The person sets their own name; their profile follows. One account serves Qaribu and Nikosoko.
export const setMyName = (name: string): Promise<{ account: Account; profile: PersonProfile | null }> =>
    call('/me/profile', { method: 'PUT', body: JSON.stringify({ name }) });

export const getMyProfile = async (): Promise<ServiceProvider> => {
    if (!getToken()) throw new Error('No valid token');
    const me = await getMe();
    return profileFromAccount(me.account);
};

// How the invite SMS went: Qaribu sent it, the provider refused it, or SMS is not set up on the server.
export type SmsStatus = 'sent' | 'failed' | 'not_configured';

export interface CreatedInvite {
    id: string;
    sms: SmsStatus;
    pass_url: string;
    key: string;
    expires_at: string;
    visitor_phone: string;
    message: string;
    sms_link: string;
    whatsapp_link: string;
}

export type VisitStatus = 'waiting' | 'arrived' | 'left' | 'expired' | 'cancelled';

export interface PassRow {
    id: string;
    visitor_name: string;
    visitor_phone: string;
    purpose: string;
    host_label: string;
    status: VisitStatus;
    key: string | null; // only while the pass can still be used
    created_at: string;
    expires_at: string | null;
    arrived_at: string | null; // check-in and check-out times only when the premise records them
    left_at: string | null;
}

// The host's expected visitors for one premise. An owner or manager sees every invite; others see their own.
export const getPasses = (premise: string): Promise<{ premise: { slug: string; name: string; log_times: boolean }; passes: PassRow[] }> =>
    call(`/host/passes?premise=${encodeURIComponent(premise)}`);

// The host's gate pass invite. The visitor's ID is never part of it; the gateman records it at the gate.
export const createInvite = (input: {
    premise: string;
    visitor_name: string;
    visitor_phone: string;
    purpose: string;
    host_label?: string;
}): Promise<CreatedInvite> => call('/host/passes', { method: 'POST', body: JSON.stringify(input) });

// --- Premise owners and managers ---
export interface TeamMember { id: string; phone: string; name: string; role: string; since: string; }

export interface ManagedPremise {
    premise: { slug: string; name: string };
    gate_pass: { enabled: boolean; log_times: boolean };
    guard_link: string | null; // a shared secret link for a gate phone; replace it if the phone is lost
    assignable_roles: string[];
    team: TeamMember[];
}

const premisePath = (slug: string) => `/manage/${encodeURIComponent(slug)}`;

export const getManaged = (slug: string): Promise<ManagedPremise> => call(premisePath(slug));

export const setGatePass = (slug: string, change: { enabled?: boolean; log_times?: boolean }) =>
    call(`${premisePath(slug)}/gate-pass`, { method: 'PUT', body: JSON.stringify(change) });

export const rotateGuardLink = (slug: string): Promise<{ guard_link: string }> =>
    call(`${premisePath(slug)}/guard-link/rotate`, { method: 'POST', body: '{}' });

export const addTeamMember = (slug: string, member: { phone: string; name?: string; role: string }): Promise<TeamMember> =>
    call(`${premisePath(slug)}/team`, { method: 'POST', body: JSON.stringify(member) });

export const removeTeamMember = (slug: string, id: string): Promise<{ ok: boolean }> =>
    call(`${premisePath(slug)}/team/${encodeURIComponent(id)}`, { method: 'DELETE' });

// --- Premise sign-up: register a premise and get its page and sticker straight away ---
export interface PremiseLinks { page: string; sticker: string; qr: string; }

export const registerMyPremise = (details: {
    name: string;
    area?: string;
    county?: string;
    tagline?: string;
    about?: string;
    listed?: boolean;
}): Promise<{ slug: string; links: PremiseLinks }> => call('/premises', { method: 'POST', body: JSON.stringify(details) });

// --- Vacancies and the people waiting to hear about them (owner, manager, caretaker) ---
export interface VacancyItem {
    id: string;
    title: string;
    type: string;
    rent: number | null;
    available_from: string | null;
    notes: string;
    confirmed_at: string;
    shown_on_page: boolean; // hidden from the public page when not confirmed in the last 14 days
    timing: 'now' | 'upcoming';
}

export interface WaitingPerson {
    id: string;
    name: string;
    phone: string;
    looking_for: string;
    since: string;
    sms_link: string | null;
    whatsapp_link: string | null;
}

export interface VacanciesView {
    premise: { slug: string; name: string };
    links: PremiseLinks | null;
    vacancies: VacancyItem[];
    waiting: WaitingPerson[];
    message: string | null; // what to send the people waiting once a vacancy opens
}

export interface VacancyFields { title: string; type?: string; rent?: string; available_from?: string; notes?: string; }

const vacPath = (slug: string) => `/vacancies/${encodeURIComponent(slug)}`;

export const getVacancies = (slug: string): Promise<VacanciesView> => call(vacPath(slug));
export const addVacancy = (slug: string, fields: VacancyFields): Promise<VacancyItem> =>
    call(vacPath(slug), { method: 'POST', body: JSON.stringify(fields) });
export const updateVacancy = (slug: string, id: string, fields: VacancyFields): Promise<VacancyItem> =>
    call(`${vacPath(slug)}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(fields) });
export const confirmVacancy = (slug: string, id: string): Promise<VacancyItem> =>
    call(`${vacPath(slug)}/${encodeURIComponent(id)}/confirm`, { method: 'POST', body: '{}' });
export const removeVacancy = (slug: string, id: string): Promise<{ ok: boolean }> =>
    call(`${vacPath(slug)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const markWaitingTold = (slug: string, id: string): Promise<{ ok: boolean }> =>
    call(`${vacPath(slug)}/waiting/${encodeURIComponent(id)}/told`, { method: 'POST', body: '{}' });
export const removeWaiting = (slug: string, id: string): Promise<{ ok: boolean }> =>
    call(`${vacPath(slug)}/waiting/${encodeURIComponent(id)}`, { method: 'DELETE' });

// --- The gateman, signed in: verify a pass, admit with the ID they read from the visitor's ID, check out ---
export interface GateVisitor { name: string; purpose: string; host_label: string; expires_at: string | null; }
export type PassState = 'valid' | 'used' | 'expired' | 'unavailable';
export interface InsideVisitor { id: string; visitor_name: string; purpose: string; host_label: string; arrived_at: string; }

export const getGate = (slug: string): Promise<{ premise: { slug: string; name: string; log_times: boolean }; inside: InsideVisitor[] | null }> =>
    call(`/gate/${encodeURIComponent(slug)}`);

export const gateCheck = (slug: string, code: string): Promise<{ state: PassState; can_admit: boolean; visitor: GateVisitor }> =>
    call(`/gate/${encodeURIComponent(slug)}/check`, { method: 'POST', body: JSON.stringify({ code }) });

export const gateAdmit = (slug: string, code: string, idNumber: string): Promise<{ admitted: boolean; state: PassState; visitor: GateVisitor }> =>
    call(`/gate/${encodeURIComponent(slug)}/admit`, { method: 'POST', body: JSON.stringify({ code, id_number: idNumber }) });

export const gateCheckout = (slug: string, visitor: string): Promise<{ ok: boolean; visitor_name: string }> =>
    call(`/gate/${encodeURIComponent(slug)}/checkout`, { method: 'POST', body: JSON.stringify({ visitor }) });

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
        const newDoc: Document = { ...docData, id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
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

// --- Brand kit and receipts (architecture sections 22 and 23) ---

// The name, address and details a business puts on its documents. Nothing can be issued until it is complete.
export interface BrandKit {
    business_name: string;
    address: string;
    phone: string; // +254..., may start as the account's own number
    email: string;
    tax_pin: string;
    tagline: string;
    payment_details: string;
    receipt_note: string; // printed at the foot of every receipt
    terms_accepted_at: string; // empty until the terms are accepted
    complete: boolean;
    // How its documents look: two colours (#rrggbb, empty for Qaribu's own), a font key, and whether a logo is saved.
    color: string;
    color2: string;
    font: string;
    has_logo: boolean;
    fonts: { key: string; label: string; stack: string }[];
}

export const getBrandKit = (): Promise<BrandKit> => call('/me/brand-kit');

export const saveBrandKit = (input: {
    business_name: string;
    address: string;
    phone?: string;
    email?: string;
    tax_pin?: string;
    tagline?: string;
    payment_details?: string;
    receipt_note?: string;
    accept_terms?: boolean;
    color?: string;
    color2?: string;
    font?: string;
}): Promise<BrandKit> => call('/me/brand-kit', { method: 'PUT', body: JSON.stringify(input) });

// The logo: a PNG or JPEG up to 100 KB, sent as the raw bytes.
export const uploadLogo = async (file: Blob): Promise<BrandKit> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/me/brand-kit/logo`, {
        method: 'PUT',
        headers: { 'Content-Type': file.type, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: file,
        cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(response.status, data.message || (response.status === 413 ? 'That picture is too large. Use one under 100 KB.' : `Something went wrong (${response.status}).`));
    return data;
};

export const removeLogo = (): Promise<BrandKit> => call('/me/brand-kit/logo', { method: 'DELETE' });

// The saved logo as a picture the page can show (the server needs the sign-in to give it), or null if there is none.
export const fetchLogoUrl = async (): Promise<string | null> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/me/brand-kit/logo`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: 'no-store' });
    if (!response.ok) return null;
    return URL.createObjectURL(await response.blob());
};

// One line of a receipt, as the shop types it (strings, as typed) and as the server returns it.
export interface ReceiptLineInput {
    description: string;
    qty: string;
    unit_price: string;
    serial?: string;
}

export interface ReceiptLine {
    description: string;
    qty: number;
    unit_price: number;
    total: number;
    serial: string;
}

export interface CreatedReceipt {
    id: string;
    uid: string;
    number: string;
    amount: number;
    items: ReceiptLine[];
    receipt_url: string;
    customer_phone: string;
    message: string;
    sms_link: string;
    whatsapp_link: string;
}

export const issueReceipt = (input: { customer_phone: string; customer_name?: string; items: ReceiptLineInput[] }): Promise<CreatedReceipt> =>
    call('/receipts', { method: 'POST', body: JSON.stringify(input) });

// A receipt in a list. A receipt can never be edited or deleted, so there is nothing here that does either.
export type DocumentKind = 'receipt' | 'invoice' | 'quote';

export interface ReceiptItem {
    balance_due: number | null; // invoices: what is still to pay (null once cancelled)
    cancelled?: boolean; // cancelled by the shop, with a reason, on its record
    invoiced?: boolean; // a quote that has been made into an invoice
    decision?: 'accepted' | 'declined' | null; // the customer's answer to a quote
    kind: DocumentKind;
    due_date: string; // invoices
    valid_until: string; // quotes
    id: string;
    uid: string; // unique across Qaribu
    number: string; // the shop's own running number
    shop_name: string;
    amount: number;
    item_count: number;
    first_item: string;
    customer_name: string;
    customer_phone: string;
    issued_at: string;
    // Only in the shop's own list: the message to send the link again. Never in a customer's list.
    message: string | null;
    sms_link: string | null;
    whatsapp_link: string | null;
}

// What the person typed in the search boxes: a name, a phone number, a receipt number or ID (or a shop name), and days.
export interface ReceiptSearch { q: string; from: string; to: string; }

const searchQuery = (s: ReceiptSearch): string => {
    const params = new URLSearchParams();
    if (s.q.trim()) params.set('q', s.q.trim());
    if (s.from) params.set('from', s.from);
    if (s.to) params.set('to', s.to);
    const text = params.toString();
    return text ? `?${text}` : '';
};

// The receipts this person issued.
export const getReceipts = (search: ReceiptSearch = { q: '', from: '', to: '' }): Promise<{ receipts: ReceiptItem[] }> =>
    call(`/receipts${searchQuery(search)}`);

// The receipts issued to this person's phone number. No brand kit is needed to look.
export const getMyReceipts = (search: ReceiptSearch = { q: '', from: '', to: '' }): Promise<{ receipts: ReceiptItem[] }> =>
    call(`/me/receipts${searchQuery(search)}`);

// One receipt as the page the customer sees, fetched signed in. This is how a receipt is previewed in the app: the
// customer's link is never opened for it, because the link opens only once.
export const getReceiptPage = async (id: string): Promise<string> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/receipts/${encodeURIComponent(id)}/page`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
    });
    if (!response.ok) {
        if (response.status === 401 && token) clearToken();
        throw new ApiError(response.status, response.status === 401 ? ERROR_TEXT.sign_in_required : 'Could not load that receipt.');
    }
    return response.text();
};

// --- Invoices and quotes (architecture section 25) ---

// What the shop typed for an invoice or a quote. Money and rates go as typed; the server works the sums out.
export interface DocumentInput {
    customer_phone: string;
    customer_name: string;
    customer_details?: string;
    items: ReceiptLineInput[];
    discount?: string;
    tax_rate?: string; // left out: 16 for a business with a KRA PIN, else none
    shipping?: string;
    deposit?: string; // invoices only
    due_date?: string; // invoices
    valid_until?: string; // quotes
    notes?: string;
}

export interface CreatedDocument {
    id: string;
    uid: string;
    kind: 'invoice' | 'quote';
    number: string;
    amount: number; // the total
    balance_due: number;
    date: string; // the due date, or the last day a quote is valid
    customer_phone: string;
    message: string;
    sms_link: string;
    whatsapp_link: string;
}

export const issueDocument = (kind: 'invoice' | 'quote', input: DocumentInput): Promise<CreatedDocument> =>
    call(kind === 'invoice' ? '/invoices' : '/quotes', { method: 'POST', body: JSON.stringify(input) });

const kindQuery = (kind: DocumentKind | '', s: ReceiptSearch): string => {
    const query = searchQuery(s);
    if (!kind) return query;
    return query ? `${query}&kind=${kind}` : `?kind=${kind}`;
};

// Every receipt, invoice and quote this person's business issued; kind narrows it.
export const getIssuedDocuments = (kind: DocumentKind | '' = '', search: ReceiptSearch = { q: '', from: '', to: '' }): Promise<{ documents: ReceiptItem[] }> =>
    call(`/documents${kindQuery(kind, search)}`);

// Everything issued to this person's phone number.
export const getReceivedDocuments = (kind: DocumentKind | '' = '', search: ReceiptSearch = { q: '', from: '', to: '' }): Promise<{ documents: ReceiptItem[] }> =>
    call(`/me/documents${kindQuery(kind, search)}`);

// --- The asset ledger (architecture section 24): items with one owner per serial number, and a history ---

export type AssetKind = 'vehicle' | 'tool' | 'electronics' | 'other';

export interface LedgerAsset {
    id: string;
    kind: AssetKind;
    name: string;
    make_model: string;
    year: string;
    serial: string; // a serial number, or a vehicle's registration plate
    notes: string;
    verification: 'unverified' | 'verified';
    source: 'self' | 'receipt';
    created_at: string;
}

export interface LedgerEvent {
    event: string; // registered, claimed_from_receipt, transferred
    at: string;
    from: string; // the other person, as the last digits of their phone
    to: string;
    receipt_number: string;
    shop_name: string;
}

export interface AssetInput {
    kind: AssetKind;
    name: string;
    make_model?: string;
    year?: string;
    serial: string;
    notes?: string;
    // The owner agrees that their name (a nickname is fine) is shown to people who check this item.
    consent_show_name: boolean;
}

export const getLedgerAssets = (): Promise<{ assets: LedgerAsset[] }> => call('/assets');

export const registerLedgerAsset = (input: AssetInput): Promise<{ asset: LedgerAsset }> =>
    call('/assets', { method: 'POST', body: JSON.stringify(input) });

// A transfer the item has open: waiting for the seller's own code, or sent and waiting for the buyer.
export interface OpenTransfer {
    id: string;
    status: 'pending' | 'in_progress';
    buyer: string; // the buyer's phone, last digits only
    expires_at: string;
    // Once sent: the buyer's link and the message, to send again by hand.
    link?: string;
    message?: string;
    sms_link?: string;
    whatsapp_link?: string;
}

// A photo taken in the app. The date is the server's, set when the photo arrived.
export type PhotoKind = 'item' | 'serial' | 'receipt';
export interface AssetPhoto {
    id: string;
    kind: PhotoKind;
    size: number;
    taken_at: string;
}

export const getLedgerAsset = (id: string): Promise<{ asset: LedgerAsset; history: LedgerEvent[]; transfer: OpenTransfer | null; photos: AssetPhoto[] }> => call(`/assets/${encodeURIComponent(id)}`);

// Sends one photo taken with the camera. There is no way to send a file from the gallery: the app only has the camera.
export const uploadAssetPhoto = async (assetId: string, kind: PhotoKind, photo: Blob): Promise<AssetPhoto> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/assets/${encodeURIComponent(assetId)}/photos?kind=${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'image/jpeg', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: photo,
        cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 && token) clearToken();
        throw new ApiError(response.status, data.message || (response.status === 413 ? 'That photo is too large. Take it again.' : `Could not save the photo (${response.status}).`));
    }
    return data.photo as AssetPhoto;
};

// One photo's picture, for an <img>. The route needs the sign-in, so it is fetched and shown from a local address.
export const getAssetPhotoUrl = async (photoId: string): Promise<string> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/assets/photos/${encodeURIComponent(photoId)}/image`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
    });
    if (!response.ok) throw new ApiError(response.status, 'Could not load that photo.');
    return URL.createObjectURL(await response.blob());
};

export interface OwnershipResult {
    registered: boolean;
    // `verified` is the tick. `owner` is the owner's name or nickname when they agreed to it being shown, else empty.
    matches: { kind: AssetKind; name: string; verified: boolean; owner: string; since: string }[];
}

// Before buying: is this serial number or plate registered, and to whom (the last digits of their phone only)?
export const checkOwnership = (serial: string): Promise<OwnershipResult> => call(`/assets/check?serial=${encodeURIComponent(serial)}`);

export type ClaimStatus = 'claimable' | 'yours' | 'from_seller' | 'registered';

export interface ReceiptClaims {
    receipt_id: string;
    number: string;
    shop_name: string;
    items: { serial: string; description: string; status: ClaimStatus; asset_id: string | null }[];
}

// The serial numbers on a receipt issued to me, and what claiming each would do.
export const getReceiptClaims = (receiptId: string): Promise<ReceiptClaims> => call(`/documents/${encodeURIComponent(receiptId)}/claims`);

export const claimAsset = (input: { receipt_id: string; serial: string; kind: AssetKind; consent_show_name: boolean }): Promise<{ asset: LedgerAsset; outcome: 'claimed' | 'transferred' }> =>
    call('/assets/claim', { method: 'POST', body: JSON.stringify(input) });

// --- Payments against an invoice (architecture section 25) ---

export type PayMethod = 'cash' | 'mpesa' | 'bank' | 'card' | 'other';

export interface CreatedPayment {
    id: string; // the receipt that was issued
    uid: string;
    number: string;
    amount: number;
    invoice_number: string;
    balance_due: number; // what is still to pay after this payment
    paid_in_full: boolean;
    customer_phone: string;
    message: string;
    sms_link: string;
    whatsapp_link: string;
}

// The shop records a payment against an invoice it issued. That issues a receipt linked to the invoice, and the
// invoice's balance goes down. An empty amount is the whole balance.
export const recordPayment = (invoiceId: string, input: { amount?: string; method: PayMethod; reference?: string }): Promise<CreatedPayment> =>
    call(`/invoices/${encodeURIComponent(invoiceId)}/payments`, { method: 'POST', body: JSON.stringify(input) });

// The shop cancels an invoice or quote it issued, with a reason. The document stays, marked cancelled. An invoice that
// has payments against it cannot be cancelled.
export const cancelDocument = (id: string, reason: string): Promise<{ id: string; kind: 'invoice' | 'quote'; number: string; cancelled: true; reason: string }> =>
    call(`/documents/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });

// The customer answers a quote they were sent: accept or decline, once, and it is final.
export const respondToQuote = (quoteId: string, decision: 'accept' | 'decline'): Promise<{ id: string; decision: 'accepted' | 'declined' }> =>
    call(`/documents/${encodeURIComponent(quoteId)}/respond`, { method: 'POST', body: JSON.stringify({ decision }) });

// The shop makes a quote into an invoice: everything is copied from the quote, and it may give a due date and a deposit.
export const invoiceFromQuote = (quoteId: string, input: { due_date?: string; deposit?: string } = {}): Promise<CreatedDocument> =>
    call(`/quotes/${encodeURIComponent(quoteId)}/invoice`, { method: 'POST', body: JSON.stringify(input) });

// --- Transferring an item: the seller starts it and confirms with a code to their own phone, then the buyer accepts with a
// code to theirs, on the page their message links to (architecture section 24) ---

export const startTransfer = (assetId: string, buyerPhone: string): Promise<{ transfer: { id: string; status: 'pending'; buyer: string; expires_at: string }; code_sent: boolean }> =>
    call(`/assets/${encodeURIComponent(assetId)}/transfer`, { method: 'POST', body: JSON.stringify({ buyer_phone: buyerPhone }) });

export const resendTransferCode = (id: string): Promise<{ code_sent: boolean }> => call(`/transfers/${encodeURIComponent(id)}/code`, { method: 'POST', body: '{}' });

export interface SentTransfer {
    status: 'in_progress';
    link: string;
    message: string;
    sms: SmsStatus;
    sms_link: string;
    whatsapp_link: string;
}

export const confirmTransfer = (id: string, code: string): Promise<SentTransfer> =>
    call(`/transfers/${encodeURIComponent(id)}/confirm`, { method: 'POST', body: JSON.stringify({ code }) });

export const cancelTransfer = (id: string): Promise<{ status: 'cancelled' }> => call(`/transfers/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: '{}' });