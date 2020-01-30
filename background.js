'use strict';
var ColorfulTabs = {
    async init() {
        ColorfulTabs.initTheme();

        browser.runtime.onInstalled.addListener(function (details) {
            if (details.reason == "install") {
                browser.tabs.create({
                    url: "https://www.addongenie.com/fr/colorfultabs?vi=" + browser.runtime.getManifest().version,
                    active: true
                });
            }
            if (details.reason == "update") {
                browser.tabs.create({
                    url: "https://www.addongenie.com/fr/colorfultabs?vu=" + browser.runtime.getManifest().version,
                    active: true
                });
            }
            try {
                let ctpanel = browser.extension.getURL("/sidebar.html");
                browser.sidebarAction.open().then(setSB => {
                    browser.sidebarAction.setPanel({
                        panel: ctpanel
                    });
                });
            } catch (err) {
                console.log(err);
            }
        });

        // Update theme
        browser.tabs.onActivated.addListener(async (activeInfo) => {
            await browser.tabs.get(activeInfo.tabId, async (tab) => {

                let host = new URL(tab.url);
                if (host.hostname) {
                    host = host.hostname.toString();
                }
                else {
                    host = host.href;
                }
                var tabClr;
                try {
                    tabClr = await CtUtils.gethsl(host, tab.id); //ColorfulTabs.genTabClr(host); // 'hsl(' + Math.abs(ColorfulTabs.clrHash(host)) % 360 + ',' + sat + '%,' + lum + '%)';
                    tabClr = 'hsl(' + tabClr.h + ',' + tabClr.s + '%,' + tabClr.l + '%)';
                }
                catch (e) {
                    console.log('tabClr err in bg.s' + e);
                }

                ColorfulTabs.clrtheme.colors.toolbar = tabClr;
                await ColorfulTabs.updateTheme(tab.windowId, ColorfulTabs.clrtheme);
            });
        });

        // Initial tabs + handler for sidebar action clicks
        browser.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                if (request.initialized) {
                    ColorfulTabs.sendTabs(request, sender, sendResponse);
                }
                if (request.select) {
                    //console.dir(request);
                    //console.dir(sender);
                    //console.dir(sendResponse);
                    ColorfulTabs.onUpdated(request.select);
                }
                if (request.close) {
                    ColorfulTabs.onRemoved(request.close.tabId, request.close);
                }
                if (request.newtab) {
                    browser.tabs.create({
                        active: true
                    });
                }
            }
        );

        browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            if (changeInfo.status != "complete") {
                return;
            }
            await browser.tabs.get(tabId, async (tab) => {
                let host = new URL(tab.url);
                if (host.hostname) {
                    host = host.hostname.toString();
                }
                else {
                    host = host.href;
                }
                let tabClr = await CtUtils.gethsl(host, tab.id);
                tabClr = 'hsl(' + tabClr.h + ',' + tabClr.s + '%,' + tabClr.l + '%)';
                ColorfulTabs.clrtheme.colors.toolbar = tabClr;
                await ColorfulTabs.updateTheme(tab.windowId, ColorfulTabs.clrtheme);
            });
        });

        browser.tabs.onCreated.addListener(ColorfulTabs.setBadge);
        browser.tabs.onAttached.addListener(ColorfulTabs.setBadge);
        browser.tabs.onDetached.addListener(ColorfulTabs.setBadge);
        browser.tabs.onRemoved.addListener(ColorfulTabs.setBadge);

        //browser.tabs.onActivated.addListener(ColorfulTabs.onActivated);
        //browser.tabs.onAttached.addListener(ColorfulTabs.onAttached);

        browser.tabs.onCreated.addListener(ColorfulTabs.onCreated);
        //browser.tabs.onDetached.addListener(ColorfulTabs.onDetached);
        //browser.tabs.onHighlighted.addListener(ColorfulTabs.onHighlighted);
        //browser.tabs.onMoved.addListener(ColorfulTabs.onMoved);
        //browser.tabs.onRemoved.addListener(ColorfulTabs.onRemoved);
        //browser.tabs.onReplaced.addListener(ColorfulTabs.onReplaced);
        browser.tabs.onUpdated.addListener(ColorfulTabs.onUpdated);
    },
    /*
    onActivated(activeInfo) {
        var updating;
        updating = browser.tabs.update(parseInt(activeInfo.tabId), {
            active: true
        });
        updating.then(function (error) { }, function (tab) { });
        browser.tabs.query({
            currentWindow: true
        }, async function (tabs) {
            await ColorfulTabs.sendTabsJson(tabs);
        });
    },
    onAttached(tabID, attachInfo) {
        try {
            browser.tabs.query({
                currentWindow: true
            }, function (tabs) {
                await ColorfulTabs.sendTabsJson(tabs);
            });
        } catch (e) {
            console.log('CT: ' + e);
        }
    },
    
    onDetached(tabId, detachInfo) {
        try {
            browser.tabs.query({
                currentWindow: true
            }, function (tabs) {
                await ColorfulTabs.sendTabsJson(tabs);
            });
        } catch (e) {
            console.log('CT: ' + e);
        }
    },
    onHighlighted(highlightInfo) {
        try {
            browser.tabs.query({
                currentWindow: true
            }, function (tabs) {
                await ColorfulTabs.sendTabsJson(tabs);
            });
        } catch (e) {
            console.log('CT: ' + e);
        }
    },
    onMoved(tabId, moveInfo) {
        try {
            browser.tabs.query({
                currentWindow: true
            }, function (tabs) {
                await ColorfulTabs.sendTabsJson(tabs);
            });
        } catch (e) {
            console.log('CT: ' + e);
        }
    },
    onRemoved(tabId, removeInfo) {
        try {
            browser.tabs.remove(tabId, function () {
                browser.tabs.query({
                    currentWindow: true
                }, function (tabs) {
                    tabs = tabs.filter(tab => tab.id != tabId);
                    await ColorfulTabs.sendTabsJson(tabs);
                })
            });
        } catch (e) {
            console.log('CT: ' + e);
        }

    },
    onReplaced(addedTabId, removedTabId) {
        try {
            browser.tabs.query({
                currentWindow: true
            }, function (tabs) {
                await ColorfulTabs.sendTabsJson(tabs);
            });
        } catch (e) {
            console.log('CT: ' + e);
        }
    },
    */
    onUpdated(tabId, changeInfo, tabInfo) {
        try {
            browser.tabs.query({
                currentWindow: true
            }, async function (tabs) {
                await ColorfulTabs.sendTabsJson(tabs);
            });
        } catch (e) {
            console.log('CT: ' + e);
        }
    },
    onCreated(tab) {
        //try {
        //    browser.tabs.query({
        //        currentWindow: true
        //    }, function (tabs) {
        //        await ColorfulTabs.sendTabsJson(tabs);
        //        CtUtils.counter++;
        //    });
        //} catch (e) {
        //    console.log('CT: ' + e);
        //}
    },
    sendTabs(info) {
        try {
            browser.tabs.query({
                currentWindow: true
            }, async function (tabs) {
                await ColorfulTabs.sendTabsJson(tabs);
            });
        } catch (e) {
            console.log('sendTabs: ' + e);
        }
    },
    async onRemoved(tabId, removeInfo) {
        try {
            browser.tabs.remove(tabId, async function () {
                browser.tabs.query({
                    currentWindow: true
                }, async function (tabs) {
                    tabs = tabs.filter(tab => tab.id != tabId);
                    await ColorfulTabs.sendTabsJson(tabs);
                })
            });
        } catch (e) {
            console.log('CT: ' + e);
        }

    },
    async setBadge() {
        browser.windows.getCurrent({
            populate: true
        }, async function (window) {
            browser.browserAction.setBadgeText({
                text: window.tabs.length.toString()
            });
        });
    },
    async initTheme() {
        var overridetheme = await getOption("overridetheme");

        let windowId = browser.windows.getCurrent();
        windowId.then(async function (windowId) {
            windowId = windowId.id;
            if (overridetheme == 'yes') {
                let headerColor = await getOption("accentcolor");
                headerColor = await CtUtils.anytorgb(headerColor);
                let headerImage = await CtUtils.generateImage(headerColor);
                ColorfulTabs.clrtheme.images.theme_frame = headerImage;
                let accentcolor = await CtUtils.anytorgb(await getOption("accentcolor"));
                ColorfulTabs.clrtheme.colors.frame = "rgb(" + accentcolor.r + ',' + accentcolor.g + ',' + accentcolor.b + ")";
                let textcolor = await CtUtils.anytorgb(await getOption("textcolor"));
                ColorfulTabs.clrtheme.colors.tab_background_text = "rgb(" + textcolor.r + ',' + textcolor.g + ',' + textcolor.b + ")";
                let toolbar_text = await CtUtils.anytorgb(await getOption("toolbar_text"));
                ColorfulTabs.clrtheme.colors.bookmark_text = "rgb(" + toolbar_text.r + ',' + toolbar_text.g + ',' + toolbar_text.b + ")";
                let toolbar_field = await CtUtils.anytorgb(await getOption("toolbar_field"));
                ColorfulTabs.clrtheme.colors.toolbar_field = "rgb(" + toolbar_field.r + ',' + toolbar_field.g + ',' + toolbar_field.b + ")";
                let toolbar_field_text = await CtUtils.anytorgb(await getOption("toolbar_field_text"));
                ColorfulTabs.clrtheme.colors.toolbar_field_text = "rgb(" + toolbar_field_text.r + ',' + toolbar_field_text.g + ',' + toolbar_field_text.b + ")";
                //console.log(headerColor);
                //console.log(accentcolor);
                //console.log(toolbar_text);
                //console.log(toolbar_field);
                //console.log(toolbar_field_text);
                //console.log(headerColor);
                await browser.theme.update(windowId, ColorfulTabs.clrtheme);
            } else {
                //return;
            }
        });


        //return;

    },
    clrtheme: {
        "images": {
            "theme_frame": ""
        },
        "colors": {
            "frame": "#fff",
            "tab_background_text": "#000",
            "toolbar": "rgba(255,0,0, 1)",
            "bookmark_text": "#000",
            "toolbar_field": "#fff",
            "toolbar_field_text": "#000",
        }
    },
    async updateTheme(windowId, updatedTheme) {
        var overridetheme = await getOption("overridetheme");
        try {
            if (overridetheme == 'yes') {
                await browser.theme.update(windowId, updatedTheme);
            } else {
                //await browser.theme.reset();
            }
        }
        catch (e) {
            console.dir(e);
        }
    },
    async sendFilteredTabs(j) {
        browser.runtime.sendMessage(
            browser.runtime.id, {
            tabs: j
        });
    },
    async sendTabsJson(tabs) {
        var j = JSON.parse(JSON.stringify(tabs));
        j.forEach(async (el, index, array) => {
            try {
                let host = new URL(el.url);
                if (host.hostname) {
                    host = host.hostname.toString();
                }
                else {
                    host = host.href;
                }
                //console.log('host:' + host + '  el.id:' + el.id);
                var tabClr = await CtUtils.gethsl(host, el.id);
                el.color = JSON.stringify(tabClr);
            }
            catch (e) {
                console.dir(e);
            }
            if (array.length === (index + 1)) {
                var done = await ColorfulTabs.sendFilteredTabs(j);
            }
        });

    }
}



ColorfulTabs.init();