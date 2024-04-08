export function useLocalStorage() {
  let storageId = null;

  const setId = (newId) => {
    storageId = newId;
  }

  const getItem = (name, defaultValue = null) => {
    try {
      console.log('getItem', `${name}_${storageId}`);
      const item = localStorage.getItem(`${name}_${storageId}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return defaultValue;
    }
  }

  const setItem = (name, value) => {
    try {
      const item = JSON.stringify(value);
      localStorage.setItem(`${name}_${storageId}`, item);
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  }

  return { getItem, setItem, setId }
}
