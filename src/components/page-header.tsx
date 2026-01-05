'use client';

import { useEffect, ReactNode } from 'react';
import { usePageHeader } from './page-header-context';

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  const { setHeader } = usePageHeader();

  useEffect(() => {
    setHeader(title, actions);
  }, [title, actions, setHeader]);

  return null;
}
