# Remove YouTube Share Identifier

A lightweight Tampermonkey userscript that enhances your privacy by automatically removing YouTube's tracking parameters from copied share links.

Note: This project doesn't remove 

## Overview

When you use YouTube's built-in "Share" button, YouTube appends an `si` (Share Identifier) parameter to the URL. This parameter is used to track who originally shared the link and how it propagates across the internet. This script intercepts the copy action, strips the tracking parameter, and copies a clean, untracked link directly to your clipboard.

## Features

* **Privacy First:** Automatically removes the `si` search parameter from all generated YouTube share links.
* **Visual Confirmation:** Renames the standard YouTube copy button to **"Anti-Track Copy"** so you know the script is active and working.
* **Seamless Integration:** Works transparently in the background. If native clipboard permissions are blocked by the browser, it gracefully falls back to YouTube's native copy behavior (while still sanitizing the visible input field).
* **Broad Compatibility:** Actively monitors and applies to standard desktop YouTube, mobile YouTube, and YouTube Music.
* **Dynamic Page Ready:** Utilizes mutation observers and intercepts YouTube's custom navigation events (`yt-navigate-finish`, `popstate`, `hashchange`) to ensure it works flawlessly with YouTube's Single Page Application (SPA) architecture.

## Supported Sites

* `*://www.youtube.com/*`
* `*://m.youtube.com/*`
* `*://music.youtube.com/*`

## Installation

1. Install a userscript manager extension for your web browser (such as **Tampermonkey**).
- Chrome? May need to enable BOTH "developer mode" under extensions AND grant "users script" permission to Tampermonkey itself via extension menu. 
2. Create a new userscript within your extension's dashboard.
3. Copy the source code and paste it into the editor, replacing any default template code.
4. Save the script.
5. Refresh any open YouTube tabs for the changes to take effect. Open a video, click "Share," and look for the **Anti-Track Copy** button.

## License

This project is licensed under the **GPLv3** License.
