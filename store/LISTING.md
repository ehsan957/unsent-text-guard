# Store listing texts

## Name
Unsent Text Guard

## Summary (Firefox)
Never lose a long comment, reply or form answer again. Warns you before you close, reload or leave a page where you typed text you haven't sent. Text the website filled in by itself is ignored.

## Short description (Edge / Chrome)
Warns you before you close or leave a page where you typed text you haven't sent. Text the website filled in by itself is ignored.

## Description
```
You spend ten minutes writing a reply, then press the wrong key, click a link or close the tab, and everything is gone. Many websites don't warn you.

Unsent Text Guard does. When you have typed text into a text box and haven't sent it yet, the browser asks "Leave page?" before the text is lost.

ONLY WHAT YOU TYPED COUNTS
• Text the website puts in a box itself (placeholder text, saved values, restored drafts, autofill) is never counted. Only text you typed or pasted.
• Short typing is ignored: by default you need at least 20 characters (spaces not counted). You can change this.
• Password fields are ignored.

NO FALSE ALARMS AFTER SENDING
• Submitting a form counts as sending.
• If the site clears or removes the box after posting (chats, comments), the text counts as sent.

WORKS EVERYWHERE YOU WRITE
• Comment boxes, forums, contact forms, support tickets, emails, chats.
• Normal text fields and rich editors.

YOUR CONTROL
• The toolbar button shows how many boxes on the current page have unsent text.
• Turn the guard off for any site with one click.

PRIVACY
Your text never leaves the page. The extension does not store, read out or send what you type. It only compares the length of what you typed with what was there before. Only your two settings (minimum length and sites you turned off) are saved.

Note: Browsers don't allow extensions to change the text of the "Leave page?" dialog, so you'll see the browser's standard message.
```

## Screenshot captions
1. Warns you before you close or leave a page with text you haven't sent.
2. Text the website filled in is ignored. Only what you typed counts.
3. See what's unsent, choose the minimum length, and turn the guard off for any site.

## Categories, tags, search terms
- Firefox: Alerts & Updates, Social & Communication · tags: chat, social media
- Edge: Productivity · search terms: lost text, unsaved form, leave page warning, draft protection, accidental tab close, comment saver, form guard

## Notes to reviewer / certification
```
Purpose: shows the browser's standard beforeunload dialog only when the user has typed unsent text into a text field.

• No build step, no minified or third-party code. All files are plain, hand-written JavaScript.
• No network requests, no remote code, no background script.

Why the content script runs on <all_urls>:
The extension must know whether the user typed into a text field on any site. content.js only:
  – listens to trusted "beforeinput" events to record a field's existing text just before the user's first keystroke (so page-provided text is never counted),
  – listens to "submit" events to treat submitted fields as sent,
  – adds a "beforeunload" listener that calls preventDefault() only if a visible field contains at least N user-typed characters.
Field contents stay in memory only and are never stored or sent anywhere. Password fields are excluded.

Permissions:
  – storage: saves two settings (minimum character count and a list of sites where the guard is turned off).

popup.js asks the current tab's content script for a status count via runtime messaging and uses no innerHTML.
Firefox: data_collection_permissions is set to "none".

How to test:
1. Open https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_textarea (the result frame has a prefilled textarea).
2. Close the tab without typing: no dialog (prefilled text is ignored).
3. Type a sentence of 20+ characters into the textarea, then close the tab or reload: the dialog appears.

Developer: Ehsan Shariaty, ehsan.shariaty@gmail.com
```

## Chrome Web Store privacy fields
- **Single purpose:** Warns the user before they close, reload or leave a web page where they typed text into a text box that they haven't sent yet, so they don't lose it. Text the website filled in by itself is ignored.
- **storage:** Saves two user settings: the minimum number of typed characters before a warning is shown, and the list of websites where the user turned the guard off. No text the user types and no personal data is ever stored.
- **Host permissions (content script on all sites):** The content script must run on every website because the user can type a reply, comment or form answer on any site, and the extension cannot know in advance where. On each page it only watches the user's own typing events in text fields and compares how much text was typed with what was there before. If unsent text exists when the user tries to leave, it triggers the browser's standard "Leave site?" dialog. The text is never stored, read out or sent anywhere.
- **Remote code:** No · **Data usage:** none collected
