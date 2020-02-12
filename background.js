'use strict';
var ColorfulTabs = {
    async init() {
        //ColorfulTabs.initTheme();

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

        //Update theme
        browser.tabs.onActivated.addListener(async (activeInfo) => {
            console.log('onActivated');
            await browser.tabs.get(activeInfo.tabId, async (tab) => {

                let host = new URL(tab.url);
                if (host.hostname) {
                    host = host.hostname.toString();
                }
                else {
                    host = host.href;
                }
                let tabClr;
                try {
                    tabClr = await CtUtils.gethsl(host, tab.id); //ColorfulTabs.genTabClr(host); // 'hsl(' + Math.abs(ColorfulTabs.clrHash(host)) % 360 + ',' + sat + '%,' + lum + '%)';
                    //await ColorfulTabs.updateTheme(tab.windowId, tabClr);
                    tabClr = 'hsl(' + tabClr.h + ',' + tabClr.s + '%,' + tabClr.l + '%)';
                }
                catch (e) {
                    console.log('tabClr err in bg.s' + e);
                }
                
            });
        });

        browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
            console.log('onUpdated');
            if (changeInfo.status != "complete") {
                //return;
            }
            await browser.tabs.get(tabId, async (tab) => {
                let host = new URL(tab.url);
                if (host.hostname) {
                    host = host.hostname.toString();
                }
                else {
                    host = host.href;
                }
                let tabClr;
                try {
                    tabClr = await CtUtils.gethsl(host, tab.id); //ColorfulTabs.genTabClr(host); // 'hsl(' + Math.abs(ColorfulTabs.clrHash(host)) % 360 + ',' + sat + '%,' + lum + '%)';
                    await ColorfulTabs.updateTheme(tab.windowId, tabClr);
                    tabClr = 'hsl(' + tabClr.h + ',' + tabClr.s + '%,' + tabClr.l + '%)';
                }
                catch (e) {
                    console.log('tabClr err in bg.s' + e);
                }
                
            });
        });

        // Initial tabs + handler for sidebar action clicks
        browser.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                //console.log('request');
                //console.dir(request);
                //console.log('sender');
                //console.dir(sender);
                //console.log('sendResponse');
                //console.dir(sendResponse);

                if (request.initialized) {
                    ColorfulTabs.sendTabs(request, sender, sendResponse);
                }
                if (request.select) {
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

        browser.tabs.onCreated.addListener(ColorfulTabs.setBadge);
        browser.tabs.onAttached.addListener(ColorfulTabs.setBadge);
        browser.tabs.onDetached.addListener(ColorfulTabs.setBadge);
        browser.tabs.onRemoved.addListener(ColorfulTabs.setBadge);

        browser.tabs.onUpdated.addListener(ColorfulTabs.onUpdated);
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

    onUpdated(tabId, changeInfo, tabInfo) {
        try {
            //console.dir(tabInfo);
            browser.tabs.query({
                currentWindow: true
            }, async function (tabs) {
                await ColorfulTabs.sendTabsJson(tabs);
            });
        } catch (e) {
            console.log('CT: ' + e);
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

    async sendFilteredTabs(j) {
        var gettingCurrent = await browser.windows.getCurrent(
        );
        //console.dir('current bg window id:' + gettingCurrent.id);

        browser.runtime.sendMessage(
            browser.runtime.id, {
            tabs: j,
            winId: gettingCurrent.id
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
        console.log(overridetheme);
        if (overridetheme == 'yes') { } else {
            return;
        }
        let headerColor = await getOption("accentcolor");
        headerColor = await CtUtils.anytorgb(headerColor);

        let headerImage = await CtUtils.generateImage(headerColor);
        ColorfulTabs.clrtheme.images.theme_frame = headerImage;

        let accentcolor = await CtUtils.anytorgb(await getOption("accentcolor"));
        accentcolor = await CtUtils.rgbtohsl(accentcolor.r, accentcolor.g, accentcolor.b);
        ColorfulTabs.clrtheme.colors.frame = "rgb(" + accentcolor + ")";

        let textcolor = await CtUtils.anytorgb(await getOption("textcolor"));
        textcolor = await CtUtils.rgbtohsl(textcolor.r, textcolor.g, textcolor.b);
        ColorfulTabs.clrtheme.colors.tab_background_text = "rgb(" + textcolor + ")";

        let toolbar_text = await CtUtils.anytorgb(await getOption("toolbar_text"));
        toolbar_text = await CtUtils.rgbtohsl(toolbar_text.r, toolbar_text.g, toolbar_text.b);
        ColorfulTabs.clrtheme.colors.bookmark_text = "rgb(" + toolbar_text + ")";

        let toolbar_field = await CtUtils.anytorgb(await getOption("toolbar_field"));
        toolbar_field = await CtUtils.rgbtohsl(toolbar_field.r, toolbar_field.g, toolbar_field.b);
        ColorfulTabs.clrtheme.colors.toolbar_field = "rgb(" + toolbar_field + ")";

        let toolbar_field_text = await CtUtils.anytorgb(await getOption("toolbar_field_text"));
        toolbar_field_text = await CtUtils.rgbtohsl(toolbar_field_text.r, toolbar_field_text.g, toolbar_field_text.b);
        ColorfulTabs.clrtheme.colors.toolbar_field_text = "rgb(" + toolbar_field_text + ")";
        //await ColorfulTabs.updateTheme(windowId, ColorfulTabs.clrtheme);

    },

    async updateTheme(windowId, tabClr) {
        
        //ColorfulTabs.clrtheme.colors.toolbar = tabClr;
        //await ColorfulTabs.updateTheme(tab.windowId, ColorfulTabs.clrtheme);
        var overridetheme = await getOption("overridetheme");
        if (overridetheme == 'yes') {
            ColorfulTabs.clrtheme.colors.toolbar = 'hsl(' + tabClr.h + ',' + tabClr.s + '%,' + tabClr.l + '%)';;
            let headerImage = await CtUtils.generateImage(tabClr);
            //let headerImage = await CtUtils.generateImage({h:0,s:100,l:50});
            ColorfulTabs.clrtheme.images.theme_frame = headerImage;
            //ColorfulTabs.clrtheme.colors.frame = 'hsla(' + tabClr.h + ',' + tabClr.s + '%,90%,.5)';
            console.dir(ColorfulTabs.clrtheme);
            await browser.theme.update(windowId, ColorfulTabs.clrtheme);
        } else {
            //await browser.theme.reset();
        }
    },

    clrtheme: {
        "images": {
            "theme_frame": ""
        },
        "colors": {
            //"frame": "#fff",
            //"tab_background_text": "#000",
            "toolbar": "",
            //"bookmark_text": "#000",
            //"toolbar_field": "#fff",
            //"toolbar_field_text": "#000",
        }
    },
}

ColorfulTabs.init();