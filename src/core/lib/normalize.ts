export const normalize = <T>(prop: T | undefined, defaultProp: T) => {
  return typeof prop === "undefined" ? defaultProp : prop;
};
