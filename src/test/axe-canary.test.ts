import { afterEach, describe, expect, it } from 'vitest';
import { run } from 'axe-core';

let mountedNode: HTMLElement | null = null;

afterEach(() => {
  mountedNode?.remove();
  mountedNode = null;
});

describe('axe canary (proves the matcher can pass and fail under Vitest 5)', () => {
  it('passes on clean markup', async () => {
    const main = document.createElement('main');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Click me';
    main.appendChild(button);
    document.body.appendChild(main);
    mountedNode = main;

    const results = await run(main);
    expect(results).toHaveNoViolations();
  });

  it('fails on a known violation', async () => {
    const img = document.createElement('img');
    img.src = 'test-fixture.png';
    document.body.appendChild(img);
    mountedNode = img;

    const results = await run(img);
    expect(
      results.violations.some((violation) =>
        violation.id.includes('image-alt'),
      ),
    ).toBe(true);
    expect(results).not.toHaveNoViolations();
  });
});
