import { Machine } from 'xstate';

export const GUARDS = {
  PULLREQUEST: (request, context) => context.user.id === request.createdByUserId,
  PUSH: (request, context) => context.user.id === request.createdByUserId,
  APPROVE: (request, context) => (context.user.roles
    ? context.user.roles.includes('admin')
    && request.createdByUserId !== context.user.id : false),
  REJECT: (request, context) => (context.user.roles
    ? context.user.roles.includes('admin')
    && request.createdByUserId !== context.user.id : false),
};


export default Machine({
  id: 'request',
  initial: 'commit',
  states: {
    commit: {
      on: {
        PUSH: 'commit',
        PULLREQUEST: {
          target: 'pending',
          cond: (context) => GUARDS.PULLREQUEST(context.request, context.reqContext),
        },
      },
    },
    pending: {
      on: {
        PUSH: 'commit',
        APPROVE: {
          target: 'approved',
          cond: (context) => GUARDS.APPROVE(context.request, context.reqContext),
        },
        REJECT: {
          target: 'failure',
          cond: (context) => GUARDS.APPROVE(context.request, context.reqContext),
        },
      },
    },
    approved: {
      type: 'final',
    },
    failure: {
      type: 'final',
    },
  },
});
