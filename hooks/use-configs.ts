// hooks/use-configs.ts
import { useContext } from 'react';
import { ConfigsContext } from '@contexts/configs-context';

export const useConfigs = () => {
  const context = useContext(ConfigsContext);
  if (!context) {
    throw new Error('useConfigs must be used within a ConfigsProvider');
  }
  return context;
};