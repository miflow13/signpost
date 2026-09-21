# Signpost benchmarks

## Benchmark 001 — internal keyboard on GNOME Wayland

**Date:** 2026-09-21  
**Status:** First successful end-to-end answer  
**Profile:** Fedora 44 · GNOME · Wayland · laptop + external USB keyboard

### Question

> How do I disable my laptop's internal keyboard without disabling my USB keyboard?

### What worked

- Retrieved from the live Sanity Knowledge Base through Context MCP.
- Chose the libinput/udev direction for the Wayland profile.
- Identified `xinput disable` as a **Wrong turn** for the supplied Wayland context.
- Explained why Xorg configuration guidance does not directly govern the native Wayland input path.
- Produced all required Signpost sections: Right direction, Why it fits, Wrong turns, Confidence, Sources.

### Quality issues found

1. **Source presentation:** The response cited internal Signpost KB entry names such as `udev_and_device_management` instead of original source URLs. The system prompt now asks for original titles/URLs whenever retrieval exposes them.
2. **udev rule specificity:** The response proposed matching `ATTRS{name}` using a keyboard name. Upstream libinput's documented example uses stable vendor/model IDs plus the event-kernel match. The system prompt now prefers stable upstream-style identifiers and placeholders when the user's actual IDs are unknown.
3. **Over-broad wording:** Phrases such as "standard, compositor-agnostic" should be used only when directly supported by retrieved material.
4. **Safety/verification:** Persistent udev changes should include a verification step before retriggering/restarting devices.

### External verification

Current upstream libinput documentation explicitly states that a device with `LIBINPUT_IGNORE_DEVICE` set to a non-zero value is not initialized by libinput, and demonstrates a udev rule using `ID_VENDOR_ID`, `ID_MODEL_ID`, and `KERNEL=="event[0-9]*"`.

### Next comparison

Change **only** the session:

```text
Wayland → X11
```

Then ask the identical question. Pass condition: Signpost should materially change its applicability analysis and should no longer reject XInput solely because the user is on Wayland.
