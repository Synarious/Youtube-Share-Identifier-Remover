// ==UserScript==
// @name            Remove YouTube Share Identifier
// @namespace       https://www.syfusion.com/github
// @version         1.3.0
// @description     Updates YouTube's share copy button so copied links omit the "si" parameter.
// @match           *://www.youtube.com/*
// @match           *://m.youtube.com/*
// @match           *://music.youtube.com/*
// @run-at          document-start
// @license         GPLv3; https://www.gnu.org/licenses/gpl-3.0.html#license-text
// @grant           none
// @author          synarion; https://www.syfusion.com/github
// @homepageURL     https://www.syfusion.com/github
// @supportURL      https://www.syfusion.com/github
// ==/UserScript==

(() => {
	"use strict";
	const PARAM = "si";
	const RENDERER_TAG = "yt-copy-link-renderer";
	const PATCHED_ATTR = "data-ysr-patched";
	const BUTTON_LABEL = "Anti-Track Copy";
	let lastUrl = location.href;

	function sanitize(raw) {
		try {
			const url = new URL(raw);
			url.searchParams.delete(PARAM);
			return url.toString();
		} catch {
			return raw;
		}
	}

	function getShareInput(renderer) {
		const input = renderer.querySelector("input#share-url");
		return input instanceof HTMLInputElement ? input : null;
	}

	function syncShareInput(renderer) {
		const input = getShareInput(renderer);
		if (!input?.value) return null;

		const cleaned = sanitize(input.value);
		if (cleaned !== input.value) {
			input.value = cleaned;
			input.setAttribute("value", cleaned);
		}

		return cleaned;
	}

	function syncButtonLabel(buttonHost) {
		buttonHost.setAttribute("aria-label", BUTTON_LABEL);

		const labelNode = buttonHost.querySelector("yt-button-shape button, button, .yt-spec-button-shape-next__button-text-content, .yt-core-attributed-string");
		if (labelNode instanceof HTMLElement) {
			labelNode.textContent = BUTTON_LABEL;
		}
	}

	function inject(renderer) {
		const buttonHost = renderer.querySelector("#copy-button");
		if (!(buttonHost instanceof HTMLElement) || !buttonHost.parentNode) return;
		if (buttonHost.hasAttribute(PATCHED_ATTR)) {
			syncShareInput(renderer);
			syncButtonLabel(buttonHost);
			return;
		}
		buttonHost.setAttribute(PATCHED_ATTR, "");
		syncShareInput(renderer);
		syncButtonLabel(buttonHost);
		let allowNativeCopy = false;

		buttonHost.addEventListener("click", async (event) => {
			if (allowNativeCopy) {
				allowNativeCopy = false;
				return;
			}

			const cleaned = syncShareInput(renderer);
			if (!cleaned) return;

			event.preventDefault();
			event.stopImmediatePropagation();

			try {
				await navigator.clipboard.writeText(cleaned);
			} catch {
				// Let the native handler run if clipboard access is blocked.
				allowNativeCopy = true;
				buttonHost.click();
			}
		}, true);
	}

	function scan(node) {
		if (!(node instanceof Element)) return;
		if (node.localName === RENDERER_TAG) {
			inject(node);
			return;
		}

		const renderers = node.querySelectorAll(RENDERER_TAG);
		for (const renderer of renderers) {
			inject(renderer);
		}
	}

	function scanCurrentDocument() {
		scan(document.documentElement);
	}

	function handleRouteChange() {
		if (location.href === lastUrl) return;
		lastUrl = location.href;
		scanCurrentDocument();
	}

	scanCurrentDocument();

	new MutationObserver((mutations) => {
		for (const { addedNodes } of mutations) {
			for (const node of addedNodes) scan(node);
		}
	}).observe(document.documentElement, { childList: true, subtree: true });

	window.addEventListener("yt-navigate-finish", handleRouteChange, true);
	window.addEventListener("popstate", handleRouteChange, true);
	window.addEventListener("hashchange", handleRouteChange, true);

})();