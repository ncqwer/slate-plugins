import useDebounce, { createUseDebounce } from './hooks/useDebounce';
import useThrottle, { createUseThrottle } from './hooks/useThrottle';
import useResizeDetecter from './hooks/useResizeDetecter';
import useWatch from './hooks/useWatch';

export { Icon, IconBar } from './render';
const handleModifier = (modifiers, itemClassName) =>
  modifiers
    .map(modifier => {
      if (typeof modifier === 'string') {
        const realName = `${itemClassName}--${modifier}`;
        return {
          [itemClassName]: itemClassName,
          [realName]: `${itemClassName} ${realName}`,
        };
      } else if (typeof modifier === 'object' && !Array.isArray(modifier)) {
        const realName = `${itemClassName}--${modifier.name}`;
        const sub = handleBlock({ ...modifier, name: itemClassName });
        const subKeys = Object.keys(sub);
        return subKeys.reduce(
          (acc, key) => {
            // if(key===itemClassName) return acc;
            return {
              ...acc,
              [key]: sub[key],
            };
          },
          {
            [realName]: `${itemClassName} ${realName}`,
          },
        );
      }
    })
    .reduce(
      (acc, o) => ({
        ...acc,
        ...o,
      }),
      {},
    );

const handleBlock = info => {
  const { name: blockClassName, ...others } = info;
  const elementNames = Object.keys(others);
  return elementNames
    .map(elementName => {
      const element = others[elementName];
      const realName = `${blockClassName}__${elementName}`;
      if (!element) {
        // no modifiers
        return {
          [realName]: realName,
        };
      }
      if (Array.isArray(element)) {
        return handleModifier(element, realName);
      }
      if (typeof element === 'object') {
        return handleBlock({ ...element, name: realName });
      }
    })
    .reduce(
      (acc, o) => ({
        ...acc,
        ...o,
      }),
      {
        [blockClassName]: blockClassName,
      },
    );
};

export const convertSimpleBlockHead = (info, blockName) => {
  const keys = Object.keys(info);
  const reg = RegExp(`^${blockName}`);
  return keys.reduce(
    (acc, key) => ({
      ...acc,
      [key.replace(reg, 'block')]: info[key],
    }),
    {},
  );
};

export const handleBEM = opt => {
  const { className, blockName } = opt;
  if (!!blockName && Array.isArray(className)) {
    const res = handleModifier(className, blockName);
    return convertSimpleBlockHead(res, blockName);
  }

  if (typeof className === 'object') {
    const res = handleBlock(className);
    return convertSimpleBlockHead(res, className.name);
  }
};

export const ifFlow = (...conditionActions) => (...args) => {
  for (const [condtion, action] of conditionActions) {
    if (condtion(...args)) return action(...args);
  }
};

export const Condition = {
  or: (...conditionFuncs) =>
    conditionFuncs.reduce(
      (acc, func) => (...args) => acc(...args) || func(...args),
      () => false,
    ),
  and: (...conditionFuncs) =>
    conditionFuncs.reduce(
      (acc, func) => (...args) => acc(...args) && func(...args),
      () => true,
    ),
};

export {
  useWatch,
  useDebounce,
  createUseDebounce,
  useThrottle,
  createUseThrottle,
  useResizeDetecter,
};
