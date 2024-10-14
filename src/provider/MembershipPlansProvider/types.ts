export type MembershipPlan = {
    id: number;
    type: string;
    billing_period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    created_at: string | number;
    price: number;
};

export type MembershipPlanResult = {
    success: boolean;
    data: MembershipPlan[];
};

export type State = {
    membershipPlanList: MembershipPlan[];
    membershipPlanDict: Record<string, MembershipPlan[]>;
    loadRequest: boolean;
    loadFailure: boolean;
    loadSuccess: boolean;
    loadHandles: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }>;
    loadError: Error | null;
    loaded: boolean;
};

export type Action =
    | { type: 'LOAD_REQUEST'; payload: { resolve: (value: any) => void; reject: (reason?: any) => void } }
    | { type: 'LOAD_FAILURE'; payload: { error: Error } }
    | { type: 'LOAD_SUCCESS'; payload: { membershipPlanList: MembershipPlan[] } };

export type ContextType = {
    loadRequest: boolean;
    loadFailure: boolean;
    loadSuccess: boolean;
    loadHandles: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }>;
    loadError: Error | null;
    membershipPlanList: MembershipPlan[];
    loadMembershipPlans: any;
    membershipPlanDict: Record<string, MembershipPlan[]>;
    loaded: boolean;
};