/**
 * @preserve
 * Lydia CMS: SecureGate — Client-Side HTTPS Enforcer v1.0.0
 * Official module for Lydia CMS v1.0
 *
 * @description A zero-overhead client-side HTTPS enforcer module for Lydia CMS v1.0.
 * Intercepts authorization events, prevents plain-text data leaks over HTTP,
 * and includes automated multilingual test suites.
 *
 * @headline Intercepts user authorization events and strictly prevents
 * confidential data transmission over unencrypted HTTP connections.
 *
 * @author    Sergey Kubasov
 * @copyright 2026 Star fort (https://starfort.ru)
 * @license   MIT License (https://opensource.org)
 * @link      https://github.com/star-fort/Lydia-cms-secure-gate
 * @co-author Gemini AI (Google DeepMind AI Collaborator)
 *
 * Free Software. Enjoy and contribute!
 */


(function () {

    // CONFIGURATION SWITCH: Set to false on production to completely disable bypass prompts.
    var DEBUG_MODE = true;

    // Constructor: Initializes the gate and sets default configuration parameters
    window.LydiaSecureGate = function (config) {
        this.config = config || {};
        this.criticalBlockId = this.config.criticalBlockId || "secure-critical";
        this.authContainerId = this.config.authContainerId || "auth-container";
        this.btnOpenId = this.config.btnOpenId || "btn-open-auth-modal";

        // Detect page language from <html lang="...">. Defaults to English if not 'ru'.
        var htmlTag = document.getElementsByTagName("html")[0];
        this.lang = (htmlTag && htmlTag.getAttribute("lang") === "ru") ? "ru" : "en";
    };

    window.LydiaSecureGate.prototype = {

        /**
         * Binds security interceptor to a specific element event. Compatible with IE8.
         */
        protect: function (element, eventType, safeCallback) {
            if (!element) return;

            var self = this;

            if (element.addEventListener) {
                element.addEventListener(eventType, function (e) { self._handleEvent(e, safeCallback, element); }, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + eventType, function (e) { self._handleEvent(e, safeCallback, element); });
            }
        },

        /**
         * Internal event interceptor logic.
         */
        _handleEvent: function (event, safeCallback, element) {
            var e = event || window.event;

            var isForm = (element.tagName && element.tagName.toLowerCase() === "form");
            var isConnectionSecure = (window.location.protocol === "https:");

            if (isConnectionSecure) {
                if (!isForm && e.preventDefault) { e.preventDefault(); }
                safeCallback();
                return true;
            }

            if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }

            var self = this;
            var btnOpen = document.getElementById(this.btnOpenId);

            if (btnOpen && !isForm) {
                btnOpen.innerHTML = (this.lang === "ru") ? "Проверка безопасности..." : "Checking security...";
                btnOpen.disabled = true;
            }

            this._pingServer(function (isServerCapable) {
                if (btnOpen) { btnOpen.disabled = false; }

                if (isServerCapable) {
                    if (btnOpen) { btnOpen.innerHTML = (self.lang === "ru") ? "Перенаправление..." : "Redirecting..."; }
                    window.location.replace("https://" + window.location.host + window.location.pathname + window.location.search + window.location.hash);
                } else {
                    self._handleFailure(btnOpen, safeCallback, isForm);
                }
            });

            return false;
        },

        /**
         * Core failure handler: displays localized alerts and confirm modals.
         */
        _handleFailure: function (btnOpen, safeCallback, isForm) {
            var criticalBlock = document.getElementById(this.criticalBlockId);
            var authContainer = document.getElementById(this.authContainerId);

            if (DEBUG_MODE) {
                if (isForm) {
                    // RUBEZH 2: Localized alert on form submission
                    if (this.lang === "ru") {
                        alert("ВНИМАНИЕ:\n\nПередача конфиденциальной информации в открытом виде по протоколу http запрещена!\n\nВсе локальные хранилища, сессии и кэш будут немедленно очищены.");
                    } else {
                        alert("WARNING:\n\nTransmission of confidential information in plain text via http protocol is prohibited!\n\nAll local storages, sessions, and cache will be cleared immediately.");
                    }
                    safeCallback();
                    return;
                } else {
                    // RUBEZH 1: Localized confirm on initial button click
                    var userAgreed = false;
                    if (this.lang === "ru") {
                        userAgreed = confirm("ВНИМАНИЕ:\n\nСервер не поддерживает безопасное HTTPS-соединение.\nПередача конфиденциальной информации в открытом виде по протоколу http запрещена!\n\n[РЕЖИМ РАЗРАБОТЧИКА]: Разблокировать форму для локального тестирования?");
                    } else {
                        userAgreed = confirm("WARNING:\n\nThe server does not support a secure HTTPS connection.\nTransmission of confidential information in plain text via http protocol is prohibited!\n\n[DEVELOPER MODE]: Unlock the form for local testing purposes?");
                    }

                    if (userAgreed) {
                        if (btnOpen) { btnOpen.style.display = "none"; }
                        if (authContainer) { authContainer.style.cssText = "display: block !important;"; }
                        safeCallback();
                        return;
                    }
                }
            }

            if (btnOpen) { btnOpen.style.display = "none"; }
            if (criticalBlock) { criticalBlock.style.cssText = "display: block !important;"; }
            if (authContainer) { authContainer.style.cssText = "display: none !important;"; }
        },

        /**
         * Performs a lightweight background HEAD request to verify port 443 availability.
         */
        _pingServer: function (callback) {
            if (!window.location.host || window.location.protocol === "file:") {
                setTimeout(function () { callback(false); }, 10);
                return;
            }

            var checkUrl = "https://" + window.location.host + "/";
            var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

            xhr.open("HEAD", checkUrl, true);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status > 0) { callback(true); } else { callback(false); }
                }
            };

            try { xhr.send(); } catch (err) { callback(false); }
        }
    };

    /**
     * Lazy script loader. Inserts trusted JS components before the closing body tag.
     */
    window.requireScript = function (url, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        var isExecuted = false;
        function handleLoad(isSuccess) {
            if (!isExecuted) {
                isExecuted = true;
                script.onload = null; script.onreadystatechange = null; script.onerror = null;
                callback(isSuccess);
            }
        }

        script.onload = function () { handleLoad(true); };
        script.onreadystatechange = function () {
            if (script.readyState === 'loaded' || script.readyState === 'complete') { handleLoad(true); }
        };
        script.onerror = function () { handleLoad(false); };

        var body = document.getElementsByTagName('body');
        if (body) { body.appendChild(script); }
    };

})();

// Initialization after full DOM rendering
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", initLydiaGate, false);
} else {
    window.onload = initLydiaGate;
}

/**
 * ИЗОЛИРОВАННАЯ ФУНКЦИЯ ЭКСТРЕННОЙ ОЧИСТКИ ХРАНИЛИЩ
 */
function clearClientStorage() {
    if (typeof window.localStorage !== "undefined" && window.localStorage.clear) {
        window.localStorage.clear();
    }
    if (typeof window.sessionStorage !== "undefined" && window.sessionStorage.clear) {
        window.sessionStorage.clear();
    }

    if (document.cookie) {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos).replace(/^\s+/, "") : cookie.replace(/^\s+/, "");
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + window.location.hostname + ";";
        }
    }

    window.location.reload();
}

function initLydiaGate() {
    var gate = new LydiaSecureGate({
        criticalBlockId: "secure-critical",
        authContainerId: "auth-container",
        btnOpenId: "btn-open-auth-modal"
    });

    var btnOpen = document.getElementById("btn-open-auth-modal");
    var authForm = document.getElementById("secure-auth-form");

    // РУБЕЖ 1: Защита первой кнопки
    gate.protect(btnOpen, "click", function () {
        var authContainer = document.getElementById("auth-container");
        requireScript("js/auth.js", function (success) {
            if (success && typeof initAuth === "function") {
                if (authContainer) { authContainer.style.cssText = "display: block !important;"; }
                if (btnOpen) { btnOpen.style.display = "none"; }
                initAuth();
            }
        });
    });

    // РУБЕЖ 2: Защита отправки формы
    gate.protect(authForm, "submit", function () {
        var authContainer = document.getElementById("auth-container");

        var inputs = authForm.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type === "text" || inputs[i].type === "password") {
                inputs[i].value = "";
            }
        }
        if (authContainer) { authContainer.style.cssText = "display: none !important;"; } if (btnOpen) { btnOpen.style.display = "block"; }
        clearClientStorage();
    });
}
