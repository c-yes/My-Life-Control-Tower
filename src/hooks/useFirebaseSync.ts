import { useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { useStore } from '../store/useStore';

export function useFirebaseSync(user: User | null) {
  const store = useStore();
  const isRemoteUpdate = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!user) return;

    const docRef = doc(db, 'users', user.uid);

    // Listen for remote changes
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (!data) return;

      isRemoteUpdate.current = true;
      const s = useStore.getState();

      if (data.lifeCompass) s.updateLifeCompass(data.lifeCompass);
      if (data.annualGoals) useStore.setState({ annualGoals: data.annualGoals });
      if (data.monthlyGoals) useStore.setState({ monthlyGoals: data.monthlyGoals });
      if (data.weeklyTasks) useStore.setState({ weeklyTasks: data.weeklyTasks });
      if (data.dailyPlans) useStore.setState({ dailyPlans: data.dailyPlans });
      if (data.timeBlocks) useStore.setState({ timeBlocks: data.timeBlocks });
      if (data.miracle21Habits) useStore.setState({ miracle21Habits: data.miracle21Habits });
      if (data.mindMaps) useStore.setState({ mindMaps: data.mindMaps });
      if (data.domainEntries) useStore.setState({ domainEntries: data.domainEntries });
      if (data.domainScores) useStore.setState({ domainScores: data.domainScores });

      isRemoteUpdate.current = false;
    });

    unsubscribeRef.current = unsubscribe;
    return () => unsubscribe();
  }, [user]);

  // Push local changes to Firestore (debounced)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || isRemoteUpdate.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const s = useStore.getState();
      const docRef = doc(db, 'users', user.uid);
      setDoc(docRef, {
        lifeCompass: s.lifeCompass,
        annualGoals: s.annualGoals,
        monthlyGoals: s.monthlyGoals,
        weeklyTasks: s.weeklyTasks,
        dailyPlans: s.dailyPlans,
        timeBlocks: s.timeBlocks,
        miracle21Habits: s.miracle21Habits,
        mindMaps: s.mindMaps,
        domainEntries: s.domainEntries,
        domainScores: s.domainScores,
      }, { merge: true });
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    user,
    store.lifeCompass,
    store.annualGoals,
    store.monthlyGoals,
    store.weeklyTasks,
    store.dailyPlans,
    store.timeBlocks,
    store.miracle21Habits,
    store.mindMaps,
    store.domainEntries,
    store.domainScores,
  ]);
}
