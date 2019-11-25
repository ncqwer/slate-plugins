import React from 'react';

export const Icon = ({ type, message }) => {
  const className = `iconfont icon-${type}`;
  return <span className={className} />;
};
