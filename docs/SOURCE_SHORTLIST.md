# v0.1 Knowledge Base source shortlist

The first Signpost Knowledge Base should stay intentionally small. The goal is not broad Linux coverage yet; it is to prove that the agent can distinguish advice by **X11 vs Wayland context** and explain a wrong turn from the source material.

## Add these first

### 1. libinput — Ignoring specific devices

https://wayland.freedesktop.org/libinput/doc/latest/ignoring-devices.html

**Why:** Upstream documentation for deliberately excluding a specific input device through udev using `LIBINPUT_IGNORE_DEVICE`. This gives Signpost a Wayland/libinput-side path grounded in primary documentation.

### 2. libinput — Device configuration

https://wayland.freedesktop.org/libinput/doc/latest/api/group__config.html

**Why:** Primary documentation for libinput device configuration and supported configuration behavior. Useful for distinguishing what libinput itself provides from what a desktop/compositor exposes.

### 3. ArchWiki — xinput

https://wiki.archlinux.org/title/Xinput

**Why:** A concise example of the familiar `xinput` troubleshooting path. It is useful precisely because Signpost must recognize the X input stack context rather than copy the command blindly to a native Wayland session.

### 4. ArchWiki — libinput

https://wiki.archlinux.org/title/Libinput

**Why:** This page explicitly discusses different configuration paths for Wayland and Xorg and is useful for showing why settings are not automatically interchangeable across display-server contexts.

### 5. X.Org — X Input documentation

https://www.x.org/guide/extensions/

**Why:** Primary X.Org background for XInput as an X server extension. This gives the Knowledge Base stronger evidence for why an XInput-based command belongs to the X stack.

## What not to add yet

Do not add generic Linux blogs, Reddit threads, large distro documentation roots, or dozens of forum posts during the first build. They make it harder to tell whether Signpost's behavior is coming from meaningful structured retrieval or just a noisy pile of prose.

Once the Wayland/X11 benchmark works, add Fedora- and GNOME-specific sources for package names, release behavior, and desktop-level configuration.

## First benchmark

Profile:

```text
Fedora 44
GNOME
Wayland
laptop + external USB keyboard
```

Question:

> How do I disable my laptop's internal keyboard without disabling my USB keyboard?

Then change only:

```text
Wayland → X11
```

The useful result is not simply two answers. Signpost should explain why the applicability of an `xinput`-style direction changed when the session changed.
