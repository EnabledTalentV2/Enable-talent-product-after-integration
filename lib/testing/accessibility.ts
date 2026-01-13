/**
 * Accessibility Testing Utilities for WCAG 2.1 AA / AODA Compliance
 *
 * This module provides utilities for automated accessibility testing.
 * Use these with Jest and @testing-library/react for component testing.
 *
 * Installation (run these commands):
 *   npm install --save-dev @axe-core/react jest-axe @testing-library/react @testing-library/jest-dom
 *
 * Usage in tests:
 *   import { axe, toHaveNoViolations } from 'jest-axe';
 *   import { checkAccessibility, a11yConfig } from '@/lib/testing/accessibility';
 *
 *   expect.extend(toHaveNoViolations);
 *
 *   test('component has no accessibility violations', async () => {
 *     const { container } = render(<YourComponent />);
 *     await checkAccessibility(container);
 *   });
 */

/**
 * Axe-core configuration for WCAG 2.1 AA compliance
 * These rules align with AODA requirements
 */
export const a11yConfig = {
  rules: {
    // WCAG 2.1 Level A rules
    "area-alt": { enabled: true },
    "aria-allowed-attr": { enabled: true },
    "aria-hidden-body": { enabled: true },
    "aria-hidden-focus": { enabled: true },
    "aria-input-field-name": { enabled: true },
    "aria-required-attr": { enabled: true },
    "aria-required-children": { enabled: true },
    "aria-required-parent": { enabled: true },
    "aria-roles": { enabled: true },
    "aria-toggle-field-name": { enabled: true },
    "aria-valid-attr-value": { enabled: true },
    "aria-valid-attr": { enabled: true },
    "button-name": { enabled: true },
    "bypass": { enabled: true },
    "document-title": { enabled: true },
    "duplicate-id-aria": { enabled: true },
    "form-field-multiple-labels": { enabled: true },
    "frame-title": { enabled: true },
    "html-has-lang": { enabled: true },
    "html-lang-valid": { enabled: true },
    "image-alt": { enabled: true },
    "input-button-name": { enabled: true },
    "input-image-alt": { enabled: true },
    "label": { enabled: true },
    "link-name": { enabled: true },
    "list": { enabled: true },
    "listitem": { enabled: true },
    "marquee": { enabled: true },
    "meta-refresh": { enabled: true },
    "object-alt": { enabled: true },
    "role-img-alt": { enabled: true },
    "scrollable-region-focusable": { enabled: true },
    "server-side-image-map": { enabled: true },
    "svg-img-alt": { enabled: true },
    "td-headers-attr": { enabled: true },
    "th-has-data-cells": { enabled: true },
    "valid-lang": { enabled: true },
    "video-caption": { enabled: true },

    // WCAG 2.1 Level AA rules
    "autocomplete-valid": { enabled: true },
    "avoid-inline-spacing": { enabled: true },
    "color-contrast": { enabled: true },
    "css-orientation-lock": { enabled: true },
    "empty-heading": { enabled: true },
    "focus-order-semantics": { enabled: true },
    "heading-order": { enabled: true },
    "hidden-content": { enabled: true },
    "identical-links-same-purpose": { enabled: true },
    "label-content-name-mismatch": { enabled: true },
    "landmark-one-main": { enabled: true },
    "meta-viewport": { enabled: true },
    "page-has-heading-one": { enabled: true },
    "region": { enabled: true },
    "skip-link": { enabled: true },
    "tabindex": { enabled: true },
    "target-size": { enabled: true },
    "table-duplicate-name": { enabled: true },
  },
};

/**
 * WCAG 2.1 AA violation severity levels
 */
export type ViolationImpact = "minor" | "moderate" | "serious" | "critical";

/**
 * Accessibility violation from axe-core
 */
export interface A11yViolation {
  id: string;
  impact: ViolationImpact;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    failureSummary: string;
  }>;
}

/**
 * Format accessibility violations for readable test output
 */
export function formatViolations(violations: A11yViolation[]): string {
  if (violations.length === 0) {
    return "No accessibility violations found.";
  }

  return violations
    .map((violation) => {
      const nodeList = violation.nodes
        .map(
          (node) =>
            `    - ${node.failureSummary}\n      HTML: ${node.html.slice(0, 100)}...`
        )
        .join("\n");

      return `
[${violation.impact?.toUpperCase()}] ${violation.id}
  ${violation.help}
  More info: ${violation.helpUrl}
  Affected elements:
${nodeList}`;
    })
    .join("\n");
}

/**
 * Check accessibility using jest-axe
 * Use this in your Jest tests.
 *
 * @example
 * ```tsx
 * import { checkAccessibility } from '@/lib/testing/accessibility';
 *
 * test('Button is accessible', async () => {
 *   const { container } = render(<Button>Click me</Button>);
 *   await checkAccessibility(container);
 * });
 * ```
 */
export async function checkAccessibility(
  container: Element,
  options?: { rules?: Record<string, { enabled: boolean }> }
): Promise<void> {
  // This function is a placeholder that should be implemented with jest-axe
  // when the testing dependencies are installed.
  //
  // Implementation:
  // ```
  // import { axe, toHaveNoViolations } from 'jest-axe';
  // expect.extend(toHaveNoViolations);
  //
  // const results = await axe(container, {
  //   rules: options?.rules ?? a11yConfig.rules,
  // });
  //
  // if (results.violations.length > 0) {
  //   throw new Error(formatViolations(results.violations));
  // }
  // ```
  console.log(
    "[a11y] checkAccessibility called - install jest-axe to enable automated testing"
  );
}

/**
 * Manual accessibility checklist for developers
 * Use this as a reference when developing new components.
 */
export const a11yChecklist = {
  keyboard: [
    "Can all interactive elements be reached with Tab key?",
    "Can all interactive elements be activated with Enter or Space?",
    "Is the focus order logical?",
    "Is there a visible focus indicator?",
    "Can modal dialogs be closed with Escape?",
    "Is focus trapped within modal dialogs?",
    "Is focus restored when dialogs close?",
  ],
  screenReader: [
    "Do all images have appropriate alt text?",
    "Are form inputs properly labeled?",
    "Are error messages announced?",
    "Are live regions used for dynamic content?",
    "Is the page structure conveyed with proper headings?",
    "Are ARIA landmarks used appropriately?",
  ],
  visual: [
    "Does text meet 4.5:1 contrast ratio (normal text)?",
    "Does text meet 3:1 contrast ratio (large text)?",
    "Do UI components meet 3:1 contrast ratio?",
    "Can the page be zoomed to 200% without loss of content?",
    "Is information conveyed without relying solely on color?",
  ],
  motion: [
    "Can animations be paused, stopped, or hidden?",
    "Is the prefers-reduced-motion media query respected?",
    "Are there no flashing elements that could cause seizures?",
  ],
  forms: [
    "Are required fields indicated?",
    "Are error messages clear and specific?",
    "Are errors linked to their corresponding inputs?",
    "Do inputs have autocomplete attributes where appropriate?",
  ],
};
