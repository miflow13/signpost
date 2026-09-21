# 90-second judging demo

## 0–15s — Hook

"Search 'disable laptop keyboard Linux' and you'll get commands for X11, Wayland, GNOME, different distros, and random hardware. They're all presented like one answer. They aren't."

## 15–30s — Give Signpost the machine

Use a concrete profile:
- Fedora 44
- GNOME
- Wayland
- laptop + external USB keyboard

Ask: "How do I disable the built-in keyboard without disabling my USB keyboard?"

## 30–55s — Show grounded retrieval

Highlight that the answer is using the Sanity Context Knowledge Base and cites its source material.

Point out the **Wrong turns** section, especially a tempting X11-only answer.

## 55–75s — Change one variable

Switch Session from `Wayland` to `X11` and run the same question.

The useful moment: the answer changes because context changed, not because the prompt was reworded.

## 75–90s — Show Sanity doing the hard part

Open the Knowledge Base / Issues view and show a real conflicting or overlapping source decision. Explain that Sanity reconciles the corpus ahead of the agent call and keeps the source trail.

End on: "Signpost treats context as part of correctness."
