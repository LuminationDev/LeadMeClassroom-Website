function useStorage() {
  /**
   * Set chrome's local storage with the supplied object. {key: value} format.
   * @param key A string to save the value against.
   * @param value A string of the value to store.
   */
  const setLocalStorage = (key: string, value: any) => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, value);
        resolve("Success");
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
  * Retrieve a value from chrome's local storage related to the key that has been supplied.
  * @param key A string representing what an object was saved as.
  */
  const getLocalStorage = <T>(key: string) => {
    return new Promise<T>((resolve, reject) => {
      try {
        const storedItem = localStorage.getItem(key);
        resolve(<T>storedItem);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Remove an entry from chrome's local storage.
   * @param key A string representing what object value to remove.
   */
  const removeLocalStorage = <T>(key: string) => {
    return new Promise<T>((resolve, reject) => {
      try {
        localStorage.removeItem(key);
        resolve(<T>"Success");
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clear local storage of any and all values that have been saved.
   */
  const clearLocalStorage = <T>() => {
    return new Promise<T>( (resolve, reject) => {
      try {
        localStorage.clear();
        resolve(<T>"Storage cleared");
      } catch (error) {
        reject(error);
      }
    });
  }

  return {
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage,
    clearLocalStorage
  }
}

export { useStorage }
