/**
 * WCAG 2.2 Level AAA — Automated Accessibility Tests
 *
 * Runs axe-core against key components to catch regressions.
 * Run: npm run test:a11y
 *
 * These tests cover rendered HTML structure only. Manual testing
 * (keyboard nav, screen reader) is still required per ACCESSIBILITY.md.
 */

import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// ---------------------------------------------------------------------------
// ConfirmDialog
// ---------------------------------------------------------------------------
import ConfirmDialog from "../../components/a11y/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("has no axe violations when open (warning variant)", async () => {
    const { container } = render(
      <ConfirmDialog
        isOpen
        title="Delete this item?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with requiresConfirmation checkbox", async () => {
    const { container } = render(
      <ConfirmDialog
        isOpen
        title="Delete account?"
        message="All your data will be permanently removed."
        confirmLabel="Delete account"
        cancelLabel="Keep account"
        variant="danger"
        requiresConfirmation
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="Test"
        message="Test message"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

// ---------------------------------------------------------------------------
// Glossary (SC 3.1.3)
// ---------------------------------------------------------------------------
import Glossary from "../../components/a11y/Glossary";

describe("Glossary", () => {
  it("has no axe violations", async () => {
    const { container } = render(
      <Glossary
        definition="Automatically reading your resume file to fill in your profile"
        term="Resume parsing"
      >
        Resume parsing
      </Glossary>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// DashboardProfilePrompt
// ---------------------------------------------------------------------------
import DashboardProfilePrompt from "../../components/DashboardProfilePrompt";

describe("DashboardProfilePrompt", () => {
  it("has no axe violations at 45%", async () => {
    const { container } = render(<DashboardProfilePrompt percent={45} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations at 80%", async () => {
    const { container } = render(<DashboardProfilePrompt percent={80} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders nothing at 100%", () => {
    const { container } = render(<DashboardProfilePrompt percent={100} />);
    expect(container).toBeEmptyDOMElement();
  });
});

// ---------------------------------------------------------------------------
// SuccessModal
// ---------------------------------------------------------------------------
import SuccessModal from "../../components/employer/candidates/SuccessModal";

describe("SuccessModal", () => {
  it("has no axe violations when open", async () => {
    const { container } = render(
      <SuccessModal
        isOpen
        onClose={() => {}}
        message="Invites sent successfully to 3 candidates."
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <SuccessModal isOpen={false} onClose={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

// ---------------------------------------------------------------------------
// Breadcrumb (SC 2.4.8)
// ---------------------------------------------------------------------------
import Breadcrumb from "../../components/a11y/Breadcrumb";

// Breadcrumb reads from next/navigation — mock it
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/profile",
}));

describe("Breadcrumb", () => {
  it("has no axe violations on a nested path", async () => {
    const { container } = render(<Breadcrumb />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
