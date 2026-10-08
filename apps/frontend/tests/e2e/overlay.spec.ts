import { expect, expectNoDuplicateIds, getBodyOverflow, test } from './fixtures';

test.describe('Overlay primitive and shell coordinator contract checks', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore only the expected resource 404 from the guard test
        if (!text.startsWith('Failed to load resource: the server responded with a status of 404')) {
          consoleErrors.push(text);
        }
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });
    (page as unknown as { __consoleErrors: string[] }).__consoleErrors = consoleErrors;
  });

  test.afterEach(async ({ page }) => {
    const errors = (page as unknown as { __consoleErrors?: string[] }).__consoleErrors ?? [];
    expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
  });

  test('Matrix 1: Keyboard open — focus trigger, Enter opens dialog, moves focus inside, locks body scroll', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/overlay/menu-consult');
    const trigger = page.locator('[data-testid="menu-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Focus moved inside dialog
    const focusInside = await page.evaluate(() => {
      const active = document.activeElement;
      const d = document.querySelector('[role="dialog"]');
      return !!(d && active && d.contains(active));
    });
    expect(focusInside).toBe(true);

    // Legacy CSS keeps .mfp-bg/.mfp-content at opacity 0 until mfp-ready lands
    await expect(page.locator('.mfp-wrap')).toHaveClass(/mfp-ready/);
    await expect(page.locator('.mfp-bg')).toHaveClass(/mfp-ready/);

    // Body scroll locked
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).toBe('hidden');
  });

  test('Matrix 2: Focus trap — Tab and Shift+Tab cycle inside the content', async ({ page }) => {
    await page.goto('/dev-fixtures/overlay/menu-consult');
    await page.locator('[data-testid="menu-trigger"]').click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Tab past all focusable elements inside the dialog
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const focusInside = await page.evaluate(() => {
        const active = document.activeElement;
        const d = document.querySelector('[role="dialog"]');
        return !!(d && active && d.contains(active));
      });
      expect(focusInside).toBe(true);
    }

    // Shift+Tab backward past first focusable element
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Shift+Tab');
      const focusInside = await page.evaluate(() => {
        const active = document.activeElement;
        const d = document.querySelector('[role="dialog"]');
        return !!(d && active && d.contains(active));
      });
      expect(focusInside).toBe(true);
    }
  });

  test('Matrix 3: Escape — closes dialog, returns focus to trigger, unlocks scroll', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/overlay/menu-consult');
    const trigger = page.locator('[data-testid="menu-trigger"]');
    await trigger.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);

    // Focus returns to trigger
    await expect(trigger).toBeFocused();

    // Scroll unlocked
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).not.toBe('hidden');
  });

  test('Matrix 4: Overlay click — pointer down on .mfp-container outside content closes and returns focus', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/overlay/menu-consult');
    const trigger = page.locator('[data-testid="menu-trigger"]');
    await trigger.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Click on .mfp-container outside off-canvas content
    const container = page.locator('.mfp-container');
    await expect(container).toBeVisible();
    await container.click({ position: { x: 20, y: 20 } });
    await expect(dialog).toHaveCount(0);

    // Focus returns to trigger
    await expect(trigger).toBeFocused();
  });

  test('Matrix 5: Close button — click .mfp-close closes dialog and returns focus', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/overlay/menu-consult');
    const trigger = page.locator('[data-testid="menu-trigger"]');
    await trigger.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await page.locator('[role="dialog"] button.mfp-close').click();
    await expect(dialog).toHaveCount(0);

    // Focus returns to trigger
    await expect(trigger).toBeFocused();
  });

  test('Matrix 6: Handoff — menu hands off to consult; scroll stays locked throughout; on close focus returns to menu trigger', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/overlay/menu-consult');
    const menuTrigger = page.locator('[data-testid="menu-trigger"]');
    await menuTrigger.click();

    await expect(page.locator('#main-menu')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');

    // Record any moment the body loses its lock mid-handoff
    await page.evaluate(() => {
      const w = window as unknown as { __unlocked: boolean; __lockObs: MutationObserver };
      w.__unlocked = false;
      w.__lockObs = new MutationObserver(() => {
        if (!document.body.hasAttribute('data-scroll-locked')) w.__unlocked = true;
      });
      w.__lockObs.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
    });

    // Activate consult inside menu
    const consultTrigger = page.locator('[data-testid="menu-consult-trigger"]');
    await consultTrigger.click();

    // Menu unmounts, consult opens
    await expect(page.locator('#main-menu')).toHaveCount(0);
    await expect(page.locator('#consult-popup')).toBeVisible();

    // Body scroll stays locked throughout
    const unlockedMidHandoff = await page.evaluate(() => {
      const w = window as unknown as { __unlocked: boolean; __lockObs: MutationObserver };
      w.__lockObs.disconnect();
      return w.__unlocked;
    });
    expect(unlockedMidHandoff).toBe(false);
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).toBe('hidden');

    // Close consult popup via Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('#consult-popup')).toHaveCount(0);

    // Focus returns to the original menu trigger
    await expect(menuTrigger).toBeFocused();

    // Body scroll unlocked
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).not.toBe('hidden');
  });

  test('Matrix 7: Single overlay — open(b) while a open swaps active with never two dialogs in DOM', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/overlay/menu-consult');
    await page.locator('[data-testid="menu-trigger"]').click();
    await expect(page.locator('#main-menu')).toBeVisible();

    // Trigger direct open('consult') while 'menu' is open
    await page.locator('[data-testid="menu-consult-direct"]').click();

    await expect(page.locator('#main-menu')).toHaveCount(0);
    await expect(page.locator('#consult-popup')).toBeVisible();

    // Exactly one dialog exists in DOM
    await expect(page.locator('[role="dialog"]')).toHaveCount(1);

    // open() while active keeps the original trigger for focus return
    await page.keyboard.press('Escape');
    await expect(page.locator('#consult-popup')).toHaveCount(0);
    await expect(page.locator('[data-testid="menu-trigger"]')).toBeFocused();
  });

  test('Matrix 8: Unmount while open — client-nav away restores body scroll and pointer-events with no errors', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/overlay/menu-consult');
    await page.locator('[data-testid="menu-trigger"]').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');

    // Client navigation away while dialog is open
    await page.getByTestId('fixture-client-nav').evaluate((el) => (el as HTMLElement).click());
    await expect(page).toHaveURL(/\/single\/?$/);

    // Dialog is gone
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Scroll and pointer-events restored
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
    const { pointerEvents } = await page.evaluate(() => ({
      pointerEvents: document.body.style.pointerEvents,
    }));
    expect(await getBodyOverflow(page)).not.toBe('hidden');
    expect(pointerEvents).not.toBe('none');
  });

  test('Matrix 9: Trigger gone — stored trigger removed/hidden before close succeeds with no throw and skips focus restore', async ({
    page,
  }) => {
    // 1. Test hidden trigger (visibility: hidden)
    await page.goto('/dev-fixtures/overlay/menu-consult');
    const trigger = page.locator('[data-testid="menu-trigger"]');
    await trigger.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Hide trigger via CSS while dialog is open
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="menu-trigger"]') as HTMLElement | null;
      if (el) el.style.visibility = 'hidden';
    });

    // Close dialog — focus restore should be skipped with no throw
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
    await expect(trigger).not.toBeFocused();

    // 2. Test removed trigger (disconnected from DOM)
    await page.reload();
    const freshTrigger = page.locator('[data-testid="menu-trigger"]');
    await freshTrigger.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Remove trigger from DOM while dialog is open
    await page.evaluate(() => {
      document.querySelector('[data-testid="menu-trigger"]')?.remove();
    });

    // Close dialog — close succeeds with no throw
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
  });

  test('Matrix 10: Duplicate IDs — no duplicate IDs in any state including mid-handoff', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/overlay/menu-consult');
    await expectNoDuplicateIds(page);

    // Open menu
    await page.locator('[data-testid="menu-trigger"]').click();
    await expect(page.locator('#main-menu')).toBeVisible();
    await expectNoDuplicateIds(page);

    // Install MutationObserver to sample every DOM mutation mid-handoff
    await page.evaluate(() => {
      (window as unknown as { __dupErrors: string[] }).__dupErrors = [];
      const obs = new MutationObserver(() => {
        const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id).filter(Boolean);
        const seen = new Set<string>();
        for (const id of ids) {
          if (seen.has(id)) {
            (window as unknown as { __dupErrors: string[] }).__dupErrors.push(id);
          }
          seen.add(id);
        }
      });
      obs.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id'],
      });
      (window as unknown as { __dupObs: MutationObserver }).__dupObs = obs;
    });

    // Handoff to consult
    await page.locator('[data-testid="menu-consult-trigger"]').click();
    // Sample immediately upon handoff
    await expectNoDuplicateIds(page);
    await expect(page.locator('#consult-popup')).toBeVisible();
    // Sample after consult is visible
    await expectNoDuplicateIds(page);

    // Verify no duplicates occurred during mutations mid-handoff
    const midHandoffDuplicates = await page.evaluate(() => {
      (window as unknown as { __dupObs?: MutationObserver }).__dupObs?.disconnect();
      return (window as unknown as { __dupErrors?: string[] }).__dupErrors ?? [];
    });
    expect(midHandoffDuplicates).toEqual([]);

    // Close
    await page.keyboard.press('Escape');
    await expect(page.locator('#consult-popup')).toHaveCount(0);
    await expectNoDuplicateIds(page);
  });

  test('Single lightbox fixture variant — opens centered lightbox dialog and closes via button', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/overlay/single');
    const trigger = page.locator('[data-testid="single-trigger"]');
    await trigger.click();

    const dialog = page.locator('#single-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveClass(/lightbox-content/);
    await expect(page.locator('.mfp-wrap')).toHaveClass(/mfp-ready/);
    await expect(page.locator('.mfp-bg')).toHaveClass(/mfp-ready/);

    // Inner content is visible
    await expect(page.locator('[data-testid="single-dialog-content"]')).toBeVisible();

    // Close via close button
    await page.locator('#single-dialog button.mfp-close').click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator('body')).not.toHaveAttribute('data-scroll-locked');
  });

  test('Matrix 11: Guard off / unknown variant — returns 404', async ({ page }) => {
    const response = await page.goto('/dev-fixtures/overlay/unknown-variant');
    expect(response?.status()).toBe(404);
  });

  test('Probe C4: Tall lightbox content scrolls with mouse wheel', async ({
    page,
  }) => {
    // .mfp-wrap sits inside Radix RemoveScroll tree via display:contents DialogPrimitive.Overlay,
    // so wheel events are handled by .mfp-wrap and scrollTop increases while body scroll remains locked.
    await page.goto('/dev-fixtures/overlay/single');
    await page.locator('[data-testid="single-trigger"]').click();
    const dialog = page.locator('#single-dialog');
    await expect(dialog).toBeVisible();

    await page.evaluate(() => {
      const content = document.querySelector('[data-testid="single-dialog-content"]') as HTMLElement;
      content.style.height = '3000px';
    });

    const wrap = page.locator('.mfp-wrap');
    await page.mouse.move(500, 300);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(100);

    const newScrollTop = await wrap.evaluate((el) => el.scrollTop);
    expect(newScrollTop).toBeGreaterThan(0);

    // Body scroll stays locked
    await expect(page.locator('body')).toHaveAttribute('data-scroll-locked');
    expect(await getBodyOverflow(page)).toBe('hidden');
  });
});
