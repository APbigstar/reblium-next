'use client';

import React, { useMemo, useEffect, useReducer, useContext, useCallback } from 'react';

import MembershipPlansContext from './context';
import { State, Action, MembershipPlan, MembershipPlanResult } from './types';

const fetchMembershipPlans = (() => {
    const fn = async (resolve: (value: any) => void, reject: (reason?: any) => void) => {
        try {
            const response = await fetch("/api/membership/plans", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  // Include any other headers you might need, such as authorization
                },
                body: JSON.stringify({}), // Empty object as the body
              });
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const data = await response.json();
              console.log('data', data)
              const { success, data: membershipData }: MembershipPlanResult = data;

            
            if (success) {
                resolve(membershipData.map(item => {
                    const {
                        type,
                        billing_period
                    } = item;
                    console.log('item', item)
                    const [
                        periodUnit
                    ]: any = (() => {
                        switch (billing_period) {
                            case 'WEEKLY':
                                return [
                                    {
                                        long: 'week',
                                        short: 'week'
                                    },
                                ]
                                break;
                            case 'MONTHLY':
                                return [
                                    {
                                        long: 'month',
                                        short: 'mo'
                                    },
                                ]
                                break;
                            case 'YEARLY':
                                return [
                                    {
                                        long: 'year',
                                        short: 'yr'
                                    },
                                ]
                                break;

                            default:
                                return [];
                        }
                    })();

                    const {
                        id,
                        created_at,
                        price,
                    } = item;

                    const totalPrice = price;

                    return {
                        ...item,
                        id,
                        created_at,
                        type,
                        periodUnit,
                        totalPrice,
                    }
                }));
            } else {
                setTimeout(() => {
                    fn(resolve, reject);
                }, 500);
            }
        } catch (e) {
            console.error(e);
            setTimeout(() => {
                fn(resolve, reject);
            }, 500);
        }
    }
    return function result() {
        return new Promise(fn);
    }
})();

const initState = () => ({
    membershipPlanList: [],
    membershipPlanDict: {},
    loadRequest: false,
    loadFailure: false,
    loadSuccess: false,
    loadHandles: [],
    loadError: null,
    loaded: false,
})

const handlers = {
    LOAD_REQUEST(state: State, action: Action): State {
        if (action.type === 'LOAD_REQUEST') {
            const { resolve, reject } = action.payload;
            if (state.loadRequest) {
                return {
                    ...state,
                    loadHandles: [...state.loadHandles, { resolve, reject }],
                };
            }
            return {
                ...state,
                loadRequest: true,
                loadFailure: false,
                loadSuccess: false,
                loadError: null,
                loadHandles: [{ resolve, reject }],
            };
        }
        return state;
    },

    LOAD_FAILURE(state: State, action: Action): State {
        if (action.type === 'LOAD_FAILURE' && state.loadRequest) {
            const { error } = action.payload;
            return {
                ...state,
                loadRequest: false,
                loadFailure: true,
                loadSuccess: false,
                loadError: error,
            };
        }
        return state;
    },

    LOAD_SUCCESS(state: State, action: Action): State {
        if (action.type === 'LOAD_SUCCESS' && state.loadRequest) {
            const { membershipPlanList } = action.payload;
            const membershipPlanDict: Record<any, MembershipPlan[]> = {};
            membershipPlanList.forEach((item) => {
                if (!membershipPlanDict[item.type]) {
                    membershipPlanDict[item.type] = [];
                }
                membershipPlanDict[item.type].push(item);
                membershipPlanDict[item.type].sort((a: { billing_period: string, price: number}, b: { billing_period: string, price: number }) => {
                    const billingPeriodIndex: { [key: string]: number } = {
                        'WEEKLY': 1,
                        'MONTHLY': 2,
                        'YEARLY': 3,
                    };
                    const getBillingPeriodWeight = (period: string | undefined): number => {
                        if (!period) return 0;
                        return billingPeriodIndex[period] || 4;
                    };
                    if (a.billing_period !== b.billing_period) {
                        const aBillingPeriodWeight = getBillingPeriodWeight(a.billing_period);
                        const bBillingPeriodWeight = getBillingPeriodWeight(b.billing_period);
                        return aBillingPeriodWeight - bBillingPeriodWeight;
                    }
                    return a.price - b.price;
                });
            });
            return {
                ...state,
                loadRequest: false,
                loadFailure: false,
                loadSuccess: true,
                loaded: true,
                membershipPlanList,
                membershipPlanDict,
            }
        }
        return state;
    }
}

function reducer(state: State, action: Action): State {
    const handler = handlers[action.type];
    return typeof handler === 'function' ? handler(state, action) : state;
}

interface Props {
    children: React.ReactNode;
}

export function MembershipPlansProvider({ children }: Props) {
    const [state, dispatch] = useReducer(reducer, null, initState);

    const {
        loadRequest, loadFailure, loadSuccess, loadHandles, loadError, membershipPlanList, membershipPlanDict, loaded
    } = state;

    const loadMembershipPlans = useCallback(() => new Promise((resolve, reject) => {
        dispatch({
            type: 'LOAD_REQUEST',
            payload: {
                resolve,
                reject,
            }
        })
    }), [dispatch]);

    useEffect(() => {
        let timer: any = null;
        if (loadRequest) {
            timer = setTimeout(() => {
                fetchMembershipPlans().then((item: any) => {
                    dispatch({
                        type: 'LOAD_SUCCESS',
                        payload: {
                            membershipPlanList: item
                        }
                    })
                }).catch(e => {
                    dispatch({
                        type: 'LOAD_FAILURE',
                        payload: {
                            error: e
                        }
                    })
                }).finally(() => {
                    timer = null;
                });
            }, 0);
        }
        return () => {
            clearTimeout(timer);
        }
    }, [loadRequest]);

    useEffect(() => {
        if (loadFailure) {
            loadHandles.forEach(item => {
                try {
                    item.reject(loadError);
                } catch (e) {
                    console.warn(e)
                }
            })
        }
    }, [loadFailure, loadHandles, loadError]);

    useEffect(() => {
        if (loadSuccess) {
            loadHandles.forEach(item => {
                try {
                    item.resolve(membershipPlanList)
                } catch (e) {
                    console.warn(e);
                }
            })
        }
    }, [loadSuccess, loadHandles, membershipPlanList]);

    const memoizedValue = useMemo(
        () => ({
            loadRequest,
            loadFailure,
            loadSuccess,
            loadHandles,
            loadError,
            membershipPlanList,
            membershipPlanDict,
            loaded,
            loadMembershipPlans,
        }),
        [loadRequest, loadSuccess, loadFailure, loadHandles, loadError, membershipPlanList, membershipPlanDict, loaded, loadMembershipPlans]
    );

    return (
        <MembershipPlansContext.Provider value={memoizedValue}>{children}</MembershipPlansContext.Provider>
    );
}

export function useMembershipPlansContext() {
    const context = useContext(MembershipPlansContext);

    if (!context) throw new Error('useMembershipPlansContext context must be use inside MembershipPlansProvider');

    return context;
}

export function useMembershipPlanList() {
    const { membershipPlanList } = useMembershipPlansContext();
    return membershipPlanList;
}

export function useLoadMembershipPlans() {
    const { loadMembershipPlans } = useMembershipPlansContext();
    return loadMembershipPlans;
}