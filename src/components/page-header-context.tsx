'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PageHeaderState {
  title: string;
  actions?: ReactNode;
}

interface PageHeaderContextType {
  state: PageHeaderState;
  setHeader: (title: string, actions?: ReactNode) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageHeaderState>({ title: '' });

  const setHeader = useCallback((title: string, actions?: ReactNode) => {
    setState({ title, actions });
  }, []);

  return (
    <PageHeaderContext.Provider value={{ state, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error('usePageHeader must be used within a PageHeaderProvider');
  }
  return context;
}

export function useSetPageHeader(title: string, actions?: ReactNode) {
  const { setHeader } = usePageHeader();
  // Use useEffect-like pattern via the component lifecycle
  useState(() => {
    setHeader(title, actions);
  });
}
