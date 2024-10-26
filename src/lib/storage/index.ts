type TstorageType = 'local' | 'session';

const Storage = {
  get<T>(typ: TstorageType, key: string, fallback?: T): T | null {
    let data = null;
    if (typ == 'local') data = localStorage.getItem(key);
    if (typ == 'session') data = sessionStorage.getItem(key);

    if (data) {
      try {
        data = JSON.parse(data);
      } catch {
        null;
      }
    }
    return data ? (data as T) : fallback ?? null;
  },
  set<T>(typ: TstorageType, key: string, data: T): T | null {
    try {
      if (typ == 'local') localStorage.setItem(key, JSON.stringify(data));
      if (typ == 'session') sessionStorage.setItem(key, JSON.stringify(data));
      return data;
    } catch {
      return null;
    }
  },
};

export { Storage };