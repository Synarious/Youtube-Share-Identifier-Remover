// ==UserScript==
// @name            Remove YouTube Share Identifier
// @namespace       https://www.syfusion.com/github
// @version         1.4.0
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
	const PARAMS = ["si"];
	const RENDERER_TAG = "yt-copy-link-renderer";
	const BUTTON_LABEL = "Anti-Track Copy";
	const COPIED_LABEL = "Copied!";
	const PATCHED = new WeakSet();
	let lastUrl = location.href;
	let pendingMutations = [];
	let rafId = null;

	function sanitize(raw) {
		try {
			const url = new URL(raw);
			for (const param of PARAMS) {
				url.searchParams.delete(param);
			}
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
		if (PATCHED.has(buttonHost)) {
			syncShareInput(renderer);
			syncButtonLabel(buttonHost);
			return;
		}
		PATCHED.add(buttonHost);
		syncShareInput(renderer);
		syncButtonLabel(buttonHost);
		let copyTimeout = null;

		buttonHost.addEventListener("click", async (event) => {
			const cleaned = syncShareInput(renderer);
			if (!cleaned) return;

			try {
				await navigator.clipboard.writeText(cleaned);
				event.preventDefault();
				event.stopImmediatePropagation();

				const labelNode = buttonHost.querySelector("yt-button-shape button, button, .yt-spec-button-shape-next__button-text-content, .yt-core-attributed-string");
				if (labelNode instanceof HTMLElement) {
					if (copyTimeout) clearTimeout(copyTimeout);
					const origLabel = labelNode.textContent;
					labelNode.textContent = COPIED_LABEL;
					copyTimeout = setTimeout(() => {
						labelNode.textContent = origLabel;
						copyTimeout = null;
					}, 1500);
				}
			} catch {
				// Let the native handler run if clipboard access is blocked.
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

	function flushMutations() {
		rafId = null;
		const batch = pendingMutations;
		pendingMutations = [];
		for (const { addedNodes } of batch) {
			for (const node of addedNodes) scan(node);
		}
	}

	scanCurrentDocument();

	new MutationObserver((mutations) => {
		pendingMutations.push(...mutations);
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(flushMutations);
	}).observe(document.documentElement, { childList: true, subtree: true });

	window.addEventListener("yt-navigate-finish", handleRouteChange, true);
	window.addEventListener("popstate", handleRouteChange, true);
	window.addEventListener("hashchange", handleRouteChange, true);
})();
