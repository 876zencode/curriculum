import { useEffect } from "react";
import { playSfx } from "@/lib/sfx";

const NAV_SELECTOR = 'a[href], [data-sfx="nav"]';
const BUTTON_SELECTOR =
  'button, [role="button"], input[type="button"], input[type="submit"], [data-sfx="button"]';
const CARD_SELECTOR = '[data-sfx="card"], .cursor-pointer';
const DISABLED_SELECTOR = "[disabled], [aria-disabled='true']";
const OFF_SELECTOR = '[data-sfx="off"]';

const isElement = (value: EventTarget | null): value is Element =>
  value instanceof Element;

export const useClickSfx = () => {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (event.defaultPrevented || !isElement(event.target)) return;
      const target = event.target;
      if (target.closest(OFF_SELECTOR) || target.closest(DISABLED_SELECTOR)) {
        return;
      }

      if (target.closest(NAV_SELECTOR)) {
        playSfx("nav");
        return;
      }

      if (target.closest(BUTTON_SELECTOR)) {
        playSfx("button");
        return;
      }

      if (target.closest(CARD_SELECTOR)) {
        playSfx("card");
      }
    };

    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  }, []);
};
