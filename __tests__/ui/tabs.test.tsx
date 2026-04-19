import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';

describe('TabsContent', () => {
  it('hides inactive content even when forceMount is enabled', () => {
    render(
      <Tabs value="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one" forceMount>
          <div>First panel</div>
        </TabsContent>
        <TabsContent value="two" forceMount>
          <div>Second panel</div>
        </TabsContent>
      </Tabs>,
    );

    const firstPanel = screen.getByText('First panel').closest('[data-slot="tabs-content"]');
    const secondPanel = screen.getByText('Second panel').closest('[data-slot="tabs-content"]');

    expect(firstPanel).toHaveAttribute('data-state', 'active');
    expect(secondPanel).toHaveAttribute('data-state', 'inactive');
    expect(secondPanel?.className).toContain('data-[state=inactive]:hidden');
  });
});
