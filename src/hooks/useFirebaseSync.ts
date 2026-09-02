import { useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { useStore } from '../store/useStore';

// Unique identifier for this browser tab / session.
// Used to distinguish echoes of our own writes from writes by other devices.
const SESSION_ID = Math.random().toString(36).slice(2);

// Firestore rejects `undefined` field values. Strip them before every write
// by round-tripping through JSON (JSON.stringify omits undefined object keys).
function stripUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function useFirebaseSync(user: User | null) {
  const store = useStore();
  const isRemoteUpdate = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastLocalWriteAt = useRef(0);
  // Blocks writes until the first Firestore snapshot arrives.
  // Prevents overwriting server data with stale local (localStorage) state on mount.
  const initialSyncDone = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    if (!user) return;

    // Reset on every login so a fresh device waits for the server state.
    initialSyncDone.current = false;

    // Safety valve: allow writes after 5 s even if Firestore never responds
    // (offline, rules issue, brand-new account with no document yet).
    fallbackTimerRef.current = setTimeout(() => {
      initialSyncDone.current = true;
    }, 5000);

    const docRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(docRef, (snap) => {
      // First snapshot received — writes are now safe.
      initialSyncDone.current = true;
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      if (!snap.exists()) return;
      const data = snap.data();
      if (!data) return;

      // Skip only if this snapshot is an echo of OUR OWN write AND it is
      // older than our most recent write intent. Writes from other devices
      // always have a different _lastWriteBy and are never skipped.
      if (
        data._lastWriteBy === SESSION_ID &&
        data._lastWrite &&
        data._lastWrite < lastLocalWriteAt.current
      ) return;

      // Mark as remote so the write effect skips the Firestore re-write.
      // Flag is reset inside the write effect so it stays true through
      // the async React render + effect cycle.
      isRemoteUpdate.current = true;
      const s = useStore.getState();

      if (data.lifeCompass) s.updateLifeCompass(data.lifeCompass);
      if (data.annualGoals) useStore.setState({ annualGoals: data.annualGoals });
      if (data.monthlyGoals) useStore.setState({ monthlyGoals: data.monthlyGoals });
      if (data.monthlyPlanItems) useStore.setState({ monthlyPlanItems: data.monthlyPlanItems });
      if (data.weeklyTasks) useStore.setState({ weeklyTasks: data.weeklyTasks });
      if (data.weeklyPlanItems) useStore.setState({ weeklyPlanItems: data.weeklyPlanItems });
      if (data.dailyPlans) useStore.setState({ dailyPlans: data.dailyPlans });
      if (data.timeBlocks) useStore.setState({ timeBlocks: data.timeBlocks });
      if (data.timeBlockMemos) useStore.setState({ timeBlockMemos: data.timeBlockMemos });
      if (data.miracle21Habits) useStore.setState({ miracle21Habits: data.miracle21Habits });
      if (data.mindMaps) useStore.setState({ mindMaps: data.mindMaps });
      if (data.mindMapDocs) useStore.setState({ mindMapDocs: data.mindMapDocs });
      if (data.domainEntries) useStore.setState({ domainEntries: data.domainEntries });
      if (data.domainScores) useStore.setState({ domainScores: data.domainScores });
      if (data.wannabeItems) useStore.setState({ wannabeItems: data.wannabeItems });
      if (data.wannabeNotes !== undefined) useStore.setState({ wannabeNotes: data.wannabeNotes });
      if (data.annualFeedbacks) useStore.setState({ annualFeedbacks: data.annualFeedbacks });
      if (data.monthlyFeedbacks) useStore.setState({ monthlyFeedbacks: data.monthlyFeedbacks });
      if (data.weeklyFeedbacks) useStore.setState({ weeklyFeedbacks: data.weeklyFeedbacks });
      if (data.journalEntries) useStore.setState({ journalEntries: data.journalEntries });
      if (data.ddayItems) useStore.setState({ ddayItems: data.ddayItems });
    });

    unsubscribeRef.current = unsubscribe;
    return () => {
      unsubscribe();
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [user]);

  // Push local changes to Firestore (debounced)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    // Do not write until the first Firestore snapshot has been received.
    // This prevents overwriting server data with stale/empty local state on mount.
    if (!initialSyncDone.current) return;

    // Reset the remote flag HERE (not in onSnapshot) so it stays true through
    // the React render cycle.
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    // Record intent to write now so onSnapshot can compare immediately.
    const writeIntent = Date.now();
    lastLocalWriteAt.current = writeIntent;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const s = useStore.getState();
      const docRef = doc(db, 'users', user.uid);
      const writeTime = Date.now();
      lastLocalWriteAt.current = writeTime;
      setDoc(docRef, stripUndefined({
        _lastWrite: writeTime,
        _lastWriteBy: SESSION_ID,
        lifeCompass: s.lifeCompass,
        annualGoals: s.annualGoals,
        monthlyGoals: s.monthlyGoals,
        monthlyPlanItems: s.monthlyPlanItems,
        weeklyTasks: s.weeklyTasks,
        weeklyPlanItems: s.weeklyPlanItems,
        dailyPlans: s.dailyPlans,
        timeBlocks: s.timeBlocks,
        timeBlockMemos: s.timeBlockMemos,
        miracle21Habits: s.miracle21Habits,
        mindMaps: s.mindMaps,
        mindMapDocs: s.mindMapDocs,
        domainEntries: s.domainEntries,
        domainScores: s.domainScores,
        wannabeItems: s.wannabeItems,
        wannabeNotes: s.wannabeNotes,
        annualFeedbacks: s.annualFeedbacks,
        monthlyFeedbacks: s.monthlyFeedbacks,
        weeklyFeedbacks: s.weeklyFeedbacks,
        journalEntries: s.journalEntries,
        ddayItems: s.ddayItems,
      }), { merge: true });
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    user,
    store.lifeCompass,
    store.annualGoals,
    store.monthlyGoals,
    store.monthlyPlanItems,
    store.weeklyTasks,
    store.weeklyPlanItems,
    store.dailyPlans,
    store.timeBlocks,
    store.timeBlockMemos,
    store.miracle21Habits,
    store.mindMaps,
    store.mindMapDocs,
    store.domainEntries,
    store.domainScores,
    store.wannabeItems,
    store.wannabeNotes,
    store.annualFeedbacks,
    store.monthlyFeedbacks,
    store.weeklyFeedbacks,
    store.journalEntries,
    store.ddayItems,
  ]);
}
