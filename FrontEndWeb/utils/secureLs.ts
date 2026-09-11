import SecureLS from "secure-ls";

const getSecureLsInstance = () => {
  if (typeof window !== "undefined") {
    return new SecureLS({ encodingType: "aes" });
  }
  return null;
};

//////////////////////////////////////////////////////////////////

export const setSecureItem = (key: string, value: unknown) => {
  const ls = getSecureLsInstance();
  const serialized = typeof value === "string" ? value : JSON.stringify(value);

  if (ls) {
    ls.set(key, serialized);
  } else if (typeof window !== "undefined") {
    localStorage.setItem(key, serialized);
  }
};

//////////////////////////////////////////////////////////////////

export const getSecureItem = (key: string) => {
  const ls = getSecureLsInstance();

  if (ls) {
    return ls.get(key);
  }
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

//////////////////////////////////////////////////////////////////

export const removeSecureItem = (key: string) => {
  const ls = getSecureLsInstance();

  if (ls) {
    ls.remove(key);
  } else if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};
