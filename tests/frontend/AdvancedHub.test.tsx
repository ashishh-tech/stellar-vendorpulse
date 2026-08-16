import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AdvancedFeaturesPage from '@/app/advanced/page';

describe('AdvancedFeaturesPage (Level 6 Black Belt Hub)', () => {
  it('renders header banner and all Level 6 feature tabs', () => {
    render(<AdvancedFeaturesPage />);

    expect(screen.getByText(/Level 6 — Black Belt Feature Hub/i)).toBeDefined();
    expect(screen.getByText(/Advanced Stellar/i)).toBeDefined();
    expect(screen.getByText('Fee Sponsorship')).toBeDefined();
    expect(screen.getByText('Multi-Sig Governance')).toBeDefined();
    expect(screen.getByText('Cross-Border Flows')).toBeDefined();
    expect(screen.getByText('Account Abstraction')).toBeDefined();
    expect(screen.getByText('Security & Audit')).toBeDefined();
    expect(screen.getByText('Mainnet Telemetry')).toBeDefined();
  });

  it('switches between feature tabs accurately', () => {
    render(<AdvancedFeaturesPage />);

    // Click Multi-Sig tab
    const multisigTab = screen.getByText('Multi-Sig Governance');
    fireEvent.click(multisigTab);
    expect(screen.getByText(/Multi-Signature Governance Center/i)).toBeDefined();

    // Click Cross-Border tab
    const crossBorderTab = screen.getByText('Cross-Border Flows');
    fireEvent.click(crossBorderTab);
    expect(screen.getByText(/Cross-Border Anchor Settlement/i)).toBeDefined();

    // Click Account Abstraction tab
    const smartWalletTab = screen.getByText('Account Abstraction');
    fireEvent.click(smartWalletTab);
    expect(screen.getByText(/Account Abstraction & WebAuthn Passkeys/i)).toBeDefined();

    // Click Security Audit tab
    const auditTab = screen.getByText('Security & Audit');
    fireEvent.click(auditTab);
    expect(screen.getByText(/AUDIT SCORE: 98\/100/i)).toBeDefined();
  });
});
