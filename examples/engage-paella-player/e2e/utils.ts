import { expect } from '@playwright/test';
import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import ID_strong_river from './__mock__/search/episode/ID-strong-river-flowing-down-the-green-forest.json' with { type: 'json' };
import infome from './__mock__/info/me.json' with { type: 'json' };


export const playerInstanceStr = '__paella_instances__[0]';


export const getPlayerState = async (page: Page): Promise<Record<string, string>> => await page.evaluate(`${playerInstanceStr}.PlayerState`);

export const waitState = async (page: Page, state: string): Promise<void> => {
  await page.evaluate(`${playerInstanceStr}.waitState(${state})`);
};

export const getState = async (page: Page): Promise<string> => await page.evaluate(`${playerInstanceStr}.state`);

export const clickToStartVideo = async (page: Page): Promise<void> => {
  const PlayerState = await getPlayerState(page);
  await waitState(page, PlayerState.MANIFEST);
  await page.click('#playerContainerClickArea');
  await waitState(page, PlayerState.LOADED);
  await expect(await getState(page)).toBe(PlayerState.LOADED);
};

export const playVideo = async (page: Page): Promise<void> => await page.evaluate(`${playerInstanceStr}.play()`);
export const pauseVideo = async (page: Page): Promise<void> => await page.evaluate(`${playerInstanceStr}.pause()`);


export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**/search/episode.json?id=ID-strong-river-flowing-down-the-green-forest', async route => {
      const json = ID_strong_river;
      await route.fulfill({ json });
    });

    await page.route('**/info/me.json', async route => {
      const json = infome;
      await route.fulfill({ json });
    });
    await page.route('**/annotation/**', async route => {
      await route.fulfill({status: 404});
    });


    await use(page);
  },
});