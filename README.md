# Lydia CMS: SecureGate — Client-Side HTTPS Enforcer

**Lydia CMS: SecureGate** (Russian: *Лидия: Безопасный Вход — Клиентская защита авторизации*) is a lightweight, zero-overhead, fault-tolerant script written in native legacy JavaScript. It is designed specifically for the Lydia CMS ecosystem to protect sensitive user actions (such as logins, registration, and payment form submissions) from sniffing and data transmission over unencrypted HTTP connections.

## ✨ Core Features

* **0% Server Overhead:** Protocol evaluation, server capability checks, and redirects are performed entirely on the client side using the user's browser.
* **On-Demand Validation:** The security check is triggered only when a user interacts with a protected element (e.g., clicking a button or pressing `Enter` inside a form). No redundant background requests are fired on regular content pages.
* **Leak Protection (Lazy Loading):** Critical authorization scripts (e.g., `js/auth.js`) are physically blocked from downloading until the client-side environment is verified as secure.
* **Maximum Legacy Compatibility:** Fully compatible with older ECMAScript standards (including Internet Explorer 8+) and built to handle selective blocking by extensions like **NoScript**.

## 🏗️ Technical Architecture

The module utilizes an optimized cross-browser workflow to intercept user actions safely:
1. **Scope Isolation (IIFE):** The core code is wrapped in an Immediately Invoked Function Expression to prevent global namespace pollution and shield critical methods from potential XSS exploitation.
2. **Asynchronous HEAD Pinging:** If a user triggers a protected action via HTTP, the engine performs a lightweight asynchronous `HEAD` request to port 443 instead of a full `GET` request. The Lydia CMS backend does not waste CPU cycles rendering HTML or querying databases; it simply returns a few bytes of headers.
3. **Smart Failure Branching:**
   * *HTTPS Available:* The browser triggers a seamless `location.replace()` redirect, keeping the user's workflow intact.
   * *HTTPS Missing/Broken:* The engine initiates a hard block—hiding the form element and displaying a critical security warning block.

## 🚀 Installation & Integration

### 1. Template Setup
Add the critical error container and assign a unique ID to your form within the Lydia CMS login template:

```html
<!-- Critical security alert block (hidden by default) -->
<div id="secure-critical" style="display:none; background:#f8d7da; color:#721c24; padding:15px; border:1px solid #f5c6cb;">
    <strong>Critical Security Error!</strong> Login blocked: the server does not support secure HTTPS connections. Transmission of credentials over HTTP is strictly prohibited.
</div>

<!-- Protected Form -->
<form id="secure-auth-form" action="/login-handler" method="POST">
    <input type="text" name="user" required>
    <input type="password" name="pass" required>
    <button type="submit">Log In</button>
</form>
```

### 2. Script Placement
Include the core library at the very bottom of your layout page, **after the footer markup**, right before the closing `</body>` tag:

```html
    <!-- Footer markup ends here -->
    <footer>...</footer>

    <!-- SecureGate Engine: Must be loaded after full DOM layout rendering -->
    <script type="text/javascript" src="js/main.js"></script>
</body>
```

## 🛠️ Local Testing

A built-in test suite is included in the repository. To manually test the environment evaluation, error catching, and NoScript edge-cases without setting up a local web server, simply open the following file directly in any browser:
```text
tests/index.html
```
## 📂 Repository File Structure & Descriptions

*   **`css/`** — Contains frontend visual layouts.
    *   `style.css` — Base styles ensuring proper hiding/showing of modal dialogs and hard-block screens.
*   **`js/`** — Core security engine and lazy-loaded targets.
    *   `secure-gate.js` — Main client-side enforcer script. Handles protocol validation, HEAD pinging, and storage wipes.
    *   `auth.js` — Mock authorization module. Downloaded asynchronously only after a secure channel is confirmed.
    *   `billing.js` — Mock payment gate module showcasing lazy loading integration.
*   **`tests/`** — Automated validation sandbox.
    *   `index.html` — Base English automated test runner verifying object initialization and non-freezing file:// architecture.
    *   `index_ru.html` — Localized Russian automated test runner with cross-links to verify Cyrillic language engine.
*   **`index.html`** — Core English presentation window and module handbook.
*   **`index_ru.html`** — Localized Russian presentation window and quick-test entry point.
*   **`.gitignore`** — Restricts OS metadata, editor configurations, and debug logs from cluttering the repository.
*   **`LICENSE`** — Legal parameters of the open-source MIT License.

## 📄 License

This module is open-source software licensed under the [MIT License](LICENSE).
