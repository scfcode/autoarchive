// MPL/GPL
// Opera.Wang 2013/06/04
"use strict";
var EXPORTED_SYMBOLS = ["autoArchiveUtil"];

const { classes: Cc, Constructor: CC, interfaces: Ci, utils: Cu, results: Cr, manager: Cm } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource:///modules/mailServices.js");
Cu.import("resource://gre/modules/AddonManager.jsm");
Cu.import("chrome://awsomeAutoArchive/content/log.jsm");
const SEAMONKEY_ID = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}";
const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let autoArchiveUtil = {
  Name: "Awesome Auto Archive", // might get changed by getAddonByID function call
  Version: 'unknown',
  //isSeaMonkey: Services.appinfo.ID == SEAMONKEY_ID,
  //Application: Services.appinfo.name,
  initName: function() {
    autoArchiveLog.info("autoArchiveUtil initName");
    if ( this.Version != 'unknown' ) return;
    AddonManager.getAddonByID('awsomeautoarchive@opera.wang', function(addon) {
      if ( !self || !autoArchiveLog ) return;
      self.Version = addon.version;
      self.Name = addon.name;
      autoArchiveLog.info(self.Name + " " + self.Version);
    });
  },
  loadInTopWindow: function(win, url) {
    win.openDialog("chrome://messenger/content/", "_blank", "chrome,dialog=no,all", null,
      { tabType: "contentTab", tabParams: {contentPage: Services.io.newURI(url, null, null) } });
  },
  loadUseProtocol: function(url) {
    try {
      Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService).loadURI(Services.io.newURI(url, null, null), null);
    } catch (err) {
      autoArchiveLog.logException(err);
    }
  },
  loadDonate: function(pay) {
    let url = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=893LVBYFXCUP4&lc=US&item_name=" + this.Name + "&no_note=0&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHostedGuest";
    if ( typeof(pay) != 'undefined' ) {
      if ( pay == 'alipay' ) url = "https://me.alipay.com/operawang";
      if ( pay == 'mozilla' ) url = "https://addons.mozilla.org/en-US/thunderbird/addon/awesome-auto-archive/developers?src=api"; // Meet the developer page
    }
    this.loadUseProtocol(url);
  },
  sendEmailWithTB: function(url) {
    MailServices.compose.OpenComposeWindowWithURI(null, Services.io.newURI(url, null, null));
  },
  loadTab: function(args) {
    let mail3PaneWindow = Services.wm.getMostRecentWindow("mail:3pane");
    if (mail3PaneWindow) {
      let tabmail = mail3PaneWindow.document.getElementById("tabmail");
      if ( !tabmail ) return;
      mail3PaneWindow.focus();
      tabmail.openTab(args.type, args);
    }
  },
  getErrorMsg: function(pStatus) { // https://developer.mozilla.org/en/docs/Table_Of_Errors
    if ( ( pStatus & 0x80590000 ) == 0x80590000 ) { // http://dxr.mozilla.org/mozilla-central/source/xpcom/base/nsError.h
      let ldapBundle = Services.strings.createBundle('chrome://mozldap/locale/ldap.properties');
      try { return ldapBundle.GetStringFromID(pStatus & 0xff); } catch(err) {};
    } else {
      for ( let p in Cr ) {
          if ( Cr[p] == pStatus ) return p;
      }
    }
    return 'Unknown Error';
  },
  // http://stackoverflow.com/questions/4498866/actual-numbers-to-the-human-readable-values
  readablizeBytes: function(bytes) {
    if ( bytes <= 0 ) return 0;
    let s = ' KMGTPE';
    let e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + s[e];
  },
  cleanup: function() {
  },
}

let self = autoArchiveUtil;
self.initName();
